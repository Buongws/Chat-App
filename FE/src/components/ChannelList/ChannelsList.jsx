import { memo, useCallback, useEffect, useState } from "react";
import ChannelList from "./ChannelList";
import CustomCreateModal from "../CustomModal/CustomCreateModal";
import RightSection from "../RightSectionComponents/RightSection";
import {
  getAllMembersByServerId,
  getChannelByChannelId,
  getChannelsByServerId,
  getUserById,
} from "../../api/main";
import { createNewChannel } from "../../actions/channelActions";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../../actions/userActions";
import ListUsers from "../ListUsers/ListUsers";
import Toast from "../../utility/toast";
import { useParams, useNavigate } from "react-router-dom";

const ChannelsList = () => {
  const param = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [serverExisted, setServerExisted] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState(
    param.serverId || null
  );
  const [channels, setChannels] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [selectedChannelInfo, setSelectedChannelInfo] = useState(null);
  const [userId, setUserId] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [ownerId, setOwnerId] = useState("");

  const { servers } = useSelector((state) => state.servers);
  const { onlineUsers } = useSelector((state) => state.onlineUsers);

  const fetchUser = async () => {
    try {
      const response = await getUserById();
      const userData = response?.data;
      setUserId(userData?.userId);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Fetch user information once on component mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Check if the server exists, then fetch channels and members
  useEffect(() => {
    const serverExists = servers.some(
      (server) => server._id === param.serverId
    );
    if (serverExists) {
      setServerExisted(true);
      setSelectedServerId(param.serverId);
      setOwnerId(
        servers.find((server) => server._id === param.serverId)?.owner
      );

      // Fetch channels and set the first channel as selected
      fetchChannels(param.serverId).then((channelsData) => {
        if (channelsData.data.length > 0) {
          const firstChannelId = channelsData.data[0]._id;
          setSelectedChannelId(firstChannelId);
          navigate(`/channels/${param.serverId}/${firstChannelId}`);
        }
      });

      fetchMembers(param.serverId); // Fetch members for this server
    } else {
      // Reset states if the server does not exist
      setServerExisted(false);
      setChannels([]);
      setSelectedChannelId(null);
      setSelectedChannelInfo(null);
      setChannelName("");
    }
  }, [param.serverId, servers]);

  // Fetch channel details by channel ID if available
  useEffect(() => {
    if (selectedServerId && selectedChannelId) {
      const fetchChannelByChannelId = async () => {
        try {
          const response = await getChannelByChannelId(
            selectedServerId,
            selectedChannelId
          );
          setSelectedChannelInfo(response.data);
          setChannelName(response.data.channelName);
        } catch (error) {
          console.error("Error fetching channel:", error);
        }
      };
      fetchChannelByChannelId();
    }
  }, [selectedServerId, selectedChannelId]);

  // Function to fetch channels only
  const fetchChannels = async (serverId) => {
    try {
      const channelsData = await getChannelsByServerId(serverId);
      setChannels(channelsData.data);
      return channelsData; // Return fetched data
    } catch (error) {
      console.error("Error fetching channels:", error);
      return { data: [] }; // Return empty data in case of error
    }
  };

  // Function to fetch members only
  const fetchMembers = async (serverId) => {
    try {
      const response = await getAllMembersByServerId(serverId);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleUserUpdate = () => {
    fetchUser();
    fetchMembers(selectedServerId);
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    fetchChannels(selectedServerId);
    fetchUser();
  };

  const handleChannelClick = useCallback(
    (channelId, type) => {
      setSelectedChannelId(channelId);
      const clickedChannel = channels.find(
        (channel) => channel._id === channelId
      );

      if (clickedChannel && type === "TEXT") {
        setSelectedChannelInfo(clickedChannel);
        setChannelName(clickedChannel.channelName);
        navigate(`/channels/${selectedServerId}/${channelId}`);
      }
    },
    [channels, navigate, selectedServerId]
  );

  const validationSchema = Yup.object().shape({
    channelName: Yup.string().required("Channel name is required"),
    channelType: Yup.string().required("Channel type is required"),
  });

  const handleChannelUpdate = () => {
    fetchChannels(selectedServerId);
  };

  const handleCreateChannel = (values, { setSubmitting }) => {
    const channelData = {
      channelName: values.channelName,
      channelType: values.channelType,
      serverId: selectedServerId,
    };

    dispatch(createNewChannel(channelData))
      .then(() => {
        setSubmitting(false);
        toggleModal();
        fetchChannels(selectedServerId);
        Toast.showSuccess("Channel created successfully");
      })
      .catch(() => {
        setSubmitting(false);
        Toast.showError("Channel creation failed");
      });
  };

  const handleMemberClick = () => {
    // Placeholder for handling member clicks
  };

  const toggleUserList = () => setShowUserList((prevState) => !prevState);

  useEffect(() => {
    dispatch(fetchUserDetails());
  }, [dispatch]);

  return (
    <>
      <div className="background-channels relative flex flex-col w-64">
        <ChannelList
          serverId={param.serverId}
          channels={channels}
          selectedChannelId={param.channelId}
          selectedChannelInfo={selectedChannelInfo}
          channelName={channelName}
          setChannelName={setChannelName}
          onChannelClick={handleChannelClick}
          toggleModal={toggleModal}
          onChannelUpdate={handleChannelUpdate}
          handleUpdate={handleUserUpdate}
        />
      </div>

      <RightSection
        selectedChannelId={param.channelId}
        isDirectMessage={false}
        serverExisted={serverExisted}
        toggleUserList={toggleUserList}
        channels={channels}
      />

      {showUserList && (
        <ListUsers
          serverId={selectedServerId}
          users={members}
          onlineUsers={onlineUsers}
          handleClickUser={handleMemberClick}
          isDirectMessage={false}
          ownerId={ownerId}
          handleUpdate={handleUserUpdate}
          isOwner={ownerId === userId}
        />
      )}

      <CustomCreateModal
        isOpen={modalOpen}
        onClose={toggleModal}
        title="Create Channel"
        subtitle="in Kenh Chat"
        type="channel"
        onSubmit={handleCreateChannel}
        validationSchema={validationSchema}
        initialValues={{ channelName: "", channelType: "TEXT" }}
      />
    </>
  );
};

export default memo(ChannelsList);
