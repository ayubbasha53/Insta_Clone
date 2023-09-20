const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 5000;
const { MONGOURI } = require("../server/keys");

mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongodb");
});

mongoose.connection.on("error", (err) => {
  console.error("Database connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Database connection disconnected");
});

require("./models/User");
require("./models/post");
app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));

app.listen(PORT, () => {
  console.log("server is running on ", PORT);
});
