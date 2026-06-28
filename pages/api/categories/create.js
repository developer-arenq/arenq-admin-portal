import main from "../../../database/conn";
import Category from "../../../model/categorySchema";
import slugify from "slugify";
import jwt from "jsonwebtoken";

const Create = async (req, res) => {
  await main();

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const tokenData = jwt.verify(token, process.env.JWT_KEY);

    if (!tokenData.isAdmin) {
      return res.status(401).json({
        success: false,
        message: "Access Denied",
      });
    }

    const { name, parent_id } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Duplicate Check
    const exist = await Category.findOne({
      slug,
      parent_id: parent_id || null,
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    // Create Category
    const category = await Category.create({
      name: name.trim(),
      slug,
      parent_id: parent_id || null,
      active: true,
    });

    // Get Latest Categories
    const updatedData = await Category.find().sort({
      createdAt: -1,
    });

    return res.status(201).json({
      success: true,
      message: "Category Added Successfully",
      category,
      updatedData,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export default Create;