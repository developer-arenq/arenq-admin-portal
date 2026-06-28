import main from "../../../database/conn";
import Category from "../../../model/categorySchema";
import slugify from "slugify";
import jwt from "jsonwebtoken";

const Update = async (req, res) => {
  main().catch((err) => console.error(err));
  const token = await req.headers.authorization.split(" ")[1];
  const token_data = await jwt.verify(token, process.env.JWT_KEY);

  const { name, id } = req.body;
  if (token_data.isAdmin) {
    const categoryObj = {
      name,
      parent_id: req.body.parent_id ? req.body.parent_id : null,
    };

    await Category.updateOne({ _id: id }, categoryObj);
    const updatedData = await Category.find({}).sort({ updatedAt: -1 });
    res.status(200).json({
      message: "Category updated successfully",
      updatedData: updatedData,
    });
  } else {
    res.status(401).json({ error: "Access Denied" });
  }
};

export default Update;
