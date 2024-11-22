// hooks/useChannelUsers.js
import { useState, useEffect, useCallback } from "react";

const useChannelUsers = (socket) => {
  const [channelUsers, setChannelUsers] = useState({});

  const fetchRoomData = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/roomUser"); // Adjust to your server's URL
      const data = await response.json();

      console.log("Room data:", data.data);

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
  }, [fetchRoomData]);

  useEffect(() => {
    const handleChannelUsers = ({ roomId, users }) => {
      setChannelUsers((prevUsers) => ({
        ...prevUsers,
        [roomId]: users,
      }));
    };

    socket.on("channel-users", handleChannelUsers);

    return () => {
      socket.off("channel-users", handleChannelUsers);
    };
  }, [socket]);

  return { channelUsers, fetchRoomData };
};

export default useChannelUsers;
