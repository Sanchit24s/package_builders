const express = require("express");
const connectDB = require("./config/connectDB.js");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // FIX: Ensure dotenv is executed

// #Importing Routes
const adminRoutes = require("./routes/adminRoutes.js");
const clientRoutes = require("./routes/clientRoutes");
const memberRoutes = require("./routes/memberRoutes");

const app = express(); // Initialize app first

// Middleware
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));

// Serve static files
app.use(express.static(path.join(__dirname, "routes")));

// Connect to DB
connectDB(); // This will now receive the correct MONGO_URL

app.get("/", (req, res) => {
  res.json({ message: "Hello" });
});

// #Using Routes
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/members", memberRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
