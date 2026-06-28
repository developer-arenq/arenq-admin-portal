import main from "../../../../database/conn";
import Product from "../../../../model/productSchema";
// import { useParams } from "react-router-dom";

const getSearchProduct = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    const { product_name } = await req.query;
    const product = await Product.find({});
    let search_products = [];
    if (product_name) {
      search_products = product.filter((x) =>
        x.name?.toLowerCase().includes(product_name?.toLowerCase())
      );
    } else {
      search_products = [];
    }
    if (search_products) {
      res.status(200).json(search_products);
    } else {
      res.status(400).json({ mesage: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default getSearchProduct;
