const { Router } = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const chatRouter = Router();
const chatController = require("../controllers/chatController");

chatRouter.post("/direct", authenticateToken, chatController.getOrCreateRoomId);

module.exports = chatRouter;
