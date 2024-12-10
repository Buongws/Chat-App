const sendersMap = new Map(); // Lưu senders của từng peerConnection

// Hàm thêm track an toàn
export const addTrackSafely = (peerConnection, track, stream) => {
  if (!sendersMap.has(peerConnection)) {
    sendersMap.set(peerConnection, []);
  }

  const senders = sendersMap.get(peerConnection);
  const existingSender = senders.find((sender) => sender.track === track);

  if (!existingSender) {
    const sender = peerConnection.addTrack(track, stream);
    senders.push(sender);
  }
};

// Hàm xóa track
export const removeTrack = (peerConnection, track) => {
  const senders = peerConnection.getSenders();
  const senderToRemove = senders.find((sender) => sender.track === track);

  if (senderToRemove) {
    peerConnection.removeTrack(senderToRemove);
  }
};

// Hàm thêm tất cả track vào peerConnection
export const addTracksToPeerConnection = (peerConnection, stream) => {
  // Get the tracks from the stream
  stream.getTracks().forEach((track) => {
    // Check if the track already exists in the peer connection
    const existingSender = peerConnection
      .getSenders()
      .find((sender) => sender.track === track);

    // If a sender for this track already exists, skip adding the track
    if (!existingSender) {
      peerConnection.addTrack(track, stream);
    }
  });
};
