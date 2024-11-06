import { useEffect, useState, useCallback, memo } from "react";
import {
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import ChannelProfile from "../ChannelProfile";
import ServerList from "../../components/serverList/ServerList";
import { fetchServers } from "../../actions/serverActions";
import ChannelsList from "../../components/ChannelList/ChannelsList";

const MainLayout = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { servers } = useSelector((state) => state.servers);
  const [selectedServerId, setSelectedServerId] = useState(null);

  const { serverId: paramServerId } = useParams(); // get serverId from URL
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchServers());
  }, [dispatch]);

  useEffect(() => {
    // If there's a serverId in the URL, set it as the selected server
    if (paramServerId) {
      setSelectedServerId(paramServerId);
    }
  }, [paramServerId]);

  const handleServerClick = useCallback(
    (serverId) => {
      setSelectedServerId(serverId);
      navigate(`/channels/${serverId}`);
    },
    [navigate]
  );

  // Handle initial navigation after the component is mounted
  useEffect(() => {
    if (location.pathname === "/channels") {
      navigate("/channels/@me");
    }
  }, [location.pathname, navigate]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="h-screen flex bg-gray-900">
      <ServerList
        servers={servers}
        selectedServerId={selectedServerId}
        onServerClick={handleServerClick}
        onServerCreated={() => dispatch(fetchServers())}
      />
      {location.pathname === "/channels/@me" ? (
        <ChannelProfile />
      ) : (
        <>
          <ChannelsList/>
        </>
      )}
    </div>
  );
};

export default memo(MainLayout);
