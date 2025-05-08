import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: [true, "Please provide a user ID"],
    index: true, // Optimize queries by user
  },
  nodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Node", // Reference to Node (list) model
    required: [true, "Please provide a list ID"], // Tasks must belong to a list
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
