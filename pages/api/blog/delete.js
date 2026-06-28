import dbConnect from "../../../database/conn";
import Blog from "../../../model/blogSchema";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.body;

  await Blog.findByIdAndDelete(id);

  res.status(200).json({ message: "Deleted" });
}