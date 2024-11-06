import { apiClientServer, apiClientChannel, getAccessToken } from "./apiConfig";

// Helper function to set the Authorization header
const authHeader = () => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Access token is missing. Please log in again.");
  }
  return { Authorization: `Bearer ${accessToken}` };
};

export const getUserById = async () => {
  try {
    const response = await apiClientServer.get(`/user/detail`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};
export const getServerById = async (id) => {
  try {
    const response = await apiClientServer.get(`/server/${id}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching server:", error);
    throw error;
  }
};

export const getInviteCodeById = async (id) => {
  console.log("id", id);

  try {
    const response = await apiClientServer.get(
      `/server/get-invite-code/${id}`,
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching server:", error);
    throw error;
  }
};

export const updateForgotPassword = async (data) => {
  try {
    const response = await apiClientServer.post(
      `/user/request-password-reset/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching server:", error);
    throw error;
  }
};

export const resetPassword = async (token, data) => {
  try {
    const response = await apiClientServer.post(
      `/user/reset-password/${token}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching server:", error);
    throw error;
  }
};

export const getServersByUserId = async () => {
  try {
    const response = await apiClientServer.get("/server/user/servers", {
      headers: authHeader(),
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching servers:", error);
    throw error;
  }
};

export const createServerByUserId = async (server) => {
  try {
    const response = await apiClientServer.post("/server", server, {
      headers: authHeader(),
    });

    return response.data;
  } catch (error) {
    console.error("Error creating server:", error);
    throw error;
  }
};

export const updateServerByServerId = async (id, data) => {
  try {
    const response = await apiClientServer.put(`/server/${id}`, data, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating server:", error);
    throw error;
  }
};

export const deleteMemberFromServer = async (serverId, data) => {
  try {
    const response = await apiClientServer.delete(
      `/server/remove-member/${serverId}`,
      {
        data: data,
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting server:", error);
    throw error;
  }
};

export const updateUserByToken = async (data) => {
  try {
    const response = await apiClientServer.put(`/user/update-user`, data, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating server:", error);
    throw error;
  }
};

export const updateUserPassword = async (data) => {
  try {
    const response = await apiClientServer.put(`/user/update-password`, data, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.log("Error updating password:", error);

    throw error;
  }
};

export const updateChannelById = async (id, data) => {
  try {
    const response = await apiClientChannel.put(`/channel/${id}`, data, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating channel:", error);
    throw error;
  }
};

export const deleteChannelById = async (id) => {
  try {
    const response = await apiClientChannel.delete(`/channel/${id}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting channel:", error);
  }
};

export const getAllMembersByServerId = async (serverId) => {
  try {
    const response = await apiClientServer.get(
      `/server/get-members/${serverId}`,
      {
        headers: authHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
};

const validateChannel = (channel) => {
  if (!channel.channelName) throw new Error("Channel name is required");
  if (!channel.channelType) throw new Error("Channel type is required");
  if (!channel.serverId) throw new Error("Server ID is required");
};

export const getChannelsByServerId = async (serverId) => {
  try {
    const response = await apiClientChannel.get(`/channel/${serverId}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching channels:", error);
    throw error;
  }
};

export const getChannelByChannelId = async (serverId, channelId) => {
  try {
    const response = await apiClientChannel.get(
      `/channel/${serverId}/${channelId}`,
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching channel:", error);
    throw error;
  }
};

export const getChannels = async () => {
  try {
    const response = await apiClientChannel.get("/channel", {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching channels:", error);
    throw error;
  }
};

export const createChannel = async (channel) => {
  try {
    validateChannel(channel);
    const response = await apiClientChannel.post("/channel", channel, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating channel:", error);
    throw error;
  }
};

// FETCH MESSAGE

export const getMessagesByChannelId = async (channelId) => {
  try {
    const response = await apiClientChannel.get(`/message/${channelId}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const createMessageByChannelId = async (channelId, message) => {
  try {
    const response = await apiClientChannel.post(
      `/message/${channelId}`,
      {
        message: message,
      },
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
};

// FETCH USER

export const fetchAllUsers = async () => {
  try {
    const response = await apiClientChannel.get("/user", {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const joinServer = async (token) => {
  try {
    const response = await apiClientServer.get(`/server/join-server/${token}`, {
      headers: authHeader(),
    });

    return response.data;
  } catch (error) {
    console.error("Error joining server:", error);
    throw error;
  }
};

export const fetchUserById = async () => {
  try {
    const response = await apiClientChannel.get("/user/detail", {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// FETCH DIRECT MESSAGE

export const getMessagesByRecipientId = async (recipientId) => {
  try {
    const response = await apiClientChannel.get(
      `/directMessage/${recipientId}`,
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const createDirectMessageByRecipientId = async (
  recipientId,
  message
) => {
  try {
    const response = await apiClientChannel.post(
      "/directMessage/send",
      {
        recipientId: recipientId,
        message: message,
      },
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
};
