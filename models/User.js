import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);