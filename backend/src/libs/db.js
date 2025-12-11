import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
        console.log("Connect to the database succesfully.");
    } catch (error) {
        console.log("Faile to connect to the database.", error);
        process.exit(1);
    }
}