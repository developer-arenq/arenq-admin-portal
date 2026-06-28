import jwt from "jsonwebtoken";

const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_KEY, {
    expiresIn: "15d",
  });
};

export default generateToken;
