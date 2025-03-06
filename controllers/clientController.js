const Client = require("../models/Client");

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clients", error });
  }
};

// Add new client
exports.addClient = async (req, res) => {
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
      member,
    } = req.body;

    const panCardUrl = req.files["panCard"][0]?.path;
    const aadharCardUrl = req.files["aadharCard"][0]?.path;

    const client = await Client.findOne({
      $or: [
        { contactNumber },
        { email },
        { aadharCardNumber },
        { panCardNumber },
      ],
    });
    if (client) {
      res.status(400).json({ message: "Client already registered" });
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
      !aadharCardNumber ||
      !member
    ) {
      res.status(400).json({ message: "All fields are required" });
    }

    let newClient = new Client({
      member,
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

    await newClient.save();

    newClient = await Client.findById(newClient._id).populate("member");
    res
      .status(201)
      .json({ message: "Client added successfully", client: newClient });
  } catch (error) {
    res.status(500).json({ message: "Error adding client", error });
  }
};

// Edit client
exports.updateClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const {
      firstName,
      lastName,
      contactNumber,
      email,
      homeAddress,
      nationality,
      panCardNumber,
      aadharCardNumber,
      member,
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
    if (member) updateData.member = member;

    const updatedClient = await Client.findByIdAndUpdate(clientId, updateData, {
      new: true,
    }).populate("member");

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res
      .status(200)
      .json({ message: "Client updated successfully", client: updatedClient });
  } catch (error) {
    res.status(500).json({ message: "Error updating client", error });
  }
};
