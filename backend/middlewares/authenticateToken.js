require("dotenv/config");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "No token provided. You must be logged in." });

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, payload) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Token is invalid or has expired." });

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { tokenVersion: true },
    });

    if (!user || user.tokenVersion !== payload.tokenVersion)
      return res.status(401).json({ message: "Token revoked!" });

    req.user = payload;
    next();
  });
};
