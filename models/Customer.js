const mongoose = require("mongoose");

const { Schema } = mongoose;

const customerSchema = new Schema(
  {
    custId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);