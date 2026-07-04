/**
 * Why this file exists:
 * This component renders the call controls toolbar (mute mic, disable video, answer call,
 * reject call, and hang up call).
 *
 * When it is executed:
 * Executed and displayed at the bottom of the video calling card layer.
 *
 * Which other files use it:
 * Imported and placed beneath the video viewport inside src/pages/Home.tsx.
 *
 * How it fits into the WebRTC signaling flow:
 * It triggers local operations (like muting audio tracks or disabling video feeds)
 * and signaling-level operations (like initiating hangup commands, accepting offers,
 * or sending reject events back to the server).
 */
import { Box, IconButton, Tooltip, Button } from "@mui/material";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

export const Controls = ({
  callStatus,
  isAudioMuted,
  isVideoMuted,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  onRejectCall,
  onAcceptCall,
}) => {
  const isCallActive = callStatus !== "idle";
  const isConnected = callStatus === "connected";
  const isIncoming = callStatus === "incoming";
  const isCalling = callStatus === "calling";

  if (!isCallActive) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        bgcolor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        p: 2,
        px: 3,
        borderRadius: 3,
        border: "1px solid rgba(226,232,240,.6)",
        boxShadow: 6,
        maxWidth: 500,
        width: "100%",
        mx: "auto",
        transition: "all .3s",
      }}
    >
      {/* Microphone */}
      {(isConnected || isCalling) && (
        <Tooltip title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}>
          <IconButton
            id="btn-toggle-audio"
            onClick={onToggleAudio}
            sx={{
              width: 48,
              height: 48,
              border: "1px solid",
              transition: "all .2s",
              bgcolor: isAudioMuted ? "#fff1f2" : "#f8fafc",
              color: isAudioMuted ? "#e11d48" : "#475569",
              borderColor: isAudioMuted ? "#fecdd3" : "#e2e8f0",
              "&:hover": {
                bgcolor: isAudioMuted ? "#ffe4e6" : "#f1f5f9",
              },
            }}
          >
            {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </IconButton>
        </Tooltip>
      )}

      {/* Camera */}
      {(isConnected || isCalling) && (
        <Tooltip title={isVideoMuted ? "Enable Camera" : "Disable Camera"}>
          <IconButton
            id="btn-toggle-video"
            onClick={onToggleVideo}
            sx={{
              width: 48,
              height: 48,
              border: "1px solid",
              transition: "all .2s",
              bgcolor: isVideoMuted ? "#fff1f2" : "#f8fafc",
              color: isVideoMuted ? "#e11d48" : "#475569",
              borderColor: isVideoMuted ? "#fecdd3" : "#e2e8f0",
              "&:hover": {
                bgcolor: isVideoMuted ? "#ffe4e6" : "#f1f5f9",
              },
            }}
          >
            {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
          </IconButton>
        </Tooltip>
      )}

      {/* Incoming Call Buttons */}
      {isIncoming && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <Button
            id="btn-accept-call"
            variant="contained"
            color="success"
            startIcon={<Phone size={16} />}
            onClick={onAcceptCall}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "uppercase",
              fontSize: 12,
              letterSpacing: 1,
              boxShadow: 2,
            }}
          >
            Answer Call
          </Button>

          <Button
            id="btn-reject-call"
            variant="contained"
            color="error"
            startIcon={<PhoneOff size={16} />}
            onClick={onRejectCall}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "uppercase",
              fontSize: 12,
              letterSpacing: 1,
              boxShadow: 2,
            }}
          >
            Reject Call
          </Button>
        </Box>
      )}

      {/* Hangup */}
      {(isConnected || isCalling) && (
        <Tooltip title="End Call">
          <IconButton
            id="btn-end-call"
            onClick={onEndCall}
            sx={{
              width: 48,
              height: 48,
              bgcolor: "#ef4444",
              color: "#fff",
              border: "1px solid #f87171",
              transition: "all .2s",
              boxShadow: 3,
              "&:hover": {
                bgcolor: "#dc2626",
                transform: "rotate(135deg)",
              },
            }}
          >
            <PhoneOff size={20} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
