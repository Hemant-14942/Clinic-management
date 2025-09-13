import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctor.model.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointment.model.js";

// -------------------------
// Admin Login
// -------------------------
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.status(200).json({ success: true, token });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Email or Password" });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
    });
  }
};

// -------------------------
// Add Doctor
// -------------------------
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;

    const imageFile = req.file;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a Valid Email" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a Strong Password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      available: true,
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor Added Successfully",
      doctor: {
        _id: newDoctor._id,
        name: newDoctor.name,
        speciality: newDoctor.speciality,
        image: newDoctor.image,
      },
    });
  } catch (error) {
    console.error("Add doctor error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// -------------------------
// List Doctors
// -------------------------
const listDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error("List doctors error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// -------------------------
// List Appointments
// -------------------------
const listAppointments = async (req, res) => {
  try {
    const appointmentData = await appointmentModel
      .find({})
      .sort({ slotDate: 1, queueNumber: 1 }); // ✅ ordered like hospital queue

    return res.json({
      success: true,
      appointmentData,
    });
  } catch (error) {
    console.error("List appointments error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// -------------------------
// Book Appointment
// -------------------------
const bookDocAppointment = async (req, res) => {
  try {
    const { patientName, description, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor is not Available" });
    }

    let slots_booked = docData.slots_booked || {};

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot is not Available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    // Clean doctor data
    const { slots_booked: sb, password, ...doctorDetails } = docData._doc;

    // ✅ Find queue number (excluding cancelled)
    const existingAppointments = await appointmentModel.find({
      docId,
      slotDate,
      status: { $ne: "cancelled" },
    });

    const queueNumber = existingAppointments.length + 1;

    const appointmentData = {
      patientName,
      description,
      docId,
      slotDate,
      slotTime,
      docData: doctorDetails,
      amount: docData.fees,
      date: Date.now(),
      queueNumber,
      status: "pending", // ✅ default
      paymentStatus: "unpaid", // ✅ default
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    return res.json({
      success: true,
      message: "Appointment Booked Successfully",
      queueNumber,
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  listDoctors,
  listAppointments,
  bookDocAppointment,
};
