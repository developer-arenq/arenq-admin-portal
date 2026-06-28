import dbConnect from "../../../database/conn";
import Blog from "../../../model/blogSchema";

export default async function handler(req, res) {
  await dbConnect();

  const blogs = await Blog.find({ status: "published" })
    .populate("related_product")
    .sort({ createdAt: -1 });

  res.status(200).json(blogs);
}