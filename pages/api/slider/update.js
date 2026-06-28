import main from "../../../database/conn";
import multer from "multer";
import nextConnect from "next-connect";
import S3 from "aws-sdk/clients/s3";
import Slider from "../../../model/sliderSchema";

const upload = multer({ storage: multer.memoryStorage() });

const handler = nextConnect();
handler.use(upload.single("image"));

handler.post(async (req, res) => {
  try {
    await main();
    const { id } = req.query;
    const { link, order, sliderType } = req.body;

    const updateData = { link, order, sliderType };

    if (req.file) {
      const s3 = new S3({
        region: process.env.AWS_BUCKET_REGION,
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      });

      const uploadResult = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `slider-${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }).promise();

      updateData.imageUrl = uploadResult.Location;
    }

    const updated = await Slider.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) return res.status(404).json({ error: "Slider not found" });

    res.status(200).json({ message: "Slider updated!", updated });
  } catch (err) {
    res.status(500).json({ error: "Update failed!" });
  }
});

export const config = { api: { bodyParser: false } };
export default handler;
