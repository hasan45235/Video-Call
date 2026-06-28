/**
 * Why this file exists:
 * This component renders the sidebar user list, displaying all other online users registered
 * on the socket signaling server.
 *
 * When it is executed:
 * Executed and updated in real-time whenever the USER_LIST_UPDATE socket event triggers from the backend.
 *
 * Which other files use it:
 * Imported and placed on the left side of the primary layout grid in src/pages/Home.tsx.
 *
 * How it fits into the WebRTC signaling flow:
 * It provides the entrypoints for calling. Clicking "Call" on any user launches the WebRTC call sequence,
 * querying the target user's socket.id and initiating the initial SDP Offer exchange.
 */

import React from "react";
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Paper } from "@mui/material";
import { User, Video, CircleDot } from "lucide-react";


export const UserList = ({
  users,
  currentUserId,
  onCallUser,
  callStatus,
}) => {
  // Filter out the current user from the list
  const otherUsers = users.filter((u) => u.id !== currentUserId);
  const isInCall = callStatus !== "idle";


    return (
  <Paper
    sx={{
      bgcolor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 4,
      p: 3,
      boxShadow: 1,
      height: "100%",
      minHeight: 400,
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Header */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f1f5f9",
        pb: 2,
        mb: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#1e293b",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        Online Users
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.5,
          bgcolor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "999px",
          color: "#15803d",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <CircleDot size={14} />
        {otherUsers.length} Active
      </Box>
    </Box>

    {/* User List */}
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        pr: 1,
        maxHeight: "50vh",
      }}
    >
      {otherUsers.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 8,
            color: "#94a3b8",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <User size={24} />
          </Avatar>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                color: "#475569",
                fontWeight: 600,
              }}
            >
              Waiting for others...
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "#94a3b8",
                mt: 1,
                display: "block",
                maxWidth: 200,
                mx: "auto",
              }}
            >
              No other users are currently online. Share this link with a
              friend to test calling!
            </Typography>
          </Box>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {otherUsers.map((user, index) => (
            <ListItem
              key={user.id}
              divider={index !== otherUsers.length - 1}
              sx={{
                px: 0,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <ListItemAvatar sx={{ minWidth: 0 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "#eff6ff",
                      color: "#2563eb",
                      fontWeight: 700,
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  sx={{ m: 0 }}
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#334155",
                        fontWeight: 700,
                      }}
                    >
                      {user.username}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#94a3b8",
                        fontFamily: "monospace",
                      }}
                    >
                      {user.id.substring(0, 8)}...
                    </Typography>
                  }
                />
              </Box>

              <Button
                id={`btn-call-${user.id}`}
                variant="contained"
                size="small"
                disabled={isInCall}
                startIcon={<Video size={16} />}
                onClick={() => onCallUser(user.id, user.username)}
                sx={{
                  px: 2,
                  py: 0.8,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: "none",
                  bgcolor: "#2563eb",
                  border: "1px solid #1d4ed8",
                  boxShadow: 1,
                  "&:hover": {
                    bgcolor: "#1d4ed8",
                  },
                  "&.Mui-disabled": {
                    opacity: 0.4,
                  },
                }}
              >
                Call
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  </Paper>
);
};
