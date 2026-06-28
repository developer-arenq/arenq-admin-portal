import main from "../../../../database/conn";
import Address from "../../../../model/userAddressSchema";
// import { useParams } from "react-router-dom";

const getAddress = async (req, res) => {
  main().catch((err) => console.error(err));
  const { address_id } = await req.query;
  Address.findByIdAndUpdate(
    address_id,
    await req.body,
    async function (err, addr) {
      if (err) {
        res.status(500).json({ mesage: err });
      } else {
        res.status(200).json(await Address.find({}));
      }
    }
  );
};

export default getAddress;
