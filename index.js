const express = require("express");
const app = express();
const DB = require("./database").connectDB; // we are refering to it

// Routes
const authRouter = require("./routes/authRoutes");
// Connect to our DB
DB();

app.use(express.json());
app.use("/api/auth", authRouter);

// The signup path: http://localhost:3000/signup

app.listen(process.env.PORT, () => {
  console.log(`Listening on port: ${process.env.PORT}`);
});
