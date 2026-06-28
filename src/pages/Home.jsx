/**
 * Why this file exists:
 * This is the master Page component that unites the registration view, user directory,
 * video players, calling controls, and dialog notification overlays.
 *
 * When it is executed:
 * Executed as the primary page content when the client application mounts.
 *
 * Which other files use it:
 * Imported and rendered in src/App.tsx.
 *
 * How it fits into the WebRTC signaling flow:
 * It binds the Socket context and WebRTC custom hook together. It feeds stream states
 * into the VideoPlayer, triggers dialing methods on UserList select, and mounts the
 * IncomingCallDialog pop-up to capture incoming SDP Offers.
 */

import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Alert,
  Snackbar,
  Card,
  Avatar,
  TextField,
  Grid,
} from "@mui/material";
import { Video, UserPlus, Info, CheckCircle2, Wifi, LogOut } from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { UserList } from "../components/UserList";
import { VideoPlayer } from "../components/VideoPlayer";
import { Controls } from "../components/Controls";
import { IncomingCallDialog } from "../components/IncomingCallDialog";

export const Home = () => {
  const {
    isConnected,
    registeredUser,
    onlineUsers,
    registerError,
    registerUsername,
    resetRegisterError,
  } = useSocket();

  const {
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
  } = useWebRTC();

  const [inputUsername, setInputUsername] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    const trimmed = inputUsername.trim();
    if (trimmed) {
      registerUsername(trimmed);
    }
  };

  const handleCallInitiation = (targetId, targetUsername) => {
    callUser(targetId, targetUsername);
  };

  const isCallConnected = callStatus === "connected";

  // Render Login/Username prompt if not joined yet
  if (!registeredUser) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f8fafc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <Card
          elevation={4}
          sx={{
            width: "100%",
            maxWidth: 450,
            p: 4,
            borderRadius: 4,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background Glow */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 260,
              height: 100,
              background:
                "linear-gradient(to bottom, rgba(25,118,210,0.08), transparent)",
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              mb: 4,
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "primary.main",
                boxShadow: 3,
              }}
            >
              <Video size={30} />
            </Avatar>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ mt: 2 }}
            >
              WebRTC.io
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Clean, minimal, one-to-one secure video calls.
            </Typography>
          </Box>

          {/* Join Form */}
          <Box
            component="form"
            onSubmit={handleJoin}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <TextField
              id="username-input"
              label="Choose a Username"
              placeholder="e.g. Sarah J."
              variant="outlined"
              fullWidth
              required
              autoFocus
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
            />

            {registerError && (
              <Alert severity="error">
                {registerError}
              </Alert>
            )}

            <Button
              id="join-btn"
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              startIcon={<UserPlus size={20} />}
              sx={{
                py: 1.6,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Enter Dashboard
            </Button>
          </Box>

          {/* Connection Status */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              mt: 3,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: isConnected ? "success.main" : "error.main",
                boxShadow: isConnected ? "0 0 8px rgba(76, 175, 80, 0.7)" : "none",
              }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              {isConnected
                ? "CONNECTED TO SIGNALING SERVER"
                : "SERVER DISCONNECTED"}
            </Typography>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        pb: 4,
      }}
    >
      {/* ===================== APP BAR ===================== */}
      <AppBar
        position="static"
        elevation={1}
        sx={{
          bgcolor: "#fff",
          color: "#1e293b",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              display: "flex",
              justifyContent: "space-between",
              py: 1,
            }}
          >
            {/* Left */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 38,
                  height: 38,
                }}
              >
                <Video size={20} />
              </Avatar>

              <Typography
                variant="h6"
                fontWeight={700}
              >
                WebRTC.io
              </Typography>

              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "flex",
                  },
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "#ECFDF5",
                  color: "#047857",
                  border: "1px solid #A7F3D0",
                  borderRadius: 5,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <Wifi size={14} />

                <Typography
                  variant="caption"
                  fontWeight={700}
                >
                  LIVE
                </Typography>
              </Box>
            </Box>

            {/* Right */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: 26,
                    height: 26,
                    fontSize: 12,
                    bgcolor: "primary.main",
                  }}
                >
                  {registeredUser.username.charAt(0).toUpperCase()}
                </Avatar>

                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{
                    maxWidth: 130,
                  }}
                >
                  {registeredUser.username} (Me)
                </Typography>
              </Box>

              <Button
                id="btn-logout"
                variant="outlined"
                size="small"
                startIcon={<LogOut size={16} />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Exit
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ===================== DASHBOARD ===================== */}

      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          mt: 4,
        }}
      >
        <Grid
          container
          spacing={4}
        >
          {/* Sidebar */}
          <Grid size={{ xs: 12, lg: 4, xl: 3 }}>
            <UserList
              users={onlineUsers}
              currentUserId={registeredUser.id}
              onCallUser={handleCallInitiation}
              callStatus={callStatus}
            />
          </Grid>

          {/* Main */}

          <Grid size={{ xs: 12, lg: 8, xl: 9 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                height: "100%",
              }}
            >
              <VideoPlayer
                localStream={localStream}
                remoteStream={remoteStream}
                callStatus={callStatus}
                activePeer={activePeer}
                registeredUser={registeredUser}
                isVideoMuted={isVideoMuted}
                isAudioMuted={isAudioMuted}
              />

              <Controls
                callStatus={callStatus}
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
                onEndCall={endCall}
                onRejectCall={rejectCall}
                onAcceptCall={acceptCall}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ===================== DIALOG ===================== */}

      <IncomingCallDialog
        open={callStatus === "incoming" && !!incomingCall}
        offererName={incomingCall?.offererName || "Someone"}
        onAccept={acceptCall}
        onReject={rejectCall}
      />

      {/* ===================== ERROR ===================== */}

      <Snackbar
        open={!!webrtcError}
        autoHideDuration={6000}
        onClose={() => setWebrtcError(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity="info"
          onClose={() => setWebrtcError(null)}
          sx={{
            borderRadius: 2,
            bgcolor: "#0f172a",
            color: "#fff",
            alignItems: "center",
          }}
        >
          {webrtcError}
        </Alert>
      </Snackbar>
    </Box>
  );
};
