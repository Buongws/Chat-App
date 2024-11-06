import DeleteMemberModal from "../Modals/DeleteMemberModal";
import { useCallback, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
const ListUsers = ({
  serverId,
  users,
  onlineUsers,
  handleClickUser,
  isDirectMessage,
  ownerId,
  handleUpdate,
  isOwner,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const toggleModal = useCallback(() => {
    setModalOpen(!modalOpen);
    if (handleUpdate) {
      handleUpdate();
    }
  }, [modalOpen]);

  const handleUserClick = (user) => {
    if (isDirectMessage) {
      handleClickUser(user);
    } else {
      setSelectedUser(user);
      if (handleUpdate) {
        handleUpdate();
      }
    }
  };

  return (
    <>
      <div
        className={`overflow-y-auto overflow-hidden scrollbar-thin scrollbar-thumb-[#959bac] scrollbar-track-[#2F3136] scrollbar-thumb-rounded items-center rounded-sm ${
          isDirectMessage ? "w-full" : "w-[15vw] bg-[#2f3136] text-white"
        }`}
      >
        <h2 className="flex justify-between items-center py-[25px] pl-[13px] pr-[8px] shadow-md bg-[#36393F] text-white font-bold">
          {isDirectMessage ? "Direct Messages" : "Members"}
        </h2>
        <div className="flex flex-col space-y-2">
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-gray-700"
                onClick={() => handleUserClick(user)}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={user.imageUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <p className="text-s">
                    {user.name.length > 10
                      ? `${user.name.slice(0, 13)}...`
                      : user.name}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status dot */}
                  {onlineUsers.includes(user.userId) ? (
                    <div className="relative group">
                      <span className="text-green-500">●</span>
                      <div className="absolute bottom-full right-full mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                        Online
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <span className="text-gray-400">●</span>
                      <div className="absolute bottom-full right-full mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                        Offline
                      </div>
                    </div>
                  )}

                  {/* Trash icon or placeholder */}
                  {isOwner && !isDirectMessage && ownerId !== user.userId ? (
                    <TrashIcon
                      className="w-5 h-5 text-gray-400"
                      onClick={toggleModal}
                    />
                  ) : (
                    // Placeholder to ensure alignment when the TrashIcon isn't visible
                    <div className="w-5 h-5"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No users found</p>
          )}
        </div>
      </div>
      {!isDirectMessage && (
        <DeleteMemberModal
          serverId={serverId}
          isOpen={modalOpen}
          toggle={toggleModal}
          user={selectedUser}
          handleUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default ListUsers;
