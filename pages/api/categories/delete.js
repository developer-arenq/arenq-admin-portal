import main from "../../../database/conn";
import Category from "../../../model/categorySchema";
import slugify from "slugify";
import jwt from "jsonwebtoken";

const Delete = async (req, res) => {
  main().catch((err) => console.error(err));
  const token = await req.headers.authorization.split(" ")[1];
  const token_data = await jwt.verify(token, process.env.JWT_KEY);

  const { id } = req.body;
  if (token_data.isAdmin) {
    const category = Category.findOneAndDelete(
      { _id: id },
      async function (error, docs) {
        if (error) {
          res.status(500).json({ error });
        } else {
          const data = await Category.find({}).sort({ updatedAt: -1 });
          res.status(200).json({
            message: "Category successfully deleted",
            updatedData: data,
          });
        }
      }
    );
  } else {
    res.status(401).json({ error: "Access Denied" });
  }
};

export default Delete;
