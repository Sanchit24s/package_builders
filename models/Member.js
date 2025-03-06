const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    homeAddress: { type: String, required: true },
    nationality: { type: String, required: true },
    panCardUrl: { type: String, required: true },
    panCardNumber: { type: String, required: true },
    aadharCardUrl: { type: String, required: true },
    aadharCardNumber: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", MemberSchema);
