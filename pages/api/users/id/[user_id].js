import main from "../../../../database/conn";
import User from "../../../../model/userSchema";
// import { useParams } from "react-router-dom";

const getUserById = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    const { user_id } = req.query;
    const user = await User.findById({ _id: user_id }, { fullname: 1 });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(400).json({ mesage: "user not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default getUserById;
