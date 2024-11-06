import { useEffect, useState, useCallback, memo } from "react";
import {
  getMessagesByRecipientId,
  getMessagesByChannelId,
} from "../../api/main";
import ChannelHeader from "./ChannelHeader";
import MessageInput from "./MessageInput";
import MessageSection from "./MessageSection";
import { useSelector } from "react-redux";
import notificationSound from "../../assets/audios/discord-notification.mp3";
import NotFoundChannel from "../../components/NotFoundChannel/NotFoundChannel";
import Typing from "./Typing";

const RightSection = ({
  selectedChannelId,
  isDirectMessage,
  serverExisted,
  toggleUserList,
  userName,
}) => {
  const [messages, setMessages] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [previousChannelName, setPreviousChannelName] = useState(""); // Track the previous channel

  const { socket } = useSelector((state) => state.socket);
  const { user } = useSelector((state) => state.user);
  const [typingPerson, setTypingPerson] = useState(null);

  // Subscribe to the appropriate channel
  const subscribeChannel = async (channelId) => {
    if (socket && !socket.isSubscribed(channelId)) {
      const channel = socket.subscribe(channelId);
      for await (let data of channel) {
        // setMessages((prevMessages) => [...prevMessages, data]);
        fetchMessages(selectedChannelId);
        const audio = new Audio(notificationSound);
        audio.play();
      }
    }
  };

  const subcribeTyping = async (channelId) => {
    if (socket && !socket.isSubscribed(`checkTyping${channelId}`)) {
      const channel = socket.subscribe(`checkTyping${channelId}`);
      for await (let data of channel) {
        setTypingPerson(data);
      }
    }
  };

  // Unsubscribe from the previous channel when switching
  const unsubscribeChannel = async (channelId) => {
    if (socket && socket.isSubscribed(channelId)) {
      socket.unsubscribe(channelId);
    }
    if (socket && socket.isSubscribed(`checkTyping${channelId}`)) {
      socket.unsubscribe(`checkTyping${channelId}`);
    }
  };

  // Fetch previous messages from the server
  const fetchMessages = useCallback(
    async (channelId) => {
      try {
        if (isDirectMessage) {
          const messagesData = await getMessagesByRecipientId(channelId);
          setMessages(messagesData.data);
        } else {
          const messagesData = await getMessagesByChannelId(channelId);
          setMessages(messagesData.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    },
    [isDirectMessage]
  );

  useEffect(() => {
    if (isDirectMessage) {
      const recipientId = selectedChannelId;
      const temp =
        user?.data?.userId > recipientId
          ? `${user?.data?.userId}${recipientId}`
          : `${recipientId}${user?.data?.userId}`;
      setChannelName(temp);
    } else {
      setChannelName(selectedChannelId);
    }
  }, [isDirectMessage, selectedChannelId]);

  // Unsubscribe from the old channel when switching
  useEffect(() => {
    if (previousChannelName && previousChannelName !== channelName) {
      unsubscribeChannel(previousChannelName);
    }
    setPreviousChannelName(channelName); // Update the previous channel name
  }, [channelName]);

  // Subscribe to the new channel
  useEffect(() => {
    if (channelName) {
      subcribeTyping(channelName);
      subscribeChannel(channelName);
    }
  }, [channelName]);

  // Clear messages when switching channels
  useEffect(() => {
    setMessages([]);
    if (selectedChannelId) {
      fetchMessages(selectedChannelId);
    }
  }, [selectedChannelId]);

  return (
    <div className="right-section h-screen bg-[#36393F] flex flex-col flex-1">
      <ChannelHeader
        isDirectMessage={isDirectMessage}
        userName={userName}
        toggleUserList={toggleUserList}
      />
      {serverExisted || isDirectMessage ? (
        <MessageSection userName={userName} messages={messages} />
      ) : (
        <NotFoundChannel />
      )}
      <MessageInput
        selectedChannelId={selectedChannelId}
        isDirectMessage={isDirectMessage}
        channelName={channelName}
      />
      {typingPerson && typingPerson !== user.data.name && (
        <Typing name={typingPerson} />
      )}
    </div>
  );
};

export default memo(RightSection);
