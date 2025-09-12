import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    docId:{
        type:String,
        required:true  
    },
    queueNumber: 
    { type: Number, required: true },
    slotDate:{
        type:String,
        required:true
    },
    slotTime:{
        type:String,
        required:true
    },
    // userData:{
    //     type:Object,
    //     required:true
    // },
    docData:{
        type:Object,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    date:{
        type:Number,
        required:true
    },
    cancelled:{
        type:Boolean,
        default:false
    },
    payment:{
        type:Boolean,
        default:false
    },
    isCompleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment',appointmentSchema);

export default appointmentModel;