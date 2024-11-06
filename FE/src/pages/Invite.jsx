import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import backgroundImageUrl from "../assets/images/background/invite.svg";
import { fetchServerById } from "../actions/serverActions";
import { joinServer } from "../api/main";
import Toast from "../utility/toast";

const InvitePage = () => {
  const { serverId, code: inviteCode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [server, setServer] = useState({});

  useEffect(() => {
    if (serverId) {
      dispatch(fetchServerById(serverId))
        .then((serverData) => {
          setServer(serverData?.payload?.data || {}); // Use fallback for server data
        })
        .catch((error) => console.error("Error fetching server:", error));
    }
  }, [serverId, inviteCode, dispatch]);

  const acceptInvite = useCallback(async () => {
    try {
      const token = inviteCode.replaceAll("@@", ".");
      await joinServer(token);
      navigate(`/channels/${serverId}`);
      Toast.showSuccess("Successfully joined server");
    } catch (error) {
      console.error("Error joining server:", error);
    }
  }, [inviteCode, navigate, serverId]);

  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      222
      <div className="text-center bg-gray-800 p-8 rounded-xl shadow-lg bg-opacity-80">
        <h1 className="text-4xl font-bold text-white mb-4">Discord</h1>
        <div className="bg-gray-700 p-6 rounded-lg mb-6">
          <img
            src={server?.imageUrl}
            alt="Server avatar"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-white mb-2">
            {server?.serverName || "Unknown Server"}
          </h2>
          <p className="text-green-500 mb-4">1 Online</p>
          <p className="text-gray-400">{server?.members?.length} Members</p>
        </div>
        <button
          className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-full hover:bg-indigo-500 transition duration-300"
          onClick={acceptInvite}
        >
          Accept Invite
        </button>
      </div>
    </div>
  );
};

export default InvitePage;
