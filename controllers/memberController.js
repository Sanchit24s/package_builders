const Member = require("../models/Member");

// Add a member to a client
exports.addMember = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      contactNumber,
      email,
      homeAddress,
      nationality,
      panCardNumber,
      aadharCardNumber,
    } = req.body;
    const panCardUrl = req.files["panCard"][0]?.path;
    const aadharCardUrl = req.files["aadharCard"][0]?.path;

    const member = await Member.findOne({
      $or: [
        { contactNumber },
        { email },
        { aadharCardNumber },
        { panCardNumber },
      ],
    });
    if (member) {
      res.status(400).json({ message: "Member already registered" });
    }

    if (
      !firstName ||
      !lastName ||
      !contactNumber ||
      !email ||
      !homeAddress ||
      !nationality ||
      !panCardUrl ||
      !panCardNumber ||
      !aadharCardUrl ||
      !aadharCardNumber
    ) {
      res.status(400).json({ message: "All fields are required" });
    }

    const newMember = new Member({
      firstName,
      lastName,
      contactNumber,
      email,
      homeAddress,
      nationality,
      panCardUrl,
      panCardNumber,
      aadharCardUrl,
      aadharCardNumber,
    });

    await newMember.save();
    res
      .status(201)
      .json({ message: "Member added successfully", member: newMember });
  } catch (error) {
    res.status(500).json({ message: "Error adding member", error });
  }
};

// Update a member
exports.updateMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const {
      firstName,
      lastName,
      contactNumber,
      email,
      homeAddress,
      nationality,
      panCardNumber,
      aadharCardNumber,
    } = req.body;
    const panCardUrl = req.files["panCard"]
      ? req.files["panCard"][0]?.path
      : undefined;
    const aadharCardUrl = req.files["aadharCard"]
      ? req.files["aadharCard"][0]?.path
      : undefined;

    let updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (email) updateData.email = email;
    if (homeAddress) updateData.homeAddress = homeAddress;
    if (nationality) updateData.nationality = nationality;
    if (panCardUrl) updateData.panCardUrl = panCardUrl;
    if (panCardNumber) updateData.panCardNumber = panCardNumber;
    if (aadharCardUrl) updateData.aadharCardUrl = aadharCardUrl;
    if (aadharCardNumber) updateData.aadharCardNumber = aadharCardNumber;

    const updatedMember = await Member.findByIdAndUpdate(memberId, updateData, {
      new: true,
    });

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res
      .status(200)
      .json({ message: "Member updated successfully", member: updatedMember });
  } catch (error) {
    res.status(500).json({ message: "Error updating member", error });
  }
};
