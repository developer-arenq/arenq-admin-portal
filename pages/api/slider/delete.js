import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import main from "../../../database/conn";
import Slider from "../../../model/sliderSchema";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined, // falls back to default AWS credential chain
});

export default async function handler(req, res) {
  if (req.method !== "DELETE")
    return res.status(405).json({ error: "Method not allowed" });

  await main();

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const slider = await Slider.findById(id);
    if (!slider) return res.status(404).json({ error: "Slider not found" });

    // Extract file name from image URL
    const imageUrl = slider.imageUrl;
    const fileName = imageUrl.split("/").pop();

    // Delete file from S3
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    });

    await s3.send(command);

    // Delete record from MongoDB
    await Slider.findByIdAndDelete(id);

    res.status(200).json({ message: "Deleted from DB and S3 successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      error: "Failed to delete slider",
      details: error.message,
    });
  }
}
