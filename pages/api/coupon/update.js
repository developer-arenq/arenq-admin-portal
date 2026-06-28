import main from "../../../database/conn";
import Coupon from "../../../model/couponSchema";
import jwt from "jsonwebtoken";

const update = async (req, res) => {
  main().catch((err) => console.error(err));
  const token = await req.headers.authorization.split(" ")[1];
  const token_data = await jwt.verify(token, process.env.JWT_KEY);

  const { id } = req.body;

  if (token_data.isAdmin) {
    const couponObj = await req.body;
    if (couponObj.flat_discount == undefined) {
      couponObj.flat_discount = 0;
    } else {
      couponObj.discount_percent = 0;
    }
    await Coupon.updateOne({ _id: id }, couponObj);

    const updatedData = await Coupon.find({}).sort({ updatedAt: -1 });
    res.status(200).json({
      message: "Coupon updated successfully",
      updatedData: updatedData,
    });
  } else {
    res.status(401).json({ error: "Access Denied" });
  }
};

export default update;
