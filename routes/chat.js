const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");
const { requireLogin } = require("../middleware/auth");

// ============ Middleware ============

// Protect all routes in this file
// If user is not logged in, they will be redirected to the Login page
router.use(requireLogin);

// ============ Routes ============

router.get("/", chatController.getChatPage);
router.post("/add", chatController.addMessage);
router.post("/delete/:id", chatController.deleteMessage);
router.get("/search", chatController.searchMessages);

module.exports = router;