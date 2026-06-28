import main from "../../../../database/conn";
import Payment from "../../../../model/paymentSchema";
// import { useParams } from "react-router-dom";

const getPaymentDetails = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    const { payment_id } = req.query;
    const payment = await Payment.findById({ _id: payment_id });
    if (payment) {
      res.status(200).json(payment);
    } else {
      res.status(400).json({ mesage: "Payment not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default getPaymentDetails;
