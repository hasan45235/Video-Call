/**
 * Why this file exists:
 * This file implements a React Context that wraps the Socket.IO client instance, managing
 * connection state, list of connected users, registration status, and error states.
 *
 * When it is executed:
 * Executed when the app starts, maintaining a persistent WebSocket connection lifecycle
 * throughout the user's session.
 *
 * Which other files use it:
 * Used by src/main.tsx or src/App.tsx to provide the context, and by custom hooks
 * (such as src/hooks/useSocket.ts) to consume the socket state.
 *
 * How it fits into the WebRTC signaling flow:
 * It handles the user presence layer. It listens for socket connect/disconnects, triggers
 * username registration, and listens for the 'user-list-update' event, letting the user see
 * who is available to call before any WebRTC peer negotiation starts.
 */

import { createContext, useEffect, useState } from "react";
import { socket } from "../services/socket";
import { SOCKET_EVENTS } from "../utils/constants";

// This context intentionally shares the provider's public module.
// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext(null);


export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(() => socket.connected);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [registerError, setRegisterError] = useState(null);

  useEffect(() => {
    // Explicitly connect when the provider mounts
    socket.connect();

    const onConnect = () => {
      setIsConnected(true);
      console.log("Socket.IO client connected:", socket.id);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setRegisteredUser(null);
      console.log("Socket.IO client disconnected");
    };

    const onRegisterSuccess = (user) => {
      setRegisteredUser(user);
      setRegisterError(null);
    };

    const onRegisterError = (errorMsg) => {
      setRegisterError(errorMsg);
    };

    const onUserListUpdate = (users) => {
      // Filter out ourself from the list of users we can call
      setOnlineUsers(users);
    };

    // Attach listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("register-success", onRegisterSuccess);
    socket.on("register-error", onRegisterError);
    socket.on(SOCKET_EVENTS.USER_LIST_UPDATE, onUserListUpdate);

    return () => {
      // Clean up event listeners on unmount
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("register-success", onRegisterSuccess);
      socket.off("register-error", onRegisterError);
      socket.off(SOCKET_EVENTS.USER_LIST_UPDATE, onUserListUpdate);
      socket.disconnect();
    };
  }, []);

  const registerUsername = (username) => {
    if (socket.connected) {
      setRegisterError(null);
      socket.emit(SOCKET_EVENTS.REGISTER_USER, username);
    } else {
      setRegisterError("Signaling server is disconnected. Please wait and try again.");
    }
  };

  const resetRegisterError = () => {
    setRegisterError(null);
  };

  const logoutUser = () => {
    setRegisteredUser(null);
    setOnlineUsers([]);
    setRegisterError(null);

    // Disconnect so the signaling server immediately removes this user,
    // then reconnect anonymously so another username can be entered.
    socket.disconnect();
    socket.connect();
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        registeredUser,
        onlineUsers,
        registerError,
        registerUsername,
        resetRegisterError,
        logoutUser,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
