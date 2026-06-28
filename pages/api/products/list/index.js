import main from "../../../../database/conn";
import Product from "../../../../model/productSchema";
import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: '*' // Allow all origins for simplicity. Modify as needed.
});

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

const getProducts = async (req, res) => {
  // Run the middleware
  await runMiddleware(req, res, cors);

  // Connect to the database
  await main().catch((err) => console.error(err));
  
  try {
    const products = await Product.find({}, { main_image: 0, desc: 0 });
    // .sort({ updatedAt: -1 })
    // .populate({ path: "brand_id", select: "_id name" })
    // .populate({ path: "category_id", select: "_id name" });

    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(404).json({ message: "Products not found" });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export default getProducts;
