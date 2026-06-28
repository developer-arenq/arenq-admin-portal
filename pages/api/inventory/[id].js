import main from "../../../database/conn";
import Inventory from "../../../model/inventorySchema";
import nextConnect from "next-connect";

const handler = nextConnect({
  onError(error, req, res) {
    res.status(500).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' not allowed` });
  },
});

// GET single inventory item
handler.get(async (req, res) => {
  await main().catch((err) => console.error(err));
  const { id } = req.query;

  try {
    const inventory = await Inventory.findById(id);
    if (!inventory) return res.status(404).json({ error: "Inventory not found" });
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH update inventory
handler.patch(async (req, res) => {
  await main().catch((err) => console.error(err));
  const { id } = req.query;
  const { product_title, SKU, quantity, location } = req.body;

  try {
    const updatedInventory = await Inventory.findByIdAndUpdate(
      id,
      { product_title, SKU, quantity, location, last_updated: new Date() },
      { new: true }
    );
    if (!updatedInventory) return res.status(404).json({ error: "Inventory not found" });
    res.status(200).json({ message: "Inventory updated successfully", data: updatedInventory });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE inventory
handler.delete(async (req, res) => {
  await main().catch((err) => console.error(err));
  const { id } = req.query;

  try {
    const deletedInventory = await Inventory.findByIdAndDelete(id);
    if (!deletedInventory) return res.status(404).json({ error: "Inventory not found" });
    res.status(200).json({ message: "Inventory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default handler;
