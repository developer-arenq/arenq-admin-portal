import dbConnect from "../../../database/conn";
import Blog from "../../../model/blogSchema";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await dbConnect();

  const { slug } = req.query;

  let blog;

  // ✅ if Mongo ObjectId → search by ID
  if (mongoose.Types.ObjectId.isValid(slug)) {
    blog = await Blog.findById(slug);
  } 
  // ✅ else → search by slug
  else {
    blog = await Blog.findOne({ slug });
  }

  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  res.status(200).json(blog);
}