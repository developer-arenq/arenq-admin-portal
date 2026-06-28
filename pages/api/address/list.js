import main from "../../../database/conn";
import Address from "../../../model/userAddressSchema";

const getAddress = async (req, res) => {
  main().catch((err) => console.error(err));
  const addressList = await Address.find({});
  if (addressList) {
    return res.status(200).json(addressList);
  } else {
    return res.status(500).json("address not found");
  }
};

export default getAddress;
