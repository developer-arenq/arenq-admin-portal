// pages/api/users/delete.js
import main from "../../../database/conn";
import User from "../../../model/userSchema";

const DeleteUser = async (req, res) => {
  await main().catch((err) => {
    console.error(err);
    return res.status(500).json({ error: "DB connection error" });
  });

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID required" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted", userId });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export default DeleteUser;
