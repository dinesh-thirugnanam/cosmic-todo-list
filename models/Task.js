import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please provide an email"],
        index: true,
        trim: true,
        lowercase: true,
    },
    nodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Node",
        required: [true, "Please provide a list ID"],
        index: true,
    },
    taskName: {
        type: String,
        required: [true, "Please provide a task name"],
        maxlength: [100, "Task name cannot be more than 100 characters"],
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);