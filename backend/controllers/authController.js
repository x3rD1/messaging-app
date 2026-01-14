const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createAccessToken,
  createRefreshToken,
} = require("../utils/createToken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email exists in the database
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return res.status(401).json({ message: "Incorrect email or password" });

    // Check if the user's password is equals to password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Incorrect email or password" });

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(user);

    res.cookie("jid", refreshToken, {
      httpOnly: true,
      path: "/auth",
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json({
      message: "Successfully logged in!",
      accessToken,
      refreshToken,
      payload,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const exist = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (exist)
      return res
        .status(409)
        .json({ message: "Username or Email already exists" });

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPass },
    });

    res.json({ message: "Success!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.jid;

  if (!token) return res.json({ message: "No refresh token." });

  let payload = null;
  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN);
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Invalid refresh token." });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return res.status(404).json({ message: "User not found." });

  if (payload.tokenVersion !== user.tokenVersion) {
    return res.sendStatus(401);
  }

  const userPayload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    tokenVersion: user.tokenVersion,
  };

  const accessToken = createAccessToken(userPayload);
  const refreshToken = createRefreshToken(user);

  res.cookie("jid", refreshToken, {
    httpOnly: true,
    path: "/auth",
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.json({ message: "Token has been renewed", accessToken, userPayload });
};

exports.logout = async (req, res) => {
  const token = req.cookies.jid;

  if (!token) {
    return res.status(401).json({ message: "No refresh token cookie." });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN);
  } catch (err) {
    res.clearCookie("jid", { path: "/auth" });
    return res.status(401).json({ message: "Invalid refresh token." });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  console.log("LOGOUT cookies:", req.cookies);
  console.log("LOGOUT payload:", payload);
  console.log("LOGOUT user.tokenVersion:", user.tokenVersion);

  if (!user || payload.tokenVersion !== user.tokenVersion) {
    res.clearCookie("jid", { path: "/auth" });
    return res.sendStatus(204);
  }

  try {
    await prisma.user.update({
      where: { id: payload.sub },
      data: { tokenVersion: { increment: 1 } },
    });
  } catch (err) {
    console.error("Prisma error:", err);
    return res.status(500).json({ message: "Database update failed." });
  }

  res.clearCookie("jid", {
    httpOnly: true,
    path: "/auth",
    secure: true, // true in production
    sameSite: "none",
  });
  res.json({ message: "Logged out successfully!" });
};
