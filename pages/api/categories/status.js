import main from "../../../database/conn";
import Category from "../../../model/categorySchema";
import slugify from "slugify";
import jwt from "jsonwebtoken";

const Status = async (req, res) => {
  main().catch((err) => console.error(err));
  const token = await req.headers.authorization.split(" ")[1];
  const token_data = await jwt.verify(token, process.env.JWT_KEY);

  const { id, active } = req.body;
  if (token_data.isAdmin) {
    await Category.updateMany(
      {
        $or: [{ _id: id }, { parent_id: id }],
      },
      { $set: { active: active } }
    );

    const updatedData = await Category.find({}).sort({ updatedAt: -1 });
    res.status(200).json({
      message: "Category updated successfully",
      updatedData: updatedData,
    });
  } else {
    res.status(401).json({ error: "Access Denied" });
  }
};

export default Status;
