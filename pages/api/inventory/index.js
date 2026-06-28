// pages/api/inventory/index.js
const mongoose = require("mongoose");
const Inventory = require("../../../model/inventorySchema");
const Product = require("../../../model/productSchema");
require("dotenv").config({ path: ".env" });

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const inventories = await Inventory.find({}).populate("product_id", "name SKU");
      res.status(200).json(inventories);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch inventories" });
    }
  } 
  else if (req.method === "POST") {
    const { product_id, product_title, quantity, SKU, location } = req.body;

    if (!product_id || !product_title || !SKU) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const existing = await Inventory.findOne({ product_id });
      if (existing) {
        return res.status(400).json({ error: "Inventory for this product already exists" });
      }

      const newInventory = new Inventory({
        product_id,
        product_title,
        quantity: quantity || 0,
        SKU,
        location: location || "Main Warehouse",
      });

      await newInventory.save();
      res.status(201).json(newInventory);
    } catch (err) {
      res.status(500).json({ error: "Failed to create inventory" });
    }
  } 
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
