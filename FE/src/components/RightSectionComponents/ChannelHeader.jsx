import { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { UserCircleIcon, UsersIcon } from "@heroicons/react/16/solid";
import { useDispatch } from "react-redux";
import { logout } from "../../actions/auth";
import { useNavigate } from "react-router-dom";
import LogoutConfirmModal from "../CustomModal/CustomLogOutConfirmModal";

const ChannelHeader = ({ isDirectMessage, userName, toggleUserList }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const toggleLogoutModal = () => setIsLogoutModalOpen(!isLogoutModalOpen);

  return (
    <div className="flex justify-between p-3 shadow-md">
      <div className="flex items-center">
        {isDirectMessage ? (
          <div className="ml-3 flex items-center">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
            <p className="text-white font-bold text-lg ml-3">{userName}</p>
          </div>
        ) : (
          <h2 className="text-white font-bold text-lg">Channel Chat</h2>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle className="relative cursor-pointer flex gap-3 border">
            <UserCircleIcon className="w-6 h-6 text-white" />
          </DropdownToggle>
          <DropdownMenu className="bg-[#2F3136] text-white shadow-lg rounded-lg border mt-2">
            <DropdownItem divider />
            <DropdownItem
              onClick={toggleLogoutModal} // Open logout confirmation modal
              className="text-white hover:bg-[#3C3F45]"
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        {!isDirectMessage && (
          <div
            className="member-icon flex cursor-pointer px-[12px] py-[6px] rounded-lg hover:bg-gray-700 border"
            onClick={toggleUserList}
          >
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        toggle={toggleLogoutModal}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default ChannelHeader;
