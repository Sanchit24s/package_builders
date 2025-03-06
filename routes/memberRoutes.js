const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const { upload } = require("../utils/cloudinary");

router.post(
  "/add",
  upload.fields([
    { name: "panCard", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
  ]),
  memberController.addMember
);
router.put(
  "/update/:memberId",
  upload.fields([
    { name: "panCard", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
  ]),
  memberController.updateMember
);

module.exports = router;
