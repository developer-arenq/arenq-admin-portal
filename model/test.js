const mongoose = require('mongoose');
const Product = require('./productSchema');  // Adjust the path as needed

async function updateMainImageForProducts() {
  await mongoose.connect('mongodb+srv://kunal96k:tWKnEL2E9HWS7B7s@cluster0.dvg6t.mongodb.net/testingdb?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const products = await Product.find({ });

    for (let product of products) {
      if (product.images && product.images.length > 0) {
        product.main_image = product.images[0];
      } else {
        product.main_image = null;
      }

      await product.save();
    }

    console.log(`Updated ${products.length} documents.`);
  } catch (error) {
    console.error('Error updating documents:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateMainImageForProducts();
