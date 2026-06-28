import main from "../../../database/conn";
import Product from "../../../model/productSchema";
import jwt from "jsonwebtoken";
import S3 from "aws-sdk/clients/s3";

const Delete = async (req, res) => {
  try {
    await main();

    //
    // 🔥 TOKEN VALIDATION
    //
    const token =
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_KEY
    );

    if (!decoded?.isAdmin) {
      return res.status(401).json({
        error: "Access Denied",
      });
    }

    //
    // 🔥 PRODUCT ID
    //
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "Product ID required",
      });
    }

    //
    // 🔥 FIND PRODUCT
    //
    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    //
    // 🔥 AWS S3
    //
    const s3 = new S3({
      region: process.env.AWS_BUCKET_REGION,

      accessKeyId: process.env.AWS_KEY,

      secretAccessKey:
        process.env.AWS_SECRET,
    });

    //
    // 🔥 DELETE IMAGES
    //
    if (
      product.images &&
      product.images.length > 0
    ) {
      await Promise.all(
        product.images.map(async (img) => {
          try {
            const key =
              img.split(".com/")[1];

            if (key) {
              await s3
                .deleteObject({
                  Bucket:
                    process.env.AWS_BUCKET_NAME,

                  Key: key,
                })
                .promise();
            }
          } catch (err) {
            console.error(
              "Image delete failed:",
              err.message
            );
          }
        })
      );
    }

    //
    // 🔥 DELETE VIDEOS
    //
    if (
      product.videos &&
      product.videos.length > 0
    ) {
      await Promise.all(
        product.videos.map(async (video) => {
          try {
            const key =
              video.split(".com/")[1];

            if (key) {
              await s3
                .deleteObject({
                  Bucket:
                    process.env.AWS_BUCKET_NAME,

                  Key: key,
                })
                .promise();
            }
          } catch (err) {
            console.error(
              "Video delete failed:",
              err.message
            );
          }
        })
      );
    }

    //
    // 🔥 DELETE PRODUCT
    //
    await Product.findByIdAndDelete(id);

    //
    // 🔥 UPDATED PRODUCTS
    //
    const updatedData =
      await Product.find({})
        .sort({ createdAt: -1 });

    //
    // 🔥 SUCCESS
    //
    return res.status(200).json({
      success: true,

      message:
        "✅ Product deleted successfully",

      updatedData,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,

      error:
        err.message ||
        "Something went wrong",
    });
  }
};

export default Delete;