/**
 * Why this file exists:
 * This component displays a pop-up modal dialog alert whenever another user is calling.
 *
 * When it is executed:
 * Executed and displayed automatically on top of all other components when an
 * INCOMING_CALL socket event occurs and callState is 'incoming'.
 *
 * Which other files use it:
 * Imported and placed in the primary render layout of src/pages/Home.tsx.
 *
 * How it fits into the WebRTC signaling flow:
 * It holds the WebRTC offer. When accepted, it triggers the creation of the Answer
 * description and starts local media streaming; when rejected, it sends a reject
 * event to notify the caller.
 */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import { Phone, PhoneOff, Video } from "lucide-react";

export const IncomingCallDialog = ({
  open,
  offererName,
  onAccept,
  onReject,
}) => {
  return (
    <Dialog
      id="incoming-call-dialog"
      open={open}
      onClose={(event, reason) => {
        // Prevent closing by clicking outside or pressing Escape
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          onReject();
        }
      }}
      PaperProps={{
        sx: {
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 4,
          p: 1,
          boxShadow: 8,
          width: "100%",
          maxWidth: 380,
        },
      }}
    >
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: 3,
        }}
      >
        {/* Animated Camera Icon */}
        <Box
          sx={{
            position: "relative",
            mb: 4,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              bgcolor: "rgba(37,99,235,0.2)",
              animation: "pulse 1.8s infinite",
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(1)",
                  opacity: 0.8,
                },
                "100%": {
                  transform: "scale(1.8)",
                  opacity: 0,
                },
              },
            }}
          />

          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#2563eb",
              border: "4px solid white",
              position: "relative",
              zIndex: 1,
              boxShadow: 3,
            }}
          >
            <Video size={40} color="white" />
          </Avatar>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#1e293b",
            letterSpacing: "-0.5px",
          }}
        >
          {offererName}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Incoming Video Call...
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          px: 3,
          pb: 3,
        }}
      >
        <Button
          id="dialog-reject-btn"
          variant="contained"
          color="error"
          startIcon={<PhoneOff size={16} />}
          onClick={onReject}
          fullWidth
          sx={{
            borderRadius: 3,
            py: 1.3,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: 1,
          }}
        >
          Decline
        </Button>

        <Button
          id="dialog-accept-btn"
          variant="contained"
          onClick={onAccept}
          startIcon={<Phone size={16} />}
          fullWidth
          sx={{
            bgcolor: "#2563eb",
            "&:hover": {
              bgcolor: "#1d4ed8",
            },
            borderRadius: 3,
            py: 1.3,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: 1,
          }}
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};