// models/Node.js
import mongoose from "mongoose";

const NodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for this node"],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  tasks: {
    type: [String],
    default: [],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Node || mongoose.model("Node", NodeSchema);
