const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRouter = require("./routes/authRouter");

app.use("/auth", authRouter);

app.listen(3000, (err) => {
  if (err) throw err;
  console.log("App is listening in port 3000");
});
