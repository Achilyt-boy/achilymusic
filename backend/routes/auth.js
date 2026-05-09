const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User.js");

const router = express.Router();


function auth(req,res,next){

  const token = req.headers.authorization;

  if(!token){

    return res.status(401).json({
      message:"Unauthorized"
    });
  }

  try{

    const decoded =
      jwt.verify(token,process.env.JWT_SECRET);

    req.userId = decoded.id;

    next();

  }catch(err){

    res.status(401).json({
      message:"Invalid token"
    });
  }
}


router.post("/register",async(req,res)=>{

  try{

    const {name,email,password} = req.body;

    const exists =
      await User.findOne({email});

    if(exists){

      return res.json({
        message:"User already exists"
      });
    }

    const hashed =
      await bcrypt.hash(password,10);

    const user = new User({
      name,
      email,
      password:hashed,
      favorites:[],
      recent:[]
    });

    await user.save();

    res.json({
      message:"Registered successfully 🔥"
    });

  }catch(err){

    res.status(500).json({
      message:"Server error"
    });
  }
});


router.post("/login",async(req,res)=>{

  try{

    const {email,password} = req.body;

    const user =
      await User.findOne({email});

    if(!user){

      return res.json({
        message:"User not found"
      });
    }

    const valid =
      await bcrypt.compare(password,user.password);

    if(!valid){

      return res.json({
        message:"Wrong password"
      });
    }

    const token =
      jwt.sign(
        {id:user._id},
        process.env.JWT_SECRET
      );

    res.json({
      token,
      user:{
        name:user.name,
        email:user.email
      }
    });

  }catch(err){

    res.status(500).json({
      message:"Server error"
    });
  }
});


router.put("/profile",auth,async(req,res)=>{

  try{

    const user =
      await User.findById(req.userId);

    user.name = req.body.name;

    if(req.body.password){

      user.password =
        await bcrypt.hash(req.body.password,10);
    }

    await user.save();

    res.json({
      message:"Profile updated ✅"
    });

  }catch(err){

    res.status(500).json({
      message:"Server error"
    });
  }
});


router.post("/favorite",auth,async(req,res)=>{

  try{

    const user =
      await User.findById(req.userId);

    const song = req.body.song;

    const exists =
      user.favorites.find(
        fav => fav.previewUrl === song.previewUrl
      );

    if(exists){

      return res.json({
        message:"Already in favorites ❤️"
      });
    }

    user.favorites.push(song);

    await user.save();

    res.json({
      message:"Added to favorites ❤️"
    });

  }catch(err){

    res.status(500).json({
      message:"Server error"
    });
  }
});


router.delete("/favorite",auth,async(req,res)=>{

  try{

    const user =
      await User.findById(req.userId);

    user.favorites =
      user.favorites.filter(
        song => song.previewUrl !== req.body.previewUrl
      );

    await user.save();

    res.json({
      message:"Removed from favorites 💔"
    });

  }catch(err){

    res.status(500).json({
      message:"Server error"
    });
  }
});


router.get("/favorites",auth,async(req,res)=>{

  try{

    const user =
      await User.findById(req.userId);

    res.json({
      favorites:user.favorites
    });

  }catch(err){

    res.status(500).json({
      message:"Server error"
    });
  }
});


router.post("/recent",auth,async(req,res)=>{

  try{

    const user =
      await User.findById(req.userId);

    const song = req.body.song;

    user.recent =
      user.recent.filter(
        s => s.previewUrl !== song.previewUrl
      );

    user.recent.unshift(song);

    user.recent = user.recent.slice(0,10);

    await user.save();

    res.json({
      message:"Recent updated"
    });

  }catch(err){

    res.status(500).json({
      message:"Server error"
    });
  }
});


router.get("/recent",auth,async(req,res)=>{

  try{

    const user =
      await User.findById(req.userId);

    res.json({
      recent:user.recent || []
    });

  }catch(err){

    res.status(500).json({
      message:"Server error"
    });
  }
});

module.exports = router;