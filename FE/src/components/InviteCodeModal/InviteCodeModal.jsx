import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  InputGroup,
  Input,
} from "reactstrap";
import { inviteApi } from "../../api/apiConfig";
import {
  createDirectMessageByRecipientId,
  fetchAllUsers,
} from "../../api/main";
import { useSelector } from "react-redux";
import Toast from "../../utility/toast";

function InviteCodeModal({
  isOpen,
  toggle,
  inviteCode,
  serverId,
  remainingTime,
}) {
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const currentUser = useSelector((state) => state.user.user);
  const socket = useSelector((state) => state.socket.socket);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const response = await fetchAllUsers();
        const allUsers = response.data;
        if (currentUser?.data?.userId) {
          const filteredUsers = allUsers.filter(
            (user) => user.userId !== currentUser.data.userId
          );
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    getAllUsers();
  }, [currentUser]);

  const handleCopy = () => {
    const code = inviteCode.replaceAll(".", "@@");
    navigator.clipboard.writeText(`${inviteApi}/${serverId}/${code}`);
    setCopied(true);
    Toast.showSuccess("Invite code copied to clipboard");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = useCallback((time) => {
    const days = Math.floor(time / (24 * 60 * 60));
    const hours = Math.floor((time % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((time % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }, []);

  const handleInvite = async (userId) => {
    // Implement the invite API call here
    //check whether socket subcribe the channel or not
    const channelName =
      currentUser.data.userId > userId
        ? `${currentUser.data.userId}${userId}`
        : `${userId}${currentUser.data.userId}`;
    if (!socket.isSubscribed(channelName)) {
      socket.subscribe(channelName);
    }
    const code = inviteCode.replaceAll(".", "@@");
    const newMessage = await createDirectMessageByRecipientId(
      userId,
      `${inviteApi}/${serverId}/${code}`
    );
    Toast.showSuccess("Invite sent successfully");
    socket.transmitPublish(channelName, newMessage.data);
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        toggle={toggle}
        className="text-gray-300 custom-modal"
        centered={true}
      >
        <ModalHeader
          toggle={toggle}
          className=" items-center bg-[#2f3136] text-gray-300 border-b-0 font-medium hover:text-white "
        >
          <p>Invite People to your Server</p>
        </ModalHeader>
        <ModalBody className="bg-[#2f3136] text-gray-300 rounded-b-md">
          <div className="searchBar">
            <Input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search for friends..."
              className="bg-[#201F1F] text-white placeholder-gray-300 focus:bg-[#36393F]  mb-3 mt-[-5px] border-none"
            />
          </div>
          <div className="userList max-h-60 overflow-y-auto mb-6 scrollbar-thin scrollbar-thumb-[#959bac] scrollbar-track-[#2F3136] scrollbar-thumb-rounded">
            {filteredUsers.map((user) => (
              <div
                key={user.userId}
                className="inviteRow flex justify-between items-center p-2 hover:bg-[#36393F] rounded transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center">
                  <img
                    src={user?.imageUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <span className="text-sm text-gray-200">{user.name}</span>
                </div>
                <Button
                  onClick={() => handleInvite(user.userId)}
                  className="mr-2 border-green-500 py-1.5 px-3 text-[14px] text-white hover:bg-green-500 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Invite
                </Button>
              </div>
            ))}
          </div>

          <p>Use this invite code to invite friends to your server:</p>
          <InputGroup className="mt-3 ">
            <Input
              value={inviteCode}
              readOnly
              className="bg-[#36393F] text-gray-50 focus:bg-[#36393F]"
            />
            <Button
              onClick={handleCopy}
              className={`py-2 px-3 rounded-full text-white transition-colors ${
                copied ? "bg-green-500" : "bg-DiscordPurple"
              }`}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </InputGroup>
          <p className="mt-3 text-xs">
            The remaining time of invite code is {formatTime(remainingTime)}.
          </p>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default InviteCodeModal;
