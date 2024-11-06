import { useEffect, useRef } from "react";
import moment from "moment-timezone";

const MessageSection = ({ messages, userName }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (time) => {
    // Convert the time to Hanoi timezone
    return moment(time).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
  };

  //Render message content with clickable URLs
  const renderMessageContent = (message) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Regex to detect URLs
    const parts = message.split(urlRegex);

    return parts.map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {part}
        </a>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className="messages p-6 pb-2 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-[#959bac] scrollbar-track-[#2F3136] scrollbar-thumb-rounded">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <img
            src="https://i.pinimg.com/originals/d1/54/13/d15413779800244022310abbb27e7104.gif"
            alt="Wave"
            className="w-30 mb-4"
          />
          <p className="text-gray-400 text-lg">
            This is the beginning of your direct message history with this user.
          </p>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
            Wave to {userName || "this user"}
          </button>
        </div>
      ) : (
        <>
          {messages.map((message, idx) => (
            <div key={idx} className="message flex items-center mt-4">
              <img
                src={message?.senderId?.imageUrl || "/default-profile.png"}
                alt="Profile"
                className="w-11 rounded-full"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <p className="text-white font-bold text-sm mr-2">
                    {message?.senderId?.name || "Friend"}
                  </p>
                  <div className="date text-xs text-gray-500">
                    {message?.createdAt
                      ? formatTime(message?.createdAt)
                      : "Just now"}
                  </div>
                </div>
                <p className="max-w-[850px] mt-1 text-gray-300 text-sm break-words">
                  {message?.message && renderMessageContent(message.message)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageSection;
