import { useEffect, useState, useRef, useCallback } from "react";
import io from "socket.io-client";
import DropdownServer from "../DropdownChannelList/DropdownServer";
import { useSelector } from "react-redux";
import EditChannelModal from "../ChannelEdit/EditChannelModal";
import VoiceStatusBar from "./VoiceStatusBar";
import Footer from "./Footer";
import TextChannels from "./TextChannels";
import VoiceChannels from "./VoiceChannels";

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

  const toggleMicMute = () => {
    setIsMicMuted((prev) => !prev);

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted; // Toggle mic status properly
      });
    }
  };

  const toggleHeadphoneMute = () => {
    setIsHeadphoneMuted((prev) => !prev);

    // Toggle mute on each peer's audio element based on headphone status
    Object.keys(peers).forEach((peerId) => {
      const audioElement = document.querySelector(`[data-peer-id="${peerId}"]`);
      if (audioElement) {
        audioElement.muted = !isHeadphoneMuted; // Mute/unmute peer's audio element
      }
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

  useEffect(() => {
    fetchRoomData();
  }, []);

  useEffect(() => {
    // Setting up socket listeners for channel users
    socket.on("channel-users", ({ roomId, users }) => {
      console.log("Channel users:", users);

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
    });

    socket.on("offer", async ({ offer, senderId }) => {
      const peerConnection = createPeerConnection(senderId);
      peerConnections.current[senderId] = peerConnection;

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("answer", {
        answer,
        roomId: currentRoom,
        targetSocketId: senderId,
      });
    });

    socket.on("answer", async ({ answer, senderId }) => {
      const peerConnection = peerConnections.current[senderId];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    });

    socket.on("ice-candidate", ({ candidate, senderId }) => {
      const peerConnection = peerConnections.current[senderId];
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("channel-users");
      socket.off("new-peer");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [currentRoom, fetchRoomData]);

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
        setPeers((prevPeers) => ({
          ...prevPeers,
          [socketId]: event.streams[0],
        }));
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }

      return peerConnection;
    },
    [currentRoom]
  );

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
            Object.values(peerConnections.current).forEach((pc) => {
              stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            });
          } catch (error) {
            console.error("Error accessing media devices:", error);
          }
        }
      }
    },
    [currentRoom, user?.data]
  );

  const leaveRoom = useCallback(() => {
    if (currentRoom) {
      socket.emit("leave-room", {
        roomId: currentRoom,
        userId: user?.data?.userId,
      });

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
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
        />
      )}

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
