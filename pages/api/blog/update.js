import dbConnect from "../../../database/conn";
import Blog from "../../../model/blogSchema";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.body;

  const blog = await Blog.findByIdAndUpdate(id, req.body, {
    new: true
  });

  res.status(200).json(blog);
}