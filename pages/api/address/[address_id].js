import main from "../../../database/conn";
import Address from "../../../model/userAddressSchema";
// import { useParams } from "react-router-dom";

const getAddress = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    const { address_id } = req.query;
    const address = await Address.findById({ _id: address_id });
    if (address) {
      res.status(200).json(address);
    } else {
      res.status(400).json({ mesage: "address not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default getAddress;
