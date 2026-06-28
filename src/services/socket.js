/**
 * Why this file exists:
 * This file creates and exports a single, shared instance of the Socket.IO client.
 *
 * When it is executed:
 * Executed once when the client application starts up and imports the module.
 *
 * Which other files use it:
 * Used by src/context/SocketContext.tsx and src/hooks/useSocket.ts.
 *
 * How it fits into the WebRTC signaling flow:
 * It establishes the physical websocket link with the signaling server. The resulting
 * socket connection is used to transmit and receive the WebRTC negotiation payloads
 * (SDP offers, answers, and ICE candidates).
 */

import { io } from "socket.io-client";

// Connect back to the host serving the application
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// Instantiate the Socket.IO client, but do not auto-connect.
// Connection will be managed explicitly by the SocketContext when mounting.
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});
