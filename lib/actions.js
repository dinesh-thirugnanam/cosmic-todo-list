"use server";

import connectToDatabase from "./mongodb";
import Node from "../models/Node";
import Task from "../models/Task";
import mongoose from "mongoose";
import { auth } from "@/auth";

// Helper to validate string input
const validateString = (value, name, maxLength) => {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }
  if (value.trim().length > maxLength) {
    throw new Error(`${name} cannot exceed ${maxLength} characters`);
  }
  return value.trim();
};

// Helper to serialize MongoDB documents
const serializeDocument = (doc) => {
  if (!doc) return null;
  const serialized = { ...doc };
  if (doc._id) serialized._id = doc._id.toString();
  if (doc.nodeId) serialized.nodeId = doc.nodeId.toString();
  if (doc.tasks && Array.isArray(doc.tasks)) {
    serialized.tasks = doc.tasks.map(id => id.toString());
  }
  return serialized;
};

export async function check() {
  const session = await auth();
  if (session?.user) {
    return session;
  }
}

// 1. Fetch all nodes of a user
export async function fetchUserNodes() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();
    const nodes = await Node.find({ email: session.user.email.toLowerCase() })
      .lean()
      .select("listName tasks isDefault");

    // Serialize nodes
    const serializedNodes = nodes.map(node => ({
      ...node,
      _id: node._id.toString(),
      tasks: node.tasks.map(id => id.toString()),
    }));

    return { success: true, data: serializedNodes };
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return { success: false, error: error.message || "Failed to fetch nodes" };
  }
}

// 2. Create a new node
export async function createNode({ listName, isDefault = false }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedListName = validateString(listName, "List name", 60);

    await connectToDatabase();

    // If isDefault is true, ensure no other node is default
    if (isDefault) {
      await Node.updateMany(
        { email: session.user.email.toLowerCase(), isDefault: true },
        { isDefault: false }
      );
    }

    const node = await Node.create({
      listName: validatedListName,
      email: session.user.email.toLowerCase(),
      isDefault,
      tasks: [],
    });

    // Serialize the created node
    const serializedNode = serializeDocument(node.toObject());

    return { success: true, data: serializedNode };
  } catch (error) {
    console.error("Error creating node:", error);
    return { success: false, error: error.message || "Failed to create node" };
  }
}

// 3. Delete a node (except default node)
export async function deleteNode(nodeId) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(nodeId)) {
      return { success: false, error: "Invalid node ID" };
    }

    await connectToDatabase();

    const sessionMongo = await mongoose.startSession();
    sessionMongo.startTransaction();

    try {
      const node = await Node.findOne({
        _id: nodeId,
        email: session.user.email.toLowerCase(),
      })
        .session(sessionMongo)
        .lean();

      if (!node) {
        await sessionMongo.abortTransaction();
        return { success: false, error: "Node not found or not owned by user" };
      }

      if (node.isDefault) {
        await sessionMongo.abortTransaction();
        return { success: false, error: "Cannot delete default node" };
      }

      // Delete associated tasks
      await Task.deleteMany({
        nodeId,
        email: session.user.email.toLowerCase(),
      }).session(sessionMongo);

      // Delete the node
      await Node.deleteOne({ _id: nodeId }).session(sessionMongo);

      await sessionMongo.commitTransaction();
      return { success: true, data: { nodeId: nodeId.toString() } };
    } catch (error) {
      await sessionMongo.abortTransaction();
      throw error;
    } finally {
      sessionMongo.endSession();
    }
  } catch (error) {
    console.error("Error deleting node:", error);
    return { success: false, error: error.message || "Failed to delete node" };
  }
}

// 4. Update a node (only name)
export async function updateNode(nodeId, { listName }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(nodeId)) {
      return { success: false, error: "Invalid node ID" };
    }

    const validatedListName = validateString(listName, "List name", 60);

    await connectToDatabase();

    const node = await Node.findOneAndUpdate(
      { _id: nodeId, email: session.user.email.toLowerCase() },
      { listName: validatedListName },
      { new: true, runValidators: true }
    )
      .lean()
      .select("listName isDefault createdAt");

    if (!node) {
      return { success: false, error: "Node not found or not owned by user" };
    }

    // Serialize the updated node
    const serializedNode = serializeDocument(node);

    return { success: true, data: serializedNode };
  } catch (error) {
    console.error("Error updating node:", error);
    return { success: false, error: error.message || "Failed to update node" };
  }
}

