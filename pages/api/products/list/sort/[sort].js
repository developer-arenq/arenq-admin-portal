import main from "../../../../../database/conn";
import Product from "../../../../../model/productSchema";
// import { useParams } from "react-router-dom";

const getProducts = async (req, res) => {
  main().catch((err) => console.error(err));
  const { sort } = await req.query;
  let sort_by;
  if (sort == "lth") {
    sort_by = "MRP";
  } else if (sort == "a-z") {
    sort_by = "name";
  } else if (sort == "z-a") {
    sort_by = "-name";
  } else {
    sort_by = "-MRP";
  }
  try {
    const products = await Product.find({}).sort(sort_by);
    if (products) {
      res.status(200).json(products);
    } else {
      res.status(400).json({ mesage: "Products not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default getProducts;
