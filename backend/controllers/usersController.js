const prisma = require("../config/prisma");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true },
    });

    res.json({ message: "Success", users });
  } catch (err) {
    console.log(err);
  }
};

exports.getChatRoomMessages = async (req, res) => {
  const roomId = parseInt(req.params.roomId, 10);

  const messages = await prisma.message.findMany({
    where: {
      conversationId: roomId,
    },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  res.json({ message: "Success", messages });
};

exports.createMessage = async (req, res) => {
  const { message, roomId, senderId } = req.body;

  try {
    const room = await prisma.conversation.findFirst({ where: { id: roomId } });

    if (!room)
      return res.json({
        message: `Chat room with an id ${roomId} do not exists`,
      });

    await prisma.message.create({
      data: { content: message, senderId, conversationId: roomId },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updateUserEmail = async (req, res) => {
  const id = Number(req.params.userId);
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { email },
    });

    return res.json(updatedUser);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User does not exist" });
    }

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};
