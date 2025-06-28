import userModel from "../../models/userModel.js";
import patientModel from "../../models/patientModel.js";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import logAction from "../../utils/logAction.js";

import { generatePatientID } from "../../utils/generatePatientID.js";
import { formatName } from "../../utils/formatName.js";
import { io } from '../../server.js';


const registerPatient  = async (req, res) => {
  try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(401).json({ success:false, message: "Email și parolă sunt obligatorii!" });
      }

      const existingUser = await userModel.findOne({ email });

      if (existingUser) {
        return res.status(400).json({success:false, message: "Email-ul este asociat unui alt cont." });
      }

      const newPatientID = await generatePatientID();

      const newPatient = new patientModel({
        patientID: newPatientID,
        lastName,  
        firstName,
        email,
        status: "in asteptare",
        });
      await newPatient.save();

        await logAction({
        actionType: "CREATE_PATIENT",
        description: `S-a creat un nou pacient: ${newPatientID}`,
        userId: newPatientID,
        userRole: "patient",
        ipAddress: req.ip,
        });

      const hashedPassword = await bcrypt.hash(password, 10);

      // Cream user-ul cu linkedID
      const newUser = new userModel({
        linkedID: newPatientID,
        email,
        password: hashedPassword,
        role: "patient",
        isActive: false,
        mustCompleteProfile: true,
      });
      await newUser.save();
     

      // Creare token
      const token = jwt.sign(
          {
          email: email,
          role: "patient",
          linkedID: newPatientID,
          },
      process.env.JWT_SECRET,
      );

        await logAction({
        actionType: "CREATE_USER_PATIENT",
        description: `S-a creat un nou user:  ${newPatientID} de tip pacient`,
        userId: newPatientID,
        userRole: "patient",
        ipAddress: req.ip,
        });

        io.emit('patientAdded', {
          message: `Pacientul ${newPatientID} a fost creat!`,
          newPatientID,
        });
        
        res.status(200).json({
            success: true,
            message: "Cont pacient creat cu succes!",
            token,
            email: newUser.email,
            role: newUser.role,
            linkedID: newUser.linkedID,
        });

    } catch (error) {
      console.error("Eroare la înregistrare pacient:", error);
      console.error(error); 
      res.status(500).json({ success:false, message: "Eroare la înregistrare pacient!" });
    }
  };

  export {
    registerPatient 
  }