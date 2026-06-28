import main from "../../../database/conn";
import User from "../../../model/userSchema";
import generateToken from "../../../utils/generateToken";

const Create = async (req, res) => {
  main().catch((err) => console.error(err));
  const userList = await User.find({});
  if (userList) {
    return res.status(200).json(userList);
  } else {
    return res.status(500).json("user not found");
  }
};

export default Create;
