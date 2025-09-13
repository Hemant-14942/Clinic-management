import appointmentModel from "../models/appointment.model.js";
import doctorModel from "../models/doctor.model.js";
import userModel from "../models/user.model.js";

const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availibilty Changed" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

const bookDocAppointment = async (req, res) => {
  console.log("inside bookDocAppointment");
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

    // Clean doctor data before saving
    const { slots_booked: sb, password, ...doctorDetails } = docData._doc;

    // ✅ Find queue number
    const existingAppointments = await appointmentModel.find({
      docId,
      slotDate,
      cancelled: { $ne: true },
    });
    const queueNumber = existingAppointments.length + 1;

    const appointmentData = {
      patientName,
      description,
      docId,   // ✅ include docId
      slotDate,
      slotTime,
      docData: doctorDetails,  // ✅ cleaned doctor details
      amount: docData.fees,
      date: Date.now(),
      queueNumber,
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
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


const listUserAppointments = async(req,res) =>{
  try {
    const {userId} = req.body;
    const userAppointmentData = await appointmentModel.find({userId});

    return res.json({
      success:true,
      message:"User Appointments",
      userAppointmentData
    })
  
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }

}

const cancelDocAppointmnet = async(req,res)=>{
  try {
    const {userId,appointmentId} = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
  
    if(appointmentData.userId !== userId){
      return res.json({success:false,message:"User isn't Authorized"})
    }
  
    await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true});
  
    const{docId,slotDate,slotTime} = appointmentData;
  
    const docData = await doctorModel.findById(docId);
  
    const slots_booked = docData.slots_booked;
  
    slots_booked[slotDate] = slots_booked[slotDate].filter(e =>e !== slotTime)
  
    await doctorModel.findByIdAndUpdate(docId,{slots_booked})
  
    return res.json({success:true,message:"Appointment Cancelled"})
  
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
}

const editDoctor = async (req, res) => {
  try {
    const { docId, name, speciality, available, fees, experience } = req.body;

    if (!docId) {
      return res.status(400).json({ success: false, message: "Doctor ID is required" });
    }

    // Build an update object dynamically
    const updateData = {};
    if (name) updateData.name = name;
    if (speciality) updateData.speciality = speciality;
    if (available !== undefined) updateData.available = available;
    if (fees !== undefined) updateData.fees = fees;
    if (experience) updateData.experience = experience;

    const updatedDoctor = await doctorModel.findByIdAndUpdate(docId, updateData, { new: true }).select("-password");

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.json({
      success: true,
      message: "Doctor information updated successfully",
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export { changeAvailablity,bookDocAppointment,listUserAppointments,cancelDocAppointmnet,editDoctor };
