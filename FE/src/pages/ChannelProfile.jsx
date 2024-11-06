import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeSocket } from "../actions/socketActions";
import Footer from "../components/ChannelList/Footer";
import { fetchAllUsers } from "../api/main";
import RightSection from "../components/RightSectionComponents/RightSection";
import { fetchUserDetails } from "../actions/userActions";
import ListUsers from "../components/ListUsers/ListUsers";

const ChannelProfile = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const dispatch = useDispatch();
  const { onlineUsers } = useSelector((state) => state.onlineUsers);
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    dispatch(initializeSocket());
    dispatch(fetchUserDetails());
  }, [dispatch]);

  // Fetch all users and exclude the current user initially
  useEffect(() => {
    const listAllUsers = async () => {
      try {
        const response = await fetchAllUsers();
        const allUsers = response.data;

        // Exclude the current user when first fetching the users
        if (currentUser?.data?.userId) {
          const filteredUsers = allUsers.filter(
            (user) => user.userId !== currentUser.data.userId
          );
          setUsers(filteredUsers);
        } else {
          setUsers(allUsers); // If currentUser is not available yet
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    listAllUsers();
  }, [currentUser]);

  // Reorder users based on online/offline status
  useEffect(() => {
    const reorderUsers = () => {
      const online = users.filter((user) => onlineUsers.includes(user.userId));
      const offline = users.filter(
        (user) => !onlineUsers.includes(user.userId)
      );
      setUsers([...online, ...offline]);
    };

    if (onlineUsers && users.length) {
      reorderUsers();
    }
  }, [onlineUsers, currentUser]);

  return (
    <div className="flex flex-row h-screen bg-[#36393F] w-full overflow-y-auto">
      {/* Left Sidebar: List of users */}
      <div className="relative flex flex-col w-64 bg-[#2f3136] text-white">
        {users.length > 0 && (
          <ListUsers
            users={users}
            onlineUsers={onlineUsers}
            handleClickUser={setSelectedUser}
            isDirectMessage={true}
          />
        )}
        <Footer />
      </div>

      {/* Right Section: Chat with Selected Friend */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <RightSection
            selectedChannelId={selectedUser.userId}
            userName={selectedUser.name}
            isDirectMessage={true}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-white text-2xl">Select a user to chat</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelProfile;