// 5. Fetch all tasks linked to a node
export async function fetchNodeTasks(nodeId, { completed, sortBy = "createdAt", order = "desc" } = {}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(nodeId)) {
      return { success: false, error: "Invalid node ID" };
    }

    await connectToDatabase();

    // Verify node exists and belongs to user
    const node = await Node.findOne({ _id: nodeId, email: session.user.email.toLowerCase() }).lean();
    if (!node) {
      return { success: false, error: "Node not found or not owned by user" };
    }

    const query = { nodeId, email: session.user.email.toLowerCase() };
    if (completed !== undefined) {
      query.completed = completed === "true" || completed === true;
    }

    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    const tasks = await Task.find(query)
      .lean()
      .sort(sort)
      .select("taskName completed createdAt nodeId");

    // Serialize tasks
    const serializedTasks = tasks.map(task => serializeDocument(task));

    return { success: true, data: serializedTasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: error.message || "Failed to fetch tasks" };
  }
}

// 6. Add a task
export async function createTask({ nodeId, taskName }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(nodeId)) {
      return { success: false, error: "Invalid node ID" };
    }

    const validatedTaskName = validateString(taskName, "Task name", 100);

    await connectToDatabase();

    // Verify node exists and belongs to user
    const node = await Node.findOne({ _id: nodeId, email: session.user.email.toLowerCase() });
    if (!node) {
      return { success: false, error: "Node not found or not owned by user" };
    }

    const task = await Task.create({
      email: session.user.email.toLowerCase(),
      nodeId,
      taskName: validatedTaskName,
      completed: false,
    });

    // Add task to node's tasks array
    node.tasks.push(task._id);
    await node.save();

    // Serialize the created task
    const serializedTask = serializeDocument(task.toObject());

    return { success: true, data: serializedTask };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: error.message || "Failed to create task" };
  }
}

// 7. Delete a task
export async function deleteTask(taskId) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return { success: false, error: "Invalid task ID" };
    }

    await connectToDatabase();

    const sessionMongo = await mongoose.startSession();
    sessionMongo.startTransaction();

    try {
      const task = await Task.findOne({
        _id: taskId,
        email: session.user.email.toLowerCase(),
      })
        .session(sessionMongo)
        .lean();

      if (!task) {
        await sessionMongo.abortTransaction();
        return { success: false, error: "Task not found or not owned by user" };
      }

      // Remove task from node's tasks array
      await Node.updateOne(
        { _id: task.nodeId, email: session.user.email.toLowerCase() },
        { $pull: { tasks: taskId } }
      ).session(sessionMongo);

      // Delete the task
      await Task.deleteOne({ _id: taskId }).session(sessionMongo);

      await sessionMongo.commitTransaction();
      return { success: true, data: { taskId: taskId.toString() } };
    } catch (error) {
      await sessionMongo.abortTransaction();
      throw error;
    } finally {
      sessionMongo.endSession();
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: error.message || "Failed to delete task" };
  }
}

// 8. Update a task (name and completed)
export async function updateTask(taskId, { taskName, completed }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return { success: false, error: "Invalid task ID" };
    }

    if (taskName !== undefined && typeof taskName !== "string") {
      return { success: false, error: "Task name must be a string" };
    }

    if (completed !== undefined && typeof completed !== "boolean") {
      return { success: false, error: "Completed must be a boolean" };
    }

    const updates = {};
    if (taskName !== undefined) {
      updates.taskName = validateString(taskName, "Task name", 100);
    }
    if (completed !== undefined) {
      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      return { success: false, error: "No valid fields to update" };
    }

    await connectToDatabase();

    const task = await Task.findOneAndUpdate(
      { _id: taskId, email: session.user.email.toLowerCase() },
      updates,
      { new: true, runValidators: true }
    )
      .lean()
      .select("taskName completed createdAt nodeId");

    if (!task) {
      return { success: false, error: "Task not found or not owned by user" };
    }

    // Serialize the updated task
    const serializedTask = serializeDocument(task);

    return { success: true, data: serializedTask };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: error.message || "Failed to update task" };
  }
}