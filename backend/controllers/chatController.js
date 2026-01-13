const prisma = require("../config/prisma");

exports.getOrCreateRoomId = async (req, res) => {
  const { id, otherId } = req.body;

  let room = await prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      users: {
        every: { id: { in: [id, otherId] } },
      },
    },
  });

  if (!room) {
    room = await prisma.conversation.create({
      data: {
        type: "DIRECT",
        users: {
          connect: [{ id }, { id: otherId }],
        },
      },
    });
  }

  res.json({ message: "Success", room });
};
