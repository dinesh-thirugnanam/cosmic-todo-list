// app/api/user/tasks/route.ts
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Node from "@/models/Node";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

// Helper function to get user ID from session
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

// Create a new task for the logged in user
export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.taskName || !body.nodeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Task name and node ID are required",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify that the node exists and belongs to this user
    const node = await Node.findOne({
      _id: body.nodeId,
      uid: userId,
    });

    if (!node) {
      return NextResponse.json(
        {
          success: false,
          error: "Node not found or unauthorized",
        },
        { status: 404 }
      );
    }

    // Create the task
    const task = await Task.create({
      taskName: body.taskName,
      nodeId: body.nodeId,
      uid: userId,
      completed: body.completed || false,
    });

    // Add task to the node's tasks array
    node.tasks.push(task._id);
    await node.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          id: task._id.toString(),
          taskName: task.taskName,
          completed: task.completed,
          nodeId: task.nodeId.toString(),
          createdAt: task.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get all tasks for the logged in user
export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get all tasks for this user
    const tasks = await Task.find({ uid: userId }).lean();

    // Format tasks for the frontend
    const formattedTasks = tasks.map((task) => ({
      id: task._id.toString(),
      taskName: task.taskName,
      completed: task.completed,
      nodeId: task.nodeId.toString(),
      createdAt: task.createdAt,
    }));

    return NextResponse.json({ success: true, data: formattedTasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
