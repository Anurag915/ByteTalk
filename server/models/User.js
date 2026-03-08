import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    profilePic:{
        type: String,
        default: ""
    },
    bio:{
        type: String,
    }
},{timestamps: true});
const User = mongoose.model("User", userSchema);
export default User;