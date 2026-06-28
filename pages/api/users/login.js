import main from "../../../database/conn";
import User from "../../../model/userSchema";
import generateToken from "../../../utils/generateToken";

const login = async (req, res) => {
  main().catch((err) => console.error(err));

  const { email, password } = req.body;
  const user = await User.findOne({ email, isAdmin: true });
  if (user) {
    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      const token = generateToken(user._id, user.isAdmin);
      const userData = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        isAdmin: user.isAdmin,
        token,
      };
      res.status(200).json(userData);
    } else {
      res.status(401).json({ error: "Invalid admin credentials" });
    }
  } else {
    res.status(404).json({ error: "Invalid credentials" });
  }
};

export default login;
