const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your product name!"],
  },
  description: {
    type: String,
    required: [true, "Please enter your product description!"],
  },
  category: {
    type: String,
    required: [true, "Please enter your product category!"],
  },

  // TAGS FIX
  tags: {
    type: [String],
    default: [],
  },

  originalPrice: Number,

  discountPrice: {
    type: Number,
    required: [true, "Please enter your product price!"],
  },

  stock: {
    type: Number,
    required: [true, "Please enter your product stock!"],
  },

  images: [{ type: String }],

  reviews: [
    {
      user: Object,
      rating: Number,
      comment: String,
      productId: String,
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],

  ratings: Number,

  shopId: {
    type: String,
    required: true,
  },

  shop: {
    type: Object,
    required: true,
  },

  sold_out: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// ⭐ THE MOST IMPORTANT LINE (YOU MISSED THIS)
module.exports = mongoose.model("Product", productSchema);
