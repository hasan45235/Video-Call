/**
 * Why this file exists:
 * This custom hook encapsulates the entire WebRTC state machine and peer-to-peer negotiation
 * logic. It manages camera/microphone streams, the RTCPeerConnection lifecycle, and coordinates
 * signaling events with the server.
 *
 * When it is executed:
 * Executed in the Home page component to provide call controls, stream references, and status updates.
 *
 * Which other files use it:
 * Used by src/pages/Home.tsx to power the video calling UI, buttons, and video canvas layers.
 *
 * How it fits into the WebRTC signaling flow:
 * It is the core WebRTC orchestrator. It creates SDP Offers and Answers, processes incoming remote
 * descriptions, gathers local ICE candidates to emit over Socket.IO, and binds the incoming remote
 * media tracks to the HTML video element.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import { createPeerConnection } from "../services/peerConnection";
import { SOCKET_EVENTS } from "../utils/constants";


export function useWebRTC() {
  const { socket, registeredUser } = useSocket();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [activePeer, setActivePeer] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [webrtcError, setWebrtcError] = useState(null);

  // Refs to avoid React stale closure issues with WebRTC callbacks
  const peerConnectionRef = useRef(null);
  const activePeerIdRef = useRef(null);
  const localStreamRef = useRef(null);

  // Synchronize state to ref
  useEffect(() => {
    activePeerIdRef.current = activePeer ? activePeer.id : null;
  }, [activePeer]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  /**
   * Safe clean-up of Peer Connection and Streams
   */
  const cleanupCall = useCallback(() => {
    console.log("Cleaning up WebRTC resources...");

    // Close PeerConnection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop remote stream tracks
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    // Stop local stream tracks (Standard privacy behavior: release camera/mic when idle)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    setCallStatus("idle");
    setActivePeer(null);
    setIncomingCall(null);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
  }, [remoteStream]);

  /**
   * Acquire camera and microphone stream
   */
  const acquireLocalMedia = async () => {
    // If we already have a stream, reuse it
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    try {
      console.log("Requesting camera and microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing user media devices:", error);
      let errorMsg = "Could not access camera/microphone. Please ensure you have granted permissions.";
      if (error.name === "NotAllowedError") {
        errorMsg = "Camera/microphone permission denied. Please grant permission in browser settings.";
      } else if (error.name === "NotFoundError") {
        errorMsg = "No camera or microphone devices found on this machine.";
      }
      setWebrtcError(errorMsg);
      throw error;
    }
  };

  /**
   * Initialize RTCPeerConnection and bind common event handlers
   */
  const initPeerConnection = useCallback((stream, peerId) => {
    console.log("Initializing RTCPeerConnection...");
    const pc = createPeerConnection();
    activePeerIdRef.current = peerId;

    // 1. Attach local tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // 2. Handle ICE candidate events (Relay them to peer)
    pc.onicecandidate = (event) => {
      if (event.candidate && activePeerIdRef.current) {
        console.log("Sending ICE candidate to peer:", activePeerIdRef.current);
        socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
          to: activePeerIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    // 3. Handle Remote track incoming
    pc.ontrack = (event) => {
      console.log("Received remote stream/track:", event.streams[0]);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // 4. Handle ICE Connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", pc.iceConnectionState);
      if (
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "closed"
      ) {
        console.log("ICE Connection terminated, clean up.");
        cleanupCall();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, cleanupCall]);

  /**
   * Initiate Call to another user
   */
  const callUser = async (targetUserId, targetUsername) => {
    if (!registeredUser) return;
    setWebrtcError(null);
    setActivePeer({ id: targetUserId, username: targetUsername });

    try {
      const stream = await acquireLocalMedia();
      const pc = initPeerConnection(stream);
      setCallStatus("calling");

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log(`Sending WebRTC SDP Offer to ${targetUsername} `);
      socket.emit(SOCKET_EVENTS.CALL_USER, {
        to: targetUserId,
        offer,
      });
    } catch (error) {
      console.error("Failed to initiate call:", error);
      cleanupCall();
    }
  };

  /**
   * Accept an incoming call
   */
  const acceptCall = async () => {
    if (!incomingCall) return;
    setWebrtcError(null);
    setCallStatus("connected");

    try {
      const stream = await acquireLocalMedia();
      const pc = initPeerConnection(stream, incomingCall.from);

      // Set remote SDP description (the offer)
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

      // Create answer and set local description
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log(`Answering call. Sending SDP Answer to ${incomingCall.offererName}`);
      socket.emit(SOCKET_EVENTS.ANSWER_CALL, {
        to: incomingCall.from,
        answer,
      });

      setIncomingCall(null);
    } catch (error) {
      console.error("Failed to accept call:", error);
      cleanupCall();
    }
  };

  /**
   * Reject an incoming call
   */
  const rejectCall = () => {
    if (!incomingCall) return;
    console.log("Rejecting incoming call from:", incomingCall.offererName);
    socket.emit(SOCKET_EVENTS.REJECT_CALL, {
      to: incomingCall.from,
    });
    cleanupCall();
  };

  /**
   * Manually end/hangup an active call
   */
  const endCall = () => {
    const peerId = activePeerIdRef.current;
    if (peerId) {
      console.log("Hanging up call with peer:", peerId);
      socket.emit(SOCKET_EVENTS.END_CALL, {
        to: peerId,
      });
    }
    cleanupCall();
  };

  /**
   * Toggle Audio (Mute / Unmute Microphone)
   */
  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks[0].enabled = nextState;
        setIsAudioMuted(!nextState);
      }
    }
  };

  /**
   * Toggle Video (Enable / Disable Camera)
   */
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks[0].enabled = nextState;
        setIsVideoMuted(!nextState);
      }
    }
  };

  /**
   * Socket signaling lifecycle handlers
   */
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming calls
    const onIncomingCall = (data) => {
      console.log(`Received incoming call from ${data.offererName}`);
      if (callStatus !== "idle") {
        // Busy - auto-reject or ignore
        socket.emit(SOCKET_EVENTS.REJECT_CALL, { to: data.from });
        return;
      }
      setIncomingCall(data);
      setCallStatus("incoming");
      setActivePeer({ id: data.from, username: data.offererName });
    };

    // Listen for offerer call accepted (receive answer)
    const onCallAccepted = async (data) => {
      console.log("Call accepted! Setting remote answer description.");
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          setCallStatus("connected");
        } catch (error) {
          console.error("Failed to set remote answer description:", error);
          cleanupCall();
        }
      }
    };

    // Listen for call rejected by the peer
    const onCallRejected = () => {
      console.log("Your call was rejected by the peer.");
      setWebrtcError("The call was rejected by the user.");
      cleanupCall();
    };

    // Listen for remote ICE Candidate
    const onIceCandidate = async (data) => {
      console.log("Received remote ICE candidate from peer.");
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error("Failed to add remote ICE candidate:", error);
        }
      }
    };

    // Listen for call termination from the other peer
    const onCallEnded = () => {
      console.log("The remote peer hung up the call.");
      setWebrtcError("The call has ended.");
      cleanupCall();
    };

    socket.on(SOCKET_EVENTS.INCOMING_CALL, onIncomingCall);
    socket.on(SOCKET_EVENTS.CALL_ACCEPTED, onCallAccepted);
    socket.on(SOCKET_EVENTS.CALL_REJECTED, onCallRejected);
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, onIceCandidate);
    socket.on(SOCKET_EVENTS.CALL_ENDED, onCallEnded);

    return () => {
      socket.off(SOCKET_EVENTS.INCOMING_CALL, onIncomingCall);
      socket.off(SOCKET_EVENTS.CALL_ACCEPTED, onCallAccepted);
      socket.off(SOCKET_EVENTS.CALL_REJECTED, onCallRejected);
      socket.off(SOCKET_EVENTS.ICE_CANDIDATE, onIceCandidate);
      socket.off(SOCKET_EVENTS.CALL_ENDED, onCallEnded);
    };
  }, [socket, callStatus, cleanupCall]);

  return {
    localStream,
    remoteStream,
    callStatus,
    activePeer,
    incomingCall,
    isAudioMuted,
    isVideoMuted,
    webrtcError,
    setWebrtcError,
    callUser,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    cleanupCall
  };
}
