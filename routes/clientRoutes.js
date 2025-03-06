const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { upload } = require("../utils/cloudinary");

router.get("/", clientController.getClients);
router.post(
  "/add",
  upload.fields([
    { name: "panCard", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
  ]),
  clientController.addClient
);
router.put(
  "/update/:clientId",
  upload.fields([
    { name: "panCard", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
  ]),
  clientController.updateClient
);

module.exports = router;
