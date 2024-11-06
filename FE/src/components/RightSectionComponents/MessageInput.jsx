import { memo, useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/16/solid";
import {
  createMessageByChannelId,
  createDirectMessageByRecipientId,
} from "../../api/main";
import { useSelector } from "react-redux";

const MessageInput = ({ selectedChannelId, isDirectMessage, channelName }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [typingTimeOut, setTypingTimeOut] = useState(null);
  const { socket } = useSelector((state) => state.socket);
  const { user } = useSelector((state) => state.user);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter" && inputMessage.trim() !== "") {
      if (isDirectMessage) {
        const newMessage = await createDirectMessageByRecipientId(
          selectedChannelId,
          inputMessage
        );
        setInputMessage("");
        socket.transmitPublish(channelName, newMessage.data);
      } else {
        const newMessage = await createMessageByChannelId(
          selectedChannelId,
          inputMessage
        );
        setInputMessage("");
        socket.transmitPublish(channelName, newMessage.data);
      }
    }
  };

  const handleOnchange = (e) => {
    setInputMessage(e.target.value);

    socket.transmitPublish(`checkTyping${channelName}`, user.data.name);

    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
    }

    setTypingTimeOut(
      setTimeout(() => {
        socket.transmitPublish(`checkTyping${channelName}`, null);
      }, 3000)
    );
  };

  return (
    <div className="p-[0.4rem]">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center px-3">
          <button className="text-gray-400 hover:text-gray-200 focus:outline-none">
            <PlusCircleIcon className="w-5 h-5" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Message #chat"
          className="w-full py-3 px-5 pl-10 text-sm rounded-lg bg-gray-700 border-none caret-gray-400 text-gray-300 outline-none"
          value={inputMessage}
          onChange={(e) => handleOnchange(e)}
          onKeyDown={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default memo(MessageInput);
