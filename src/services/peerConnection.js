/**
 * Creates a WebRTC peer connection. Public STUN servers are always available;
 * short-lived TURN credentials are requested from the backend for each call.
 */

const STUN_SERVERS = {
  urls: [
    "stun:stun.relay.metered.ca:80",
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302",
    "stun:stun2.l.google.com:19302",
    "stun:stun3.l.google.com:19302",
    "stun:stun4.l.google.com:19302",
  ],
};

async function fetchTurnServers() {
  const signalingUrl = import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, "");
  const credentialsUrl =
    import.meta.env.VITE_TURN_CREDENTIALS_URL ||
    (signalingUrl ? `${signalingUrl}/api/turn-credentials` : null);

  if (!credentialsUrl) {
    console.warn(
      "VITE_TURN_CREDENTIALS_URL is not configured; calls will use STUN only.",
    );
    return [];
  }

  const response = await fetch(credentialsUrl, {
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`TURN credential request failed (${response.status})`);
  }

  const payload = await response.json();
  const servers = Array.isArray(payload) ? payload : payload.iceServers;

  if (!Array.isArray(servers)) {
    throw new Error("TURN credential response must contain an iceServers array");
  }

  return servers;
}

export async function createPeerConnection() {
  let turnServers = [];

  try {
    turnServers = await fetchTurnServers();
  } catch (error) {
    console.error(
      "Could not obtain short-lived TURN credentials; using STUN only.",
      error,
    );
  }

  return new RTCPeerConnection({
    iceServers: [STUN_SERVERS, ...turnServers],
  });
}
