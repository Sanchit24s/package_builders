const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contactNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    homeAddress: { type: String, required: true },
    nationality: { type: String, required: true },
    panCardUrl: { type: String, required: true },
    panCardNumber: { type: String, required: true, unique: true },
    aadharCardUrl: { type: String, required: true },
    aadharCardNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", ClientSchema);
