import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import {
  ChevronDownIcon,
  UserPlusIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";

import InviteCodeModal from "../InviteCodeModal/InviteCodeModal";
import ServerSettings from "../ServerSettings/ServerSettings";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInviteCodeById,
  fetchServerById,
} from "../../actions/serverActions";

const DropdownServer = ({ serverId, onCreateChannel }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [settings, setSettings] = useState(false);
  const [serverName, setServerName] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);

  const dispatch = useDispatch();
  const previousServerId = useRef(null);

  const { user } = useSelector((state) => state.user);
  const { servers } = useSelector((state) => state.servers);

  const isOwner = servers.some(
    (server) => server._id === serverId && server.owner === user?.data?.userId
  );

  useEffect(() => {
    if (serverId && serverId !== previousServerId.current) {
      previousServerId.current = serverId;
      dispatch(fetchServerById(serverId))
        .then((serverData) => {
          setServerName(serverData?.payload?.data?.serverName);
          setImageUrl(serverData?.payload?.data?.imageUrl);
        })
        .catch((error) => console.error("Error fetching server:", error));

      dispatch(fetchInviteCodeById(serverId))
        .then((inviteCodeData) => {
          setInviteCode(inviteCodeData?.payload?.data?.inviteCode);
          setRemainingTime(inviteCodeData?.payload?.data?.remainingTime);
        })
        .catch((error) => console.error("Error fetching invite code:", error));
    }
  }, [dispatch, serverId]);

  const toggleDropdown = useCallback(
    () => setDropdownOpen(!dropdownOpen),
    [dropdownOpen]
  );
  const toggleModal = useCallback(() => setModal(!modal), [modal]);

  const toggleSettings = useCallback(() => setSettings(!settings), [settings]);

  return (
    <div className="flex justify-between items-center py-[19px] pl-[13px] pr-[8px] shadow-md bg-[#36393F] text-white">
      <p className="text-white font-bold">{serverName}</p>

      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
        <DropdownToggle className="border-none bg-transparent text-white hover:bg-[#36393F] rounded-lg">
          <ChevronDownIcon className="h-5 text-white" />
        </DropdownToggle>
        <DropdownMenu className="bg-[#2F3136] text-white shadow-lg rounded-lg border-none mt-2">
          <DropdownItem
            className="text-white hover:bg-[#3C3F45]"
            onClick={toggleModal}
          >
            Invite People
            <UserPlusIcon className="h-5 w-5 inline-block ml-2 text-gray-400" />
          </DropdownItem>

          <InviteCodeModal
            serverId={serverId}
            isOpen={modal}
            toggle={toggleModal}
            inviteCode={inviteCode}
            remainingTime={remainingTime}
          />
          <DropdownItem divider />

          {isOwner && (
            <>
              <DropdownItem
                className="text-white hover:bg-[#3C3F45]"
                onClick={toggleSettings}
              >
                Server Settings
                <Cog8ToothIcon className="h-5 w-5 inline-block ml-2 text-gray-400" />
              </DropdownItem>

              <ServerSettings
                isOpen={settings}
                toggle={toggleSettings}
                serverId={serverId}
                serverName={serverName}
                setServerName={setServerName}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
              />

              <DropdownItem
                onClick={onCreateChannel}
                className="text-white hover:bg-[#3C3F45]"
              >
                Create Channel
              </DropdownItem>
            </>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default memo(DropdownServer);
