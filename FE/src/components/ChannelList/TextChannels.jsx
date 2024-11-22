// TextChannels.js
import { Cog8ToothIcon } from "@heroicons/react/24/outline";

const TextChannels = ({
  channels,
  isOwner,
  selectedChannelId,
  onChannelClick,
  toggleModal,
  toggleEditChannel,
}) => {
  return (
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
            <div>
              {isOwner && (
                <Cog8ToothIcon
                  onClick={toggleEditChannel}
                  className="w-5 h-5 text-gray-400"
                />
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default TextChannels;
