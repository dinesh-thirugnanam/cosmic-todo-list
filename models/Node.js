import mongoose from "mongoose";

const NodeSchema = new mongoose.Schema({
  listName: {
    type: String,
    required: [true, "Please provide a name for this list"],
    maxlength: [60, "List name cannot be more than 60 characters"],
    trim: true,
  },
  uid: {
    type: String,
    required: [true, "Please provide a user ID"],
    index: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  isDefault: {
    type: Boolean,
    default: false, // Marks a default list (e.g., "Inbox")
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Node || mongoose.model("Node", NodeSchema);
