/**
 * Why this file exists:
 * This file encapsulates the configuration and creation of standard RTCPeerConnection objects.
 *
 * When it is executed:
 * Executed every time a new WebRTC peer-to-peer call is initiated or answered.
 *
 * Which other files use it:
 * Used by src/hooks/useWebRTC.ts to create new peer connection instances.
 *
 * How it fits into the WebRTC signaling flow:
 * Sets up the RTC connection with Google's public STUN servers. These STUN servers discover
 * public IP addresses and ports for each user, allowing WebRTC media (video and audio)
 * to stream directly between browsers without going through the server.
 */

// Google's public STUN servers for NAT traversal and candidate discovery
const RTC_CONFIG = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
  ],
};

/**
 * Factory function to create a new, pre-configured RTCPeerConnection
 */
export function createPeerConnection() {
  return new RTCPeerConnection(RTC_CONFIG);
}
