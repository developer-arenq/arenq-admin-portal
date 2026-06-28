import main from "../../../database/conn";
import Brand from "../../../model/brandSchema";
import slugify from "slugify";
import jwt from "jsonwebtoken";

// Defining the Create function as an asynchronous function
const Create = async (req, res) => {
  // Establishing database connection
  main().catch((err) => console.error(err));

  // Retrieving token from header and decoding it
  const token = await req.headers.authorization.split(" ")[1];
  const token_data = await jwt.verify(token, process.env.JWT_KEY);

  // Retrieving name, owner, and email from request body
  const { name, owner, email } = req.body;

  // Checking if user is admin
  if (token_data.isAdmin) {
    // Creating an object for the new brand
    const brandObj = {
      name,
      slug: slugify(name),
      owner,
      email,
    };

    try {
      // Saving the new brand to the database
      const newBrand = await Brand(brandObj).save();

      // Retrieving updated data from the database
      const updatedData = await Brand.find({}).sort({ updatedAt: -1 });

      // Sending success response with updated data
      res.status(201).json({
        message: "Brand added successfully",
        updatedData: updatedData,
      });
    } catch (error) {
      // Sending error response if brand already exists
      res.status(500).json({ error: "Brand already exists" });
    }
  } else {
    // Sending error response if user is not an admin
    res.status(401).json({ error: "Access Denied" });
  }
};

// Exporting the Create function
export default Create;
