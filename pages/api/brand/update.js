// Importing necessary modules
import main from "../../../database/conn";
import Brand from "../../../model/brandSchema";
import slugify from "slugify";
import jwt from "jsonwebtoken";

// Defining the Update function as an asynchronous function
const Update = async (req, res) => {
  // Establishing database connection
  main().catch((err) => console.error(err));

  // Retrieving token from header and decoding it
  const token = await req.headers.authorization.split(" ")[1];
  const token_data = await jwt.verify(token, process.env.JWT_KEY);

  // Retrieving name and id of brand to be updated from request body
  const { name, id } = req.body;

  // Checking if user is admin
  if (token_data.isAdmin) {
    // Creating a brand object with the updated properties
    const brandObj = {
      name,
      parent_id: req.body.parent_id ? req.body.parent_id : null,
    };

    // Updating the brand in the database
    await Brand.updateOne({ _id: id }, brandObj);

    // Retrieving updated data from the database
    const updatedData = await Brand.find({}).sort({ updatedAt: -1 });

    // Sending success response with updated data
    res.status(200).json({
      message: "Brand updated successfully",
      updatedData: updatedData,
    });
  } else {
    // Sending error response if user is not an admin
    res.status(401).json({ error: "Access Denied" });
  }
};

// Exporting the Update function
export default Update;
