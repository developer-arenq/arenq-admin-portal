// import necessary modules
import main from "../../../database/conn";
import Policy from "../../../model/policySchema";
import jwt from "jsonwebtoken";

// define Delete function
const Delete = async (req, res) => {
  try {
    // establish database connection
    main();

    // check for authorization token in headers
    const token = req.headers.authorization?.split(" ")[1];
    const tokenData = jwt.verify(token, process.env.JWT_KEY);

    // if user is not admin, return unauthorized status
    if (!token || !tokenData.isAdmin) {
      return res.status(401).json({ error: "Access Denied" });
    }

    // find and delete policy document by id
    const deletedPolicy = await Policy.findByIdAndDelete(req.body.id);

    // if policy document is not found, return not found status
    if (!deletedPolicy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    // get all policy data
    const updatedData = await Policy.find({}).sort({ updatedAt: -1 });

    // return success message and updated data
    return res.status(200).json({
      message: "Policy successfully deleted",
      deletedPolicy,
      updatedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

// export Delete function
export default Delete;
