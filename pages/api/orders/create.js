import main from "../../../database/conn";
import Order from "../../../model/orderSchema";

const Create = async (req, res) => {
  main().catch((err) => console.error(err));
  const {
    user_id,
    order_items,
    payment_method,
    shipping_price,
    shipping_address,
    total,
    transaction_id,
  } = req.body;

  if (order_items.length < 1) {
    res.status(500).json({ error: "invalid order" });
  } else {
    const order = await Order.create({
      user_id,
      order_items,
      payment_method,
      total,
      isPaid: transaction_id ? true : false,
      transaction_id,
      shipping_price,
      shipping_address,
    });
    res.status(201).json({
      id: order._id,
    });
    // res.status(201).json({ email: user.email, password: password });
  }
};

export default Create;
