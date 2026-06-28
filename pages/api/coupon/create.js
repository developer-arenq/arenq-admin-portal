import main from "../../../database/conn";
import Coupon from "../../../model/couponSchema";
import jwt from "jsonwebtoken";

const Create = async (req, res) => {
  main().catch((err) => console.error(err));
  try {
    if (await !req.headers.authorization) {
      res.status(401).json("Add token to access");
    } else {
      const token = await req.headers.authorization.split(" ")[1];
      const token_data = await jwt.verify(token, process.env.JWT_KEY);
      const {
        type,
        coupon_code,
        discount_percent,
        flat_discount,
        valid_from,
        valid_until,
        min,
        max,
        refer_by,
        active,
      } = req.body;
      if (token_data.isAdmin) {
        const couponObj = {
          type,
          coupon_code,
          discount_percent: discount_percent ? Number(discount_percent) : 0,
          flat_discount: flat_discount ? Number(flat_discount) : 0,
          min,
          max,
          valid_from,
          valid_until,
          refer_by,
          active,
        };

        await Coupon(couponObj).save();
        const updatedData = await Coupon.find({}).sort({ updatedAt: -1 });

        res.status(201).json({
          message: "Coupon succefully created",
          updatedData: updatedData,
        });
      } else {
        res.status(401).json({ error: "Access Denied" });
      }
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default Create;
