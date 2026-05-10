const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/",(req,res)=>{

  res.send("🔥 Achille Spotify Backend Running");
});


app.use("/api/auth",authRoutes);


mongoose.connect(process.env.MONGO_URI)
.then(()=>{

  console.log("MongoDB Atlas Connected ✅");

})
.catch(err=>{

  console.log(err);
});


const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{

  console.log(`Server running on port ${PORT} 🚀`);
});