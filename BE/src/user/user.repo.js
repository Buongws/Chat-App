import User from "./user.model.js";

//user repositories
const getUserByEmail = (email) => {
  return User.findOne({ email });
};

const getUserById =  (userId) => {
    return User.findOne({_id: userId});
}

const createUser = (user) => {
  return User.create(user);
};

const updateUser =  (userId, user) => {
    return User.findOneAndUpdate({ _id: userId }, user, {new: true});
}

const deleteUser =  (userId) => {
    return User.findOneAndDelete({ _id: userId });
}

const getAllUsers = () => {
  return User.find();
};

export default {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
};
