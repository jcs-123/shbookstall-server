import User from "../models/User.js";

// Get all users
export const getUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.json(users); // ✅ Must return an array
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// Add user
export const addUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const newUser = new User({ username, email, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  try {
    const user = await User.findById(id);
    if (user) {
      user.username = username;
      user.email = email;
      user.password = password;
      user.role = role;
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
