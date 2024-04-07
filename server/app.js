require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const auth = require("./middleware/auth");
//create an instance of an Express.js application.
const app = express();

//middlewares
//middleware parses the request body, which is typically sent in JSON format, and extracts the JSON data from it.
app.use(express.json());

// The line app.use(morgan("tiny")); adds the Morgan middleware to your Express.js application with a predefined logging format called "tiny".
app.use(morgan("tiny"));
app.use(require("cors")());

//routes
app.use("/api", require("./routes/auth"));
app.use("/api",require("./routes/contact"));
// app.use("/protected", auth, (req, res) => {
//   return res.status(200).json({ ...req.user._doc });
// });
app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

//server configuration
const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  try {
    //WE DONT WANT OUR APP TO START BEFORE OUR MONGODB CONNECTION SO WE WE USED AWAIT HERE
    await connectDB();
    console.log(`server is listening on port: ${PORT}`);
  } catch (error) {
    console.log(err);
  }
});
