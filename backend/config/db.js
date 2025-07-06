import mongoose from "mongoose";


export const connectDB = async () => {
  await mongoose.connect('mongodb+srv://sakshambansalalka:resume123@cluster0.y4vumjc.mongodb.net/RESUME').then(() => {
    console.log("MongoDB connected successfully");
  }).catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
}