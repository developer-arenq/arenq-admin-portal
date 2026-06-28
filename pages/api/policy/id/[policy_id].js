import main from "../../../../database/conn";
import Policy from "../../../../model/policySchema";
// import { useParams } from "react-router-dom";

const getPolicy = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    const { policy_id } = req.query;
    const policy = await Policy.findById({ _id: policy_id });
    if (policy) {
      res.status(200).json(policy);
    } else {
      res.status(400).json({ mesage: "Policy not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default getPolicy;
