const { Router } = require("express");
const authRouter = Router();
const authController = require("../controllers/authController");
const { handleValidation } = require("../middlewares/handleValidation");
const { validateSignup } = require("../validators/signup");

authRouter.post("/login", authController.login);
authRouter.post(
  "/signup",
  validateSignup,
  handleValidation,
  authController.signup
);
authRouter.post("/logout", authController.logout);
authRouter.post("/token/refresh", authController.refreshToken);

module.exports = authRouter;
