import main from "../../../database/conn";
import User from "../../../model/userSchema";
import generateToken from "../../../utils/generateToken";

const Create = async (req, res) => {
  main().catch((err) => console.error(err));
  const { fullname, email, mobile, password } = req.body;

  if (await User.findOne({ email })) {
    res.status(409).json({ error: "email is already exist" });
  } else if (await User.findOne({ mobile })) {
    res.status(409).json({ error: "Mobile number is already exist" });
  } else {
    const user = await User.create({ fullname, email, mobile, password });
    res.status(201).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      mobile: user.mobile,
      password: user.password,
      isAdmin: user.isAdmin,
      token: generateToken(user._id, user.isAdmin),
    });
    // res.status(201).json({ email: user.email, password: password });
  }
};

export default Create;
