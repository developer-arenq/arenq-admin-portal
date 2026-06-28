// Importing necessary modules
import main from "../../../database/conn";
import Brand from "../../../model/brandSchema";
import slugify from "slugify";
import jwt from "jsonwebtoken";

// Defining the Delete function as an asynchronous function
const Delete = async (req, res) => {
  // Establishing database connection
  main().catch((err) => console.error(err));

  // Retrieving token from header and decoding it
  const token = await req.headers.authorization.split(" ")[1];
  const token_data = await jwt.verify(token, process.env.JWT_KEY);

  // Retrieving id of brand to be deleted from request body
  const { id } = req.body;

  // Checking if user is admin
  if (token_data.isAdmin) {
    // Finding and deleting the brand from the database
    const brand = Brand.findOneAndDelete(
      { _id: id },
      async function (error, docs) {
        if (error) {
          // Sending error response if deletion failed
          res.status(500).json({ error });
        } else {
          // Retrieving updated data from the database
          const data = await Brand.find({}).sort({ updatedAt: -1 });

          // Sending success response with updated data
          res.status(200).json({
            message: "Brand successfully deleted",
            updatedData: data,
          });
        }
      }
    );
  } else {
    // Sending error response if user is not an admin
    res.status(401).json({ error: "Access Denied" });
  }
};

// Exporting the Delete function
export default Delete;
