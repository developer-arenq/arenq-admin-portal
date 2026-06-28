import main from "../../../database/conn";
import Address from "../../../model/userAddressSchema";

const Create = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    const {
      user_id,
      order_items,
      payment_method,
      shipping_price,
      total,
      transaction_id,
      address_line,
      city,
      postal_code,
      country,
      mobile,
      email,
    } = req.body;
    const addressObj = {
      user_id,
      email,
      address_line,
      city,
      postal_code,
      country,
      mobile,
    };

    const address = await Address(addressObj).save();
    res.status(201).json({ shipping_address: address._id });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default Create;
