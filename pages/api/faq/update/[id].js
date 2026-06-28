import main from "../../../../database/conn";
import FAQ from "../../../../model/faqSchema";
import jwt from "jsonwebtoken";

// Defining the Update function as an asynchronous function
const Update = async (req, res) => {
  // Establishing database connection
  main().catch((err) => console.error(err));

  // Retrieving token from header and decoding it
  const token = await req.headers.authorization.split(" ")[1];
  const token_data = await jwt.verify(token, process.env.JWT_KEY);
  // Checking if user is admin
  if (token_data.isAdmin) {
    try {
      // Saving the updated faq to the database
      await FAQ.updateOne({ _id: req.query.id }, req.body);

      // Retrieving updated data from the database
      const updatedData = await FAQ.find({}).sort({ updatedAt: -1 });

      // Sending success response with updated data
      res.status(201).json({
        message: "FAQ updated successfully",
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

// Exporting the Update function
export default Update;
