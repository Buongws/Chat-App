/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef, useCallback } from "react";
import io from "socket.io-client";
import DropdownServer from "../DropdownChannelList/DropdownServer";
import { useSelector } from "react-redux";
import EditChannelModal from "../ChannelEdit/EditChannelModal";
import VoiceStatusBar from "./VoiceStatusBar";
import Footer from "./Footer";
import TextChannels from "./TextChannels";
import VoiceChannels from "./VoiceChannels";
import ReactDOM from "react-dom";

import {
  addTrackSafely,
  removeTrack,
  addTracksToPeerConnection,
} from "../../utility/webrtcUtils";

const socket = io("http://localhost:3000/");

const ChannelList = ({
  serverId,
  channels,
  selectedChannelId,
  channelName,
  setChannelName,
  onChannelClick,
  toggleModal,
  onChannelUpdate,
  handleUpdate,
}) => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [channelUsers, setChannelUsers] = useState({});
  const [editChannelOpen, setEditChannelOpen] = useState(false);
  const [connectedRoomName, setConnectedRoomName] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isHeadphoneMuted, setIsHeadphoneMuted] = useState(false);

  const [peers, setPeers] = useState({});
  const localStreamRef = useRef();
  const peerConnections = useRef({});

  const [isVideoOn, setIsVideoOn] = useState(false);
  const localVideoRef = useRef(null);

  const { user } = useSelector((state) => state.user);
  const { servers } = useSelector((state) => state.servers);

  const isOwner = servers.some(
    (server) => server._id === serverId && server.owner === user?.data?.userId
  );

  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject.getVideoTracks().forEach((track) => {
        track.enabled = newVideoState;
      });
    }

    // Emit the toggleVideoCall event to the server
    socket.emit("toggleVideoCall", {
      roomId: currentRoom,
      userId: user.data.userId,
      isVideoEnabled: newVideoState,
    });
  };

  useEffect(() => {
    if (isVideoOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing media devices.", err);
        });
    } else {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
    }
  }, [isVideoOn]);

  useEffect(() => {
    socket.on("video-call-toggled", ({ userId, isVideoEnabled }) => {
      if (userId === user.data.userId) {
        setIsVideoOn(isVideoEnabled);

        if (isVideoEnabled) {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
              }
              // Add the stream to peer connections
              Object.values(peerConnections.current).forEach((pc) => {
                addTracksToPeerConnection(pc, stream);
              });
            })
            .catch((err) => {
              console.error("Error accessing media devices.", err);
            });
        } else {
          if (localVideoRef.current && localVideoRef.current.srcObject) {
            localVideoRef.current.srcObject
              .getTracks()
              .forEach((track) => track.stop());
            localVideoRef.current.srcObject = null;
          }
        }
      }
    });

    return () => {
      socket.off("video-call-toggled");
    };
  }, [currentRoom, user?.data?.userId]);

  const toggleEditChannel = () => {
    setEditChannelOpen(!editChannelOpen);
  };

  const toggleMicMute = (forceState = null) => {
    setIsMicMuted((prev) => {
      const newMicState = forceState !== null ? forceState : !prev;

      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !newMicState; // Toggle mic status properly
        });
      }

      // If unmuting the mic and the headset is also muted, unmute the headset
      if (!newMicState && isHeadphoneMuted) {
        setIsHeadphoneMuted(false);
        Object.keys(peers).forEach((peerId) => {
          const audioElement = document.querySelector(
            `[data-peer-id="${peerId}"]`
          );
          if (audioElement) {
            audioElement.muted = false; // Unmute peer's audio element
          }
        });
      }

      return newMicState;
    });
  };

  const toggleHeadphoneMute = (forceState = null) => {
    setIsHeadphoneMuted((prev) => {
      const newHeadphoneState = forceState !== null ? forceState : !prev;

      // Mute/unmute các phần tử audio/video từ peer
      Object.keys(peers).forEach((peerId) => {
        // Mute video
        const videoElement = document.querySelector(
          `video[data-peer-id="${peerId}"]`
        );
        if (videoElement) {
          videoElement.muted = newHeadphoneState;
        }
        // Mute audio
        const audioElement = document.querySelector(
          `audio[data-peer-id="${peerId}"]`
        );
        if (audioElement) {
          audioElement.muted = newHeadphoneState;
        }
      });

      // Mute/unmute mic của chính mình
      toggleMicMute(newHeadphoneState);

      return newHeadphoneState;
    });
  };

  const handleBeforeUnload = () => leaveRoom();

  const fetchRoomData = useCallback(async () => {
    try {
      const urlServerRoomUser = import.meta.env.VITE_INVITE_CODE_URL;
      const response = await fetch(urlServerRoomUser); // Adjust to your server's URL
      const data = await response.json();

      console.log("Room data:", data.data);

      // Transform the nested data structure to a simpler form
      const transformedData = Object.entries(data.data).reduce(
        (acc, [roomKey, users]) => {
          const roomId = roomKey.replace("room:", ""); // Remove the "room:" prefix
          acc[roomId] = users;
          return acc;
        },
        {}
      );
      console.log("Transformed data:", transformedData);

      setChannelUsers(transformedData);
    } catch (error) {
      console.error("Error fetching rooms data:", error);
    }
  }, []);

  // Modify the toggleVideo function

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  useEffect(() => {
    socket.on("channel-users", ({ roomId, users }) => {
      setChannelUsers((prevUsers) => ({
        ...prevUsers,
        [roomId]: users,
      }));
    });

    // WebRTC signaling listeners
    socket.on("new-peer", async ({ socketId }) => {
      const peerConnection = createPeerConnection(socketId);
      peerConnections.current[socketId] = peerConnection;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit("offer", {
        offer,
        roomId: currentRoom,
        targetSocketId: socketId,
      });

      // Gửi lại stream của chính mình
      if (localStreamRef.current) {
        addTracksToPeerConnection(peerConnection, localStreamRef.current);
      }
    });

    socket.on("offer", async ({ offer, senderId }) => {
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
    });

    socket.on("ice-candidate", async ({ candidate, senderId }) => {
      const peerConnection = peerConnections[senderId];
      if (peerConnection) {
        try {
          if (peerConnection.remoteDescription) {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } else {
            // Queue the candidate if remote description is not set
            peerConnection.pendingCandidates =
              peerConnection.pendingCandidates || [];
            peerConnection.pendingCandidates.push(candidate);
          }
        } catch (error) {
          console.error("Error adding ICE candidate", error);
        }
      }
    });

    // After setting remote description, add any pending candidates
    socket.on("answer", async ({ answer, senderId }) => {
      const peerConnection = peerConnections[senderId];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        if (peerConnection.pendingCandidates) {
          for (const candidate of peerConnection.pendingCandidates) {
            await peerConnection.addIceCandidate(candidate);
          }
          peerConnection.pendingCandidates = [];
        }
      }
    });

    socket.on("new-user-joined", ({ roomId, userId }) => {
      // Send your current stream to the new user
      Object.keys(peerConnections.current).forEach((socketId) => {
        const peerConnection = peerConnections.current[socketId];
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStreamRef.current);
          });
        }
      });
    });

    socket.on("user-left-room", ({ userId, socketId }) => {
      // Remove the peer from the peers state
      setPeers((prevPeers) => {
        const updatedPeers = { ...prevPeers };
        delete updatedPeers[socketId];
        return updatedPeers;
      });

      // Close and remove the peer connection
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
      }
    });

    return () => {
      socket.off("channel-users");
      socket.off("new-peer");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("new-user-joined");
      socket.off("user-left-room");
    };
  }, [currentRoom]);

  useEffect(() => {
    socket.on("connect", () => {
      if (currentRoom && user?.data) {
        // Emit join-room again to resync room users
        socket.emit("join-room", {
          roomId: currentRoom,
          userId: user.data.userId,
          userName: user.data.name,
          avatar: user.data.imageUrl,
        });
      }
    });

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.off("connect");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentRoom, user?.data?.userId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leave-room", {
        roomId: currentRoom,
        userId: user.data.userId,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentRoom, user?.data?.userId]);

  const createPeerConnection = (socketId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.l.google.com:5349" },
        { urls: "stun:stun1.l.google.com:3478" },
        { urls: "stun:stun1.l.google.com:5349" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:5349" },
        { urls: "stun:stun3.l.google.com:3478" },
        { urls: "stun:stun3.l.google.com:5349" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:5349" },
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

    // Xử lý khi nhận được video track
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setPeers((prevPeers) => ({
        ...prevPeers,
        [socketId]: remoteStream,
      }));
    };

    // Gửi video stream của mình cho đối phương
    if (localStreamRef.current) {
      addTracksToPeerConnection(peerConnection, localStreamRef.current);
    }

    peerConnections[socketId] = peerConnection; // Save the connection
    return peerConnection;
  };

  const joinRoom = useCallback(
    async (roomId, roomName) => {
      if (currentRoom !== roomId) {
        if (currentRoom) leaveRoom();

        setCurrentRoom(roomId);
        setConnectedRoomName(roomName);

        if (user?.data) {
          socket.emit("join-room", {
            roomId,
            userId: user.data.userId,
            userName: user.data.name,
            avatar: user.data.imageUrl,
          });

          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });

            localStreamRef.current = stream;

            const localVideoElement = document.getElementById("localVideo");
            if (localVideoElement) {
              localVideoElement.srcObject = stream;
            }

            Object.values(peerConnections.current).forEach((pc) => {
              addTracksToPeerConnection(pc, stream);
            });

            // Apply the current mute states
            stream.getAudioTracks().forEach((track) => {
              track.enabled = !isMicMuted && !isHeadphoneMuted;
            });

            socket.emit("new-user-joined", { roomId });
          } catch (error) {
            console.error("Error accessing media devices:", error);
          }
        }
      }
    },
    [currentRoom, user?.data, isMicMuted, isHeadphoneMuted]
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
      peerConnections.current = {};

      setCurrentRoom(null);
      setConnectedRoomName(null);
      setIsVideoOn(false);
      setPeers({});

      // Update channelUsers to remove the current user from the room
      setChannelUsers((prevUsers) => {
        const updatedUsers = { ...prevUsers };
        if (updatedUsers[currentRoom]) {
          updatedUsers[currentRoom] = updatedUsers[currentRoom].filter(
            (userObj) => userObj.userId !== user?.data?.userId
          );

          if (updatedUsers[currentRoom].length === 0) {
            delete updatedUsers[currentRoom];
          }
        }
        return updatedUsers;
      });
    }
  }, [currentRoom, user?.data?.userId]);

  return (
    <>
      <DropdownServer serverId={serverId} onCreateChannel={toggleModal} />
      <div className="p-3">
        <TextChannels
          channels={channels}
          isOwner={isOwner}
          selectedChannelId={selectedChannelId}
          onChannelClick={onChannelClick}
          toggleModal={toggleModal}
          toggleEditChannel={toggleEditChannel}
        />
        <VoiceChannels
          channels={channels}
          channelUsers={channelUsers}
          isOwner={isOwner}
          selectedChannelId={selectedChannelId}
          joinRoom={joinRoom}
          toggleModal={toggleModal}
          toggleEditChannel={toggleEditChannel}
          socket={socket}
          onChannelClick={onChannelClick}
          onLeaveRoom={leaveRoom}
        />

        <EditChannelModal
          isOpen={editChannelOpen}
          toggle={toggleEditChannel}
          channelId={selectedChannelId}
          channelName={channelName}
          setChannelName={setChannelName}
          onChannelUpdate={onChannelUpdate}
        />
      </div>

      {/* Display VoiceStatusBar if connected to a voice room */}
      {connectedRoomName && (
        <VoiceStatusBar
          roomName={connectedRoomName}
          onLeaveRoom={leaveRoom}
          servers={servers}
          toggleCamera={toggleVideo}
          isVideoOn={isVideoOn}
        />
      )}

      <div className="camera-container mt-4">
        {isVideoOn && (
          <video
            ref={localVideoRef}
            className="w-full h-auto"
            autoPlay
            muted
            playsInline
          />
        )}
      </div>

      <Footer
        handleUpdate={handleUpdate}
        toggleMicMute={toggleMicMute}
        toggleHeadphoneMute={toggleHeadphoneMute}
        isMicMuted={isMicMuted}
        isHeadphoneMuted={isHeadphoneMuted}
      />

      {/* Render remote streams */}
      <div>
        {Object.entries(peers).map(([socketId, stream], index) => (
          <audio
            key={index}
            data-peer-id={socketId} // Add unique identifier for each peer
            ref={(audio) => {
              if (audio) audio.srcObject = stream;
            }}
            autoPlay
          />
        ))}
      </div>
    </>
  );
};

export default ChannelList;
