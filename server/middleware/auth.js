import jwt from "jsonwebtoken";
import User from "../models/User.js";

//middleware to protect routes
export const protectRoute = async (req, res, next) => {
  // try {
  //   const token = req.headers.token;
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //   const user = await User.findById(decoded.userId).select("-password");
  //   if (!user) {
  //     return res.status(401).json({ message: "Unauthorized, user not found" });
  //   }
  //   req.user = user;
  //   next();
  // } catch (error) {
  //   console.error("Error in auth middleware:", error);
  //   res.status(401).json({ message: "Unauthorized, invalid token" });
  // }

  const token = req.headers.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
