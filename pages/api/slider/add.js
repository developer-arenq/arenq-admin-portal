import main from "../../../database/conn";
import S3 from "aws-sdk/clients/s3";
import multer from "multer";
import nextConnect from "next-connect";
import Slider from "../../../model/sliderSchema";

const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect();
apiRoute.use(upload.single("image"));

apiRoute.post(async (req, res) => {
  await main();
  const { link, order, sliderType } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Please upload an image!" });
  }
  if (!sliderType) {
    return res.status(400).json({ error: "Slider Type needed!" });
  }

  const s3 = new S3({
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  });

  const keyName = `slider-${Date.now()}-${req.file.originalname}`;
  const uploadResult = await s3
    .upload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: keyName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    })
    .promise();

  const slider = new Slider({
    imageUrl: uploadResult.Location,
    link,
    order,
    sliderType,
  });

  await slider.save();
  res.status(200).json({ message: "Uploaded!", slider });
});

export default apiRoute;

export const config = { api: { bodyParser: false } };
