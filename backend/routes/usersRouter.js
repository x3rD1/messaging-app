const { Router } = require("express");
const usersRouter = Router();
const usersController = require("../controllers/usersController");
const { authenticateToken } = require("../middlewares/authenticateToken");

usersRouter.get("/all", authenticateToken, usersController.getAllUsers);
usersRouter.get(
  "/:user/chat/:roomId/messages",
  authenticateToken,
  usersController.getChatRoomMessages
);
usersRouter.post(
  "/:user/chat/:roomId/message/create",
  authenticateToken,
  usersController.createMessage
);
usersRouter.post(
  "/:userId/update",
  authenticateToken,
  usersController.updateUserEmail
);
module.exports = usersRouter;
