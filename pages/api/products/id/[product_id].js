import main from "../../../../database/conn";
import Product from "../../../../model/productSchema";
// import { useParams } from "react-router-dom";

const getProduct = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    const { product_id } = req.query;
    const product = await Product.findById({ _id: product_id });
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
