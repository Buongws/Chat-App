// VoiceChannels.js
import { Cog8ToothIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";

const VoiceChannels = ({
  channels,
  channelUsers,
  isOwner,
  selectedChannelId,
  joinRoom,
  toggleModal,
  toggleEditChannel,
  onChannelClick,
  onLeaveRoom,
}) => {
  return (
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
          <div
            key={channel._id}
            onClick={() => {
              onChannelClick(channel._id, "VOICE");
              onLeaveRoom();
            }}
            className="mt-2"
          >
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
  );
};

export default VoiceChannels;
