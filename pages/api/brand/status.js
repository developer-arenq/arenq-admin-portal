// Importing necessary modules
import main from "../../../database/conn";
import Brand from "../../../model/brandSchema";
import slugify from "slugify";
import jwt from "jsonwebtoken";

// Defining the Status function as an asynchronous function
const Status = async (req, res) => {
  // Establishing database connection
  main().catch((err) => console.error(err));

  // Retrieving token from header and decoding it
  const token = await req.headers.authorization.split(" ")[1];
  const token_data = await jwt.verify(token, process.env.JWT_KEY);

  // Retrieving id and active status of brand to be updated from request body
  const { id, active } = req.body;

  // Checking if user is admin
  if (token_data.isAdmin) {
    // Updating the active status of the brand in the database
    await Brand.updateOne({ _id: id }, { $set: { active: active } });

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

// Exporting the Status function
export default Status;
