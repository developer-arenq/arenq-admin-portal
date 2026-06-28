import main from "../../../database/conn";
import Policy from "../../../model/policySchema";
import jwt from "jsonwebtoken";

const Update = async (req, res) => {
  try {
    main();

    const token = req.headers.authorization?.split(" ")[1];
    const tokenData = jwt.verify(token, process.env.JWT_KEY);

    if (!token || !tokenData.isAdmin) {
      return res.status(401).json({ error: "Access Denied" });
    }

    const { policy_id } = req.body;

    // find the policy document to update
    const policy = await Policy.findById(policy_id);

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    // update the policy document
    policy.set(req.body);
    await policy.save();

    // get all policy data
    const updatedData = await Policy.find({}).sort({ updatedAt: -1 });

    return res.status(200).json({
      message: "Policy successfully updated",
      updatedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export default Update;
