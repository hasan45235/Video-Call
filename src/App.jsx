/**
 * Why this file exists:
 * This is the root React component of the application. It acts as the container that injects
 * global context providers (like SocketProvider) and boots up the main page layout.
 *
 * When it is executed:
 * Executed immediately upon loading main.tsx, initiating the client application.
 *
 * Which other files use it:
 * Imported and executed by the main entrypoint file src/main.tsx.
 *
 * How it fits into the WebRTC signaling flow:
 * It wraps the entire dashboard within the SocketProvider context, ensuring that any
 * component within the tree has instant access to signaling sockets and online directory states.
 */

import React from "react";
import { SocketProvider } from "./context/SocketContext";
import { Home } from "./pages/Home";

export default function App() {
  return (<>


    <SocketProvider>
      <Home />
    </SocketProvider>
  </>);
}

