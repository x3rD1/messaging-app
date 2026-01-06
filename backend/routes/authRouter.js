const { Router } = require("express");
const authRouter = Router();
const authController = require("../controllers/authController");

authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signup);
authRouter.post("/logout", authController.logout);
authRouter.post("/token/refresh", authController.refreshToken);

module.exports = authRouter;
