import { useState } from "react";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import LogoutConfirmModal from "../../CustomModal/CustomLogOutConfirmModal";

export default function LeftMenu({ activeTab, setActiveTab, handleLogout }) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Toggle the logout confirmation modal
  const toggleLogoutModal = () => setIsLogoutModalOpen(!isLogoutModalOpen);

  return (
    <div className="w-full md:w-1/4 bg-[#2f3136] md:pl-12 lg:pl-48 pt-4 pr-2 overflow-y-auto">
      <h4 className="text-gray-400 mt-5 mb-6 text-center md:text-left text-sm font-bold cursor-default">
        My Profile
      </h4>
      <ul className="mt-4 space-y-4 cursor-pointer">
        <li
          className={`p-2 rounded ${
            activeTab === "Overview"
              ? "bg-gray-700 text-white"
              : "hover:bg-gray-700 text-gray-400"
          }`}
          onClick={() => setActiveTab("Overview")}
        >
          Overview
        </li>
        <hr className="my-2" />
        <li
          className={`p-2 rounded flex items-center justify-between ${
            activeTab === "Roles"
              ? "bg-gray-700 text-white"
              : "hover:bg-gray-700 text-gray-400"
          }`}
          onClick={toggleLogoutModal} // Only open the logout confirmation modal
        >
          Log out
          <ArrowLeftStartOnRectangleIcon className="w-5 h-5 ml-2" />
        </li>
      </ul>

      {/* Logout confirmation modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        toggle={toggleLogoutModal}
        onConfirm={handleLogout} // Pass handleLogout directly to onConfirm
      />
    </div>
  );
}
