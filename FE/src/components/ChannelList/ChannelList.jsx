import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import DropdownServer from "../DropdownChannelList/DropdownServer";
import { Cog8ToothIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import EditChannelModal from "../ChannelEdit/EditChannelModal";
import VoiceStatusBar from "./VoiceStatusBar";
import Footer from "./Footer";

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

  useEffect(() => {
    // Setting up socket listeners for channel users
    socket.on("channel-users", ({ roomId, users }) => {
      setChannelUsers((prevUsers) => ({ ...prevUsers, [roomId]: users }));
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
  }, [currentRoom, user?.data?.userId]);

  useEffect(() => {
    // Check when the socket reconnects
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

    return () => {
      socket.off("connect");
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
  };

  const joinRoom = async (roomId, roomName) => {
    if (currentRoom !== roomId) {
      if (currentRoom) {
        socket.emit("leave-room", {
          roomId: currentRoom,
          userId: user?.data?.userId,
        });
        leaveRoom();
      }

      setCurrentRoom(roomId);
      setConnectedRoomName(roomName);

      if (user?.data) {
        socket.emit("join-room", {
          roomId,
          userId: user.data.userId,
          userName: user.data.name,
          avatar: user.data.imageUrl,
        });

        // Get user media
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          localStreamRef.current = stream;
          // Add audio tracks to all existing peer connections
          Object.values(peerConnections.current).forEach((pc) => {
            stream.getTracks().forEach((track) => {
              pc.addTrack(track, stream);
            });
          });
        } catch (error) {
          console.error("Error accessing media devices:", error);
        }
      }
    }
  };

  const leaveRoom = () => {
    if (currentRoom) {
      socket.emit("leave-room", {
        roomId: currentRoom,
        userId: user?.data?.userId,
      });
      // Stop all media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      // Close all peer connections
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};

      setCurrentRoom(null);
      setConnectedRoomName(null); // Clear connected room name
      setPeers({}); // Clear remote streams

      setChannelUsers((prevChannelUsers) => {
        const updatedChannelUsers = { ...prevChannelUsers };
        if (updatedChannelUsers[currentRoom]) {
          updatedChannelUsers[currentRoom] = updatedChannelUsers[
            currentRoom
          ].filter((channelUser) => channelUser.userId !== user?.data?.userId);
        }
        return updatedChannelUsers;
      });
    }
  };

  return (
    <>
      <DropdownServer serverId={serverId} onCreateChannel={toggleModal} />
      <div className="p-3">
        <div className="mb-4">
          <div className="flex justify-between items-center text-gray-400">
            <p className="text-xs">TEXT CHANNELS</p>
            {isOwner && (
              <div className="relative cursor-pointer" onClick={toggleModal}>
                <p className="text-xl mr-3">+</p>
              </div>
            )}
          </div>

          {channels
            .filter((channel) => channel.channelType === "TEXT")
            .map((channel) => (
              <div
                key={channel._id}
                onClick={() => {
                  onChannelClick(channel._id, "TEXT");
                }}
                className={`flex justify-between items-center p-2 mt-2 rounded cursor-pointer ${
                  selectedChannelId === channel._id ? "bg-gray-600" : ""
                } hover:bg-gray-500`}
              >
                <div className="flex items-center">
                  <p className="ml-1 text-gray-400 truncate max-w-[10rem]">
                    # {channel.channelName}
                  </p>
                </div>
                {isOwner && (
                  <Cog8ToothIcon
                    onClick={toggleEditChannel}
                    className="w-5 h-5 text-gray-400"
                  />
                )}
              </div>
            ))}
        </div>

        <div>
          <div className="flex justify-between items-center text-gray-400">
            <p className="text-xs">VOICE CHANNELS</p>
            {isOwner && (
              <div className="relative cursor-pointer" onClick={toggleModal}>
                <p className="text-xl mr-3">+</p>
              </div>
            )}
          </div>

          {channels
            .filter((channel) => channel.channelType === "VOICE")
            .map((channel) => (
              <div key={channel._id} className="mt-2">
                <div
                  onClick={() => joinRoom(channel._id, channel.channelName)}
                  className={`flex justify-between items-center p-2 cursor-pointer rounded ${
                    selectedChannelId === channel._id
                      ? "bg-gray-600"
                      : "hover:bg-gray-600"
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />
                    <p className="truncate max-w-[9rem] text-gray-200">
                      {channel.channelName}
                    </p>
                  </div>
                  {isOwner && (
                    <div className="ml-2 cursor-pointer">
                      <Cog8ToothIcon
                        onClick={toggleEditChannel}
                        className="w-5 h-5 text-gray-400"
                      />
                    </div>
                  )}
                </div>

                {channelUsers[channel._id]?.length > 0 && (
                  <div className="ml-6 mt-2">
                    {channelUsers[channel._id].map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center space-x-2 p-1"
                      >
                        <img
                          src={user.avatar}
                          alt={`${user.name}'s avatar`}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="truncate max-w-[8rem] text-gray-200">
                          {user.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>

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
