import express from "express"
import { bookDocAppointment, cancelDocAppointmnet, listUserAppointments,editDoctor } from "../controllers/doctor.controller.js";
import { authUser,authAdmin } from "../middlewares/auth.middleware.js";

const doctorRouter = express.Router();

doctorRouter.post('/book-appointment',authAdmin,bookDocAppointment);
doctorRouter.get('/user-appointments',authUser,listUserAppointments);
doctorRouter.post('/cancel-appointment',authUser,cancelDocAppointmnet);
doctorRouter.post('/edit-doctor',authAdmin,editDoctor)

export default doctorRouter;