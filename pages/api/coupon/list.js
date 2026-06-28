import main from "../../../database/conn";
import Coupon from "../../../model/couponSchema";
// import { useParams } from "react-router-dom";

const getCoupons = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    const coupons = await Coupon.find({}).sort({ updatedAt: -1 });
    if (coupons) {
      res.status(200).json(coupons);
    } else {
      res.status(400).json({ mesage: "Coupons not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default getCoupons;
