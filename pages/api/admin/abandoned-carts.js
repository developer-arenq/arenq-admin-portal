import dbConnect from "../../../database/conn";

import Cart from "../../../model/Cart";

import User from "../../../model/userSchema";

export default async function handler(
  req,
  res
) {
  await dbConnect();

  try {
    // GET CARTS

    const carts = await Cart.find({})
      .sort({
        createdAt: -1,
      })
      .lean();

    // SAFE USER FETCH

    const cartsWithUsers =
      await Promise.all(
        carts.map(async (cart) => {
          let user = null;

          // CHECK USER ID

          if (cart.user_id) {
            try {
              user =
                await User.findById(
                  cart.user_id
                ).lean();
            } catch (err) {
              console.log(
                "Invalid User ID"
              );
            }
          }

          return {
            ...cart,

            user,
          };
        })
      );

    return res.status(200).json(
      cartsWithUsers
    );
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch carts",
    });
  }
}