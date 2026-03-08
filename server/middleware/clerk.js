import { createClerkClient } from "@clerk/clerk-sdk-node";
import User from "../models/User.js";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const protectRoute = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the session token using Clerk
    const decoded = await clerkClient.verifyToken(token);
    const clerkId = decoded.sub;

    // Find the user in our database by clerkId
    let user = await User.findOne({ clerkId });

    if (!user) {
      // If user doesn't exist in our DB, we'll need to fetch their details from Clerk and sync
      const clerkUser = await clerkClient.users.getUser(clerkId);
      
      user = await User.create({
        clerkId: clerkId,
        fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "Anonymous",
        email: clerkUser.emailAddresses[0]?.emailAddress,
        profilePic: clerkUser.imageUrl,
        password: "", // Not used
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Clerk auth error:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
