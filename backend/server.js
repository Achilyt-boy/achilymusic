const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


const authRoutes = require("./routes/auth");
const musicRoutes = require("./routes/music");
const favoriteRoutes = require("./routes/favorites");


app.get("/", (req, res) => {
  res.send("🚀 AchilyMusic API is running");
});


app.use("/api/auth", authRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/favorites", favoriteRoutes);


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Atlas Connected ✅"))
.catch(err => console.log(err));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});