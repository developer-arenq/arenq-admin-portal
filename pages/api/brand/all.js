import main from "../../../database/conn";
import Brand from "../../../model/brandSchema";

// Define the list function as an async function that takes in a request (req) and a response (res) object
const list = async (req, res) => {
  // Call the main function to connect to the database
  await main().catch((err) => console.error(err));

  try {
    // Use the Brand model to find all documents in the "brands" collection
    const brands = await Brand.find({}).sort({ updatedAt: -1 });

    // Send a response with a status code of 200 and the brands array as the body
    res.status(200).json(brands);
  } catch (error) {
    // Send a response with a status code of 404 and an error message as the body if there is an error
    res.status(404).json({ message: "Not Found" });
  }
};

// Export the list function as the default export of the module
export default list;
