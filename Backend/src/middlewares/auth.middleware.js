import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

const authAdmin = (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: "Invalid token, authorization denied" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: "Token verification failed" });
  }
};


const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    
    if (!token) {
      return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await userModel.findById(decodedToken.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    req.body.userId = decodedToken.id;
    
    next();
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { authAdmin, authUser };