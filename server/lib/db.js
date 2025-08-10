import mongoose from "mongoose";
export const connectDB = async () => {
    try{
        mongoose.connection.on("connected", () => {
            console.log("MongoDB connection successful");
        });
        await mongoose.connect(`${process.env.MONGODB_URI}/chatApp`)
    }
    catch(error){
        console.error("MongoDB connection failed:", error);
        process.exit(1); // Exit the process with failure
    }
}
