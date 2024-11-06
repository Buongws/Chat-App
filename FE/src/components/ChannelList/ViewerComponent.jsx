import { useState, useEffect } from "react";
import io from "socket.io-client";
import { EyeIcon } from "@heroicons/react/24/outline";

const socket = io("http://localhost:3000");

const ViewerComponent = ({ roomName }) => {
  const [isWatching, setIsWatching] = useState(false);

  const watchScreen = () => {
    socket.emit("watch-screen", { roomId: roomName });
    setIsWatching(true);
  };

  useEffect(() => {
    // Listen for the shared screen stream
    socket.on("screen-stream", (streamData) => {
      const videoElement = document.getElementById("shared-screen");
      videoElement.srcObject = streamData;
      videoElement.play();
    });

    // Handle when no screen stream is available
    socket.on("no-screen-stream", () => {
      alert("No screen is being shared right now.");
      setIsWatching(false);
    });

    // Handle when screen sharing stops
    socket.on("screen-sharing-stopped", () => {
      const videoElement = document.getElementById("shared-screen");
      videoElement.pause();
      videoElement.srcObject = null;
      setIsWatching(false);
    });

    return () => {
      socket.off("screen-stream");
      socket.off("no-screen-stream");
      socket.off("screen-sharing-stopped");
    };
  }, []);

  return (
    <div>
      <button
        onClick={watchScreen}
        className="p-2 rounded bg-[#313338] text-white"
      >
        <EyeIcon className="w-6 h-6" />
      </button>
      {isWatching && (
        <video
          id="shared-screen"
          className="w-full h-auto mt-4"
          autoPlay
          playsInline
        />
      )}
    </div>
  );
};

export default ViewerComponent;
