const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const messageController = require("../controllers/messageController");
const { requireLoginAPI } = require("../middleware/auth");

// ===== Health Check ======
router.get("/ping", (req, res) =>
    res.json({ ok: true, msg: "Pong!" }));

// ===== Auth Routes =====
router.post("/register/step1", authController.registerStep1);
router.post("/register/step2", authController.registerStep2);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// ====== Message Routes =======
router.get("/messages", requireLoginAPI, messageController.getMessages);
router.put("/messages/:id", requireLoginAPI, messageController.editMessage);

module.exports = router;