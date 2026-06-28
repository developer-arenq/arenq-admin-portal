import main from "../../../database/conn";
import FAQ from "../../../model/faqSchema";
import jwt from "jsonwebtoken";

// Defining the Create function as an asynchronous function
const Create = async (req, res) => {
  // Establishing database connection
  main().catch((err) => console.error(err));

  // Retrieving token from header and decoding it
  const token = await req.headers.authorization.split(" ")[1];
  const token_data = await jwt.verify(token, process.env.JWT_KEY);

  // Checking if user is admin
  if (token_data.isAdmin) {
    try {
      // Saving the new brand to the database
      const faq = await FAQ(req.body).save();

      // Retrieving updated data from the database
      const updatedData = await FAQ.find({}).sort({ updatedAt: -1 });

      // Sending success response with updated data
      res.status(201).json({
        message: "FAQ added successfully",
        updatedData: updatedData,
      });
    } catch (error) {
      // Sending error response if faq already exists
      res.status(500).json({ error: "FAQ already exists" });
    }
  } else {
    // Sending error response if user is not an admin
    res.status(401).json({ error: "Access Denied" });
  }
};

// Exporting the Create function
export default Create;
