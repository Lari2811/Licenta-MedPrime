import locationModel from "../models/locationModel.js";


import userModel from "../models/userModel.js";

import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";


//API for admin login
const loginAdmin = async (req, res) => {
    try {

        const {email, password } = req.body
        
        if ( email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD )
        {
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({success:true, token})
        }
        else
        {
            res.json({success:false, message:"Invalid credentials"})
        }


    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
        
    }
}

const createUser = async (req, res) => {
  try {
    const { email, password, role, linkedID } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, parolă și rolul sunt obligatorii." });
    }

   if (!email || !password || !role || !linkedID) {
      return res.status(400).json({
        success: false,
        message: "Toate câmpurile sunt obligatorii.",
      });
    }

    // Verifică dacă emailul există deja
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Emailul este deja folosit.",
      });
    }

  
    // Criptare parolă
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      email,
      password: hashedPassword,
      role,
      linkedID,
      mustCompleteProfile: role === "doctor"
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "Utilizator creat cu succes.",
      data: {
        _id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        linkedID: savedUser.linkedID,
        mustCompleteProfile: savedUser.mustCompleteProfile
      }
    });

  } catch (error) {
    console.error("Eroare la creare utilizator:", error);
    res.status(500).json({ message: "Eroare server", error });
  }
};



export {

   
    loginAdmin, 
    createUser
}