require("dotenv/config");
const jwt = require("jsonwebtoken");

exports.createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "15m" });
};

exports.createRefreshToken = (user) => {
  return jwt.sign(
    { sub: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN,
    {
      expiresIn: "7d",
    }
  );
};
