import main from "../../../database/conn";
import Category from "../../../model/categorySchema";

const list = async (req, res) => {
  try {
    await main(); // ✅ MUST

    const categories = await Category.find({}).sort({ updatedAt: -1 });

    return res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export default list;