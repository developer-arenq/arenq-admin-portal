import main from "../../../database/conn";
import FAQ from "../../../model/faqSchema";

// Define the list function as an async function that takes in a request (req) and a response (res) object
const get = async (req, res) => {
  // Call the main function to connect to the database
  await main().catch((err) => console.error(err));

  try {
    // Use the faq model to find all documents in the "faqs" collection
    const faq = await FAQ.find({}).sort({ updatedAt: -1 });

    // Send a response with a status code of 200 and the faqs array as the body
    res.status(200).json(faq);
  } catch (error) {
    // Send a response with a status code of 404 and an error message as the body if there is an error
    res.status(404).json({ message: "Not Found" });
  }
};

// Export the get function as the default export of the module
export default get;
