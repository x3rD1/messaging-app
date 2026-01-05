const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

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

    res.json({ message: "Successfully logged in!" });
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
