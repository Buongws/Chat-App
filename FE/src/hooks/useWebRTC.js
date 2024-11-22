import { useState, useRef, useEffect, useCallback } from "react";

const useWebRTC = (currentRoom, user, socket) => {
  const [peers, setPeers] = useState({});
  const localStreamRef = useRef(null);
  const peerConnections = useRef({}); // Declare peerConnections here

  const createPeerConnection = useCallback(
    (socketId) => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            roomId: currentRoom,
            targetSocketId: socketId,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setPeers((prevPeers) => ({
          ...prevPeers,
          [socketId]: remoteStream,
        }));
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }

      peerConnections.current[socketId] = peerConnection; // Store the connection
      return peerConnection;
    },
    [currentRoom, socket]
  );

  const joinRoom = useCallback(
    async (roomId, roomName) => {
      if (currentRoom !== roomId) {
        // Leave the current room before joining a new one
        if (currentRoom) leaveRoom();

        // Emit join-room event
        socket.emit("join-room", {
          roomId,
          userId: user?.data?.userId,
          userName: user?.data?.name,
          avatar: user?.data?.imageUrl,
        });

        // Get user media
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;

          // Optionally, set the local video element's srcObject here or handle it in the component

          // Add tracks to existing peer connections
          Object.values(peerConnections.current).forEach((pc) => {
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
          });

          socket.emit("new-user-joined", { roomId });
        } catch (error) {
          console.error("Error accessing media devices:", error);
        }
      }
    },
    [currentRoom, socket, user]
  );

  const leaveRoom = useCallback(() => {
    if (currentRoom) {
      socket.emit("leave-room", {
        roomId: currentRoom,
        userId: user?.data?.userId,
      });

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {}; // Reset connections

      setPeers({});
    }
  }, [currentRoom, socket, user]);

  useEffect(() => {
    if (!currentRoom) return;

    const handleNewPeer = async ({ socketId }) => {
      const peerConnection = createPeerConnection(socketId);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit("offer", {
        offer,
        roomId: currentRoom,
        targetSocketId: socketId,
      });

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }
    };

    const handleOffer = async ({ offer, senderId }) => {
      const peerConnection = createPeerConnection(senderId);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("answer", {
        answer,
        roomId: currentRoom,
        targetSocketId: senderId,
      });
    };

    const handleAnswer = async ({ answer, senderId }) => {
      const peerConnection = peerConnections.current[senderId];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    };

    const handleIceCandidate = ({ candidate, senderId }) => {
      const peerConnection = peerConnections.current[senderId];
      if (peerConnection) {
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((err) => {
            console.error("Error adding received ICE candidate", err);
          });
      }
    };

    const handleUserLeft = ({ socketId }) => {
      setPeers((prevPeers) => {
        const updatedPeers = { ...prevPeers };
        delete updatedPeers[socketId];
        return updatedPeers;
      });

      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
      }
    };

    socket.on("new-peer", handleNewPeer);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-left-room", handleUserLeft);

    return () => {
      socket.off("new-peer", handleNewPeer);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-left-room", handleUserLeft);
    };
  }, [currentRoom, socket, createPeerConnection]);

  return { peers, joinRoom, leaveRoom, localStreamRef };
};

export default useWebRTC;
