import main from "../../../../database/conn";
import Product from "../../../../model/productSchema";
import Category from "../../../../model/categorySchema";
// import { useParams } from "react-router-dom";

const getProduct = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    const { category } = await req.query;
    const category_by_slug = await Category.find({ slug: category });
    const product = await Product.find({
      category_id: category_by_slug[0]._id,
    });

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(400).json({ mesage: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default getProduct;
