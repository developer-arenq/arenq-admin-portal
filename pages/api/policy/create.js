// import necessary modules
import main from "../../../database/conn";
import Policy from "../../../model/policySchema";
import jwt from "jsonwebtoken";

// define Create function
const Create = async (req, res) => {
  try {
    // establish database connection
    main();

    // extract authorization token from headers and verify
    const token = req.headers.authorization?.split(" ")[1];
    const tokenData = jwt.verify(token, process.env.JWT_KEY);

    // if user is not authorized, return error
    if (!token || !tokenData.isAdmin) {
      return res.status(401).json({ error: "Access Denied" });
    }

    // create new policy document and save
    await Policy(req.body).save();
    // get all policy data
    const updatedData = await Policy.find({}).sort({ updatedAt: -1 });
    // return success message and updated data
    return res.status(201).json({
      message: "Policy successfully created",
      updatedData,
    });
  } catch (error) {
    // log error and return internal server error status
    console.error(error);
    return res.status(500).json({ error });
  }
};

// export Create function
export default Create;
