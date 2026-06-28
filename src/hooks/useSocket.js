/**
 * Why this file exists:
 * This custom hook abstracts the use of SocketContext, enabling any child component
 * to easily retrieve the active socket instance and registration state.
 *
 * When it is executed:
 * Executed in components whenever they subscribe to the current user's registration
 * or socket connection updates.
 *
 * Which other files use it:
 * Used by src/hooks/useWebRTC.ts, src/pages/Home.tsx, src/components/UserList.tsx,
 * and other React layout components.
 *
 * How it fits into the WebRTC signaling flow:
 * Gives components access to user details and socket-sending capacity, which are
 * prerequisites for sending calls, answering, and rejecting WebRTC handshakes.
 */

import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
