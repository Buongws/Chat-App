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

  const { user } = useSelector((state) => state.user);
  const { servers } = useSelector((state) => state.servers);

  const isOwner = servers.some(
    (server) => server._id === serverId && server.owner === user?.data?.userId
  );

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
      const response = await fetch("http://localhost:3000/roomUser"); // Adjust to your server's URL
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

  const toggleVideo = async () => {
    try {
      if (
        !localStreamRef.current ||
        localStreamRef.current.getVideoTracks().length === 0
      ) {
        // Bật video
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Thêm video track vào `localStreamRef` hiện có
        stream.getVideoTracks().forEach((track) => {
          localStreamRef.current.addTrack(track);
        });

        // Hiển thị video local
        const localVideoElement = document.getElementById("localVideo");
        if (localVideoElement) {
          localVideoElement.srcObject = localStreamRef.current;
        }

        // Thêm track vào các peerConnection
        Object.values(peerConnections.current).forEach((peerConnection) => {
          addTracksToPeerConnection(peerConnection, stream);
        });

        // Gửi thông báo bật video tới server
        socket.emit("user-video-toggled", {
          roomId: currentRoom,
          userId: user.data.userId,
          isVideoOn: true,
        });
      } else {
        // Tắt video
        const videoTracks = localStreamRef.current.getVideoTracks();
        videoTracks.forEach((track) => {
          Object.values(peerConnections.current).forEach((peerConnection) => {
            removeTrack(peerConnection, track);
          });
          // track.stop();
          localStreamRef.current.removeTrack(track);
        });

        // Dừng hiển thị video local
        const localVideoElement = document.getElementById("localVideo");
        if (localVideoElement) {
          localVideoElement.srcObject = localStreamRef.current;
        }

        // Gửi thông báo tắt video tới server
        socket.emit("user-video-toggled", {
          roomId: currentRoom,
          userId: user.data.userId,
          isVideoOn: false,
        });
      }
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

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

    socket.on("answer", async ({ answer, senderId }) => {
      const peerConnection = peerConnections[senderId];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    socket.on("ice-candidate", ({ candidate, senderId }) => {
      const peerConnection = peerConnections[senderId];
      if (peerConnection) {
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((error) => {
            console.error("Error adding received ICE candidate:", error);
          });
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
    socket.on("user-video-toggled", async ({ userId, isVideoOn }) => {
      if (isVideoOn) {
        // Tạo lại kết nối với người dùng bật lại video
        const peerConnection = peerConnections.current[userId];
        if (peerConnection) {
          peerConnection.ontrack = (event) => {
            setPeers((prevPeers) => ({
              ...prevPeers,
              [userId]: event.streams[0],
            }));
          };
        }
      } else {
        // Xóa video stream của người dùng khỏi UI
        setPeers((prevPeers) => {
          const updatedPeers = { ...prevPeers };
          delete updatedPeers[userId];
          return updatedPeers;
        });
      }
    });

    return () => {
      socket.off("user-video-toggled");
    };
  }, []);

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
              video: true,
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
      setPeers({});
      setChannelUsers((prevUsers) => {
        const updatedUsers = { ...prevUsers };
        delete updatedUsers[currentRoom];
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
          toggleVideo={toggleVideo}
        />
      )}

      <Footer
        handleUpdate={handleUpdate}
        toggleMicMute={toggleMicMute}
        toggleHeadphoneMute={toggleHeadphoneMute}
        isMicMuted={isMicMuted}
        isHeadphoneMuted={isHeadphoneMuted}
      />

      <div className="video-grid">
        {/* Video local */}
        {connectedRoomName && (
          <div className="video-wrapper">
            <video
              id="localVideo"
              autoPlay
              muted
              className="video"
              style={{ background: "black" }}
            ></video>
            <p className="video-label">You</p>
          </div>
        )}
        {/* Video remote */}
        {Object.entries(peers || {}).map(([socketId, stream]) => {
          if (!stream) return null; // Bỏ qua nếu stream không tồn tại
          return (
            <div className="video-wrapper" key={socketId}>
              <video
                data-peer-id={socketId}
                ref={(video) => {
                  if (video) {
                    video.srcObject = stream;
                    video.muted = true;
                  }
                }}
                autoPlay
                className="video"
                style={{ background: "black" }}
              ></video>
              <p className="video-label">User {user?.data?.user}</p>
            </div>
          );
        })}
      </div>

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
