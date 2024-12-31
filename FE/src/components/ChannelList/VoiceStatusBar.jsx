import {
  // ComputerDesktopIcon,
  // VideoCameraIcon,
  ArrowRightEndOnRectangleIcon,
  // VideoCameraSlashIcon,
} from "@heroicons/react/24/outline";

const VoiceStatusBar = ({
  roomName,
  onLeaveRoom,
  servers,
  // toggleCamera,
  // isVideoOn,
}) => {
  return (
    <div className="bg-[#232428] absolute w-full bottom-[6%] p-2 flex items-center justify-between text-white flex-col mb-1">
      <div className="flex justify-between w-full">
        <div>
          <p className="text-sm font-semibold text-green-400">
            Voice Connected
          </p>
          <p className="text-xs">
            {servers[0]?.serverName} / {roomName}
          </p>
        </div>
        <button
          onClick={onLeaveRoom}
          className="text-red-500 hover:text-red-600"
        >
          <ArrowRightEndOnRectangleIcon className="w- h-6" />
        </button>
      </div>
      {/* <div className="flex w-full justify-around py-2 space-x-4">
        <button
          className="text-gray-300 hover:text-white p-2 rounded bg-[#313338] w-full flex justify-center"
          onClick={toggleCamera}
        >
          {isVideoOn ? (
            <VideoCameraIcon className="w-6 h-6" />
          ) : (
            <VideoCameraSlashIcon className="h-6 w-6 text-gray-500" />
          )}
        </button>
        <button className="text-gray-300 hover:text-white p-2 rounded bg-[#313338] w-full  flex justify-center">
          <ComputerDesktopIcon className="w-6 h-6" />
        </button>
      </div> */}
    </div>
  );
};

export default VoiceStatusBar;
