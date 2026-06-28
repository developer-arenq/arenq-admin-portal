const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  product_title: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  SKU: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: "Main Warehouse"
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);


