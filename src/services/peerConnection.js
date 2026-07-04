/**
 * Creates the WebRTC peer connection using public STUN servers and TURN
 * credentials supplied through Vite environment variables.
 */

const turnUrls = (import.meta.env.VITE_TURN_URLS || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const iceServers = [
  {
    urls: [
      "stun:stun.relay.metered.ca:80",
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun3.l.google.com:19302",
      "stun:stun4.l.google.com:19302",
    ],
  },
];

if (
  turnUrls.length > 0 &&
  import.meta.env.VITE_TURN_USERNAME &&
  import.meta.env.VITE_TURN_CREDENTIAL
) {
  iceServers.push({
    urls: turnUrls,
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  });
}

const RTC_CONFIG = { iceServers };

export function createPeerConnection() {
  return new RTCPeerConnection(RTC_CONFIG);
}
