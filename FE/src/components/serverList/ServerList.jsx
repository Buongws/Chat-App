import React, { useCallback, useState } from "react";
import AddServerIcon from "./AddServerIcon";
import ProfileIcon from "./ProfileIcon";
import ServerIcon from "./ServerIcon";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeSocket } from "../../actions/socketActions";

const ServerList = React.memo(
  ({ servers, selectedServerId, onServerClick, onServerCreated }) => {
    const [currentMainServer, setCurrentMainServer] =
      useState(selectedServerId);

    const dispatch = useDispatch();

    const handleServerClick = useCallback(
      (serverId) => {
        setCurrentMainServer(serverId);
        onServerClick(serverId);
      },
      [onServerClick]
    );

    const handleProfileClick = useCallback(() => {
      setCurrentMainServer("@me");
      onServerClick("@me");
    }, [onServerClick]);

    useEffect(() => {
      dispatch(initializeSocket());
    }, [dispatch]);

    if (!servers) {
      return <div>Loading ...</div>;
    }

    return (
      <div className="background-server overflow-y-auto overflow-hidden  scrollbar-thin scrollbar-thumb-[#959bac] scrollbar-track-[#2F3136] scrollbar-thumb-rounded p-3 pt-1 flex flex-col items-center rounded-sm">
        <ProfileIcon onClick={handleProfileClick} />

        <div className="w-8 h-0.5 bg-gray-700 mt-2"></div>

        {servers?.map((server) => (
          <ServerIcon
            key={server._id}
            imgSrc={server.imageUrl}
            label={server.serverName}
            isMainServer={server._id === currentMainServer}
            onClick={() => handleServerClick(server._id)}
          />
        ))}

        <AddServerIcon onServerCreated={onServerCreated} />
      </div>
    );
  }
);

export default ServerList;
