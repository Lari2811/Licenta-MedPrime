import doctorModel from "../../../models/doctorModel.js";
import userModel from "../../../models/userModel.js";

import jwt from "jsonwebtoken";
import logAction from "../../../utils/logAction.js";

import bcrypt from "bcryptjs";
import { io } from "../../../server.js";

const generateDoctorID = async () => {
  let lastDoctor = await doctorModel.findOne({}).sort({ createdAt: -1 }).lean();
  let nr = 0;
  if (lastDoctor && lastDoctor.doctorID) {
    nr = parseInt(lastDoctor.doctorID.replace('DR', ''), 10) || 0;
  }
  
  let newNr = nr + 1;
  let newDoctorID = 'DR' + newNr.toString().padStart(3, '0');

  let existsInDoctor = await doctorModel.findOne({ doctorID: newDoctorID });
  let existsInUser = await userModel.findOne({ linkedID: newDoctorID });

  while (existsInDoctor || existsInUser) {
    newNr++;
    newDoctorID = 'DR' + newNr.toString().padStart(3, '0');
    existsInDoctor = await doctorModel.findOne({ doctorID: newDoctorID });
    existsInUser = await userModel.findOne({ linkedID: newDoctorID });

    if (newNr > 9999) {
      throw new Error('Nu s-a putut genera un doctorID unic');
    }
  }

  return newDoctorID;
};


async function generateUniqueEmailAcrossCollections(firstName, lastName) {
  const clean = (str) => str.trim().toLowerCase().replace(/\s+/g, '');
  const baseEmail = `${clean(lastName)}.${clean(firstName)}.medic@medprime.com`;

  let email = baseEmail;
  let counter = 2;

  async function emailExists(email) {
    const existsInDoctor = await doctorModel.findOne({ email });
    if (existsInDoctor) return true;

    const existsInUser = await userModel.findOne({ email });
    if (existsInUser) return true;

    return false;
  }

  while (await emailExists(email)) {
    email = `${clean(lastName)}.${clean(firstName)}.${counter}.medic@medprime.com`;
    counter++;
    if (counter > 999) throw new Error('Prea multe variante de email generate');
  }

  return email;
}
  function capitalize(word) {
    if (!word) return "";
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  }

  function generatePassword(firstName, lastName) {
    const clean = (str) => str.trim().replace(/\s+/g, '');
    return `${capitalize(clean(lastName))}${capitalize(clean(firstName))}Medic`;
  }



export const addDoctor = async (req, res) => {

  try {
    const { firstName, lastName,  phone,  type, adminID } = req.body;

   
    if (!firstName || !lastName || !phone || !type) {
      console.log("Toate câmpurile sunt obligatorii la medic")
      return res.status(400).json({
        success: false,
        message: "Toate câmpurile sunt obligatorii la medic",
      });
    }

    const doctorID = await generateDoctorID();

    const plainPassword = generatePassword(firstName, lastName);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const email = await generateUniqueEmailAcrossCollections(firstName, lastName);
   
    const newUser = new userModel({
      linkedID: doctorID,
      email,
      password: hashedPassword,
      role: "doctor",
      isActive: false, 
      mustCompleteProfile: true,
    });
    await newUser.save();

    console.log("User creat cu succes:", doctorID)

    await logAction({
      actionType: "CREATE_USER_DOCTOR",
      description: `Adminul ${adminID} a creat un nou user: ${doctorID} de tip medic`,
      userId: adminID,
      userRole: "admin",
      ipAddress: req.ip,
    });

    const newDoctor = new doctorModel({
      doctorID,
      firstName,
      lastName,
      phone,
      type,
      email,
      status: "in asteptare"
    });

    await newDoctor.save();

     console.log("Doctor creat cu succes:", doctorID)

    await logAction({
      actionType: "CREATE_MEDIC",
      description: `Adminul ${adminID} a creat un nou medic: ${doctorID}`,
      userId: adminID,
      userRole: "admin",
      ipAddress: req.ip,
    });

    io.emit('DOCTOR_ADDED', {
      message: `Medicul ${doctorID} ${firstName} ${lastName} a fost adăugat!`,
      doctorID,
      doctor: newDoctor
    });

    res.status(201).json({
      success: true,
      message: "Medicul și userul au fost creați cu succes.",
      doctorID,
      email,
      lastName, 
      firstName,
      password: plainPassword, 
    });

  } catch (err) {
    console.error("Eroare la adăugarea medicului:", err);
    res.status(500).json({
      success: false,
      message: "Eroare server. Nu s-a putut adăuga medicul.",
    });
  }
};


