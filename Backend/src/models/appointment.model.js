import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  docId: {
    type: String,
    required: true  
  },
  queueNumber: {
    type: Number,
    required: true
  },
  slotDate: {
    type: String,
    required: true
  },
  slotTime: {
    type: String,
    required: true
  },
  docData: {
    type: Object,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Number,
    required: true
  },

  // ✅ Replaced multiple booleans with clear statuses
  status: {
    type: String,
    enum: ["pending", "checked-in", "in-progress", "completed", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid"
  }

}, { timestamps: true });

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;
