// app/api/user/nodes/route.js
import dbConnect from "@/lib/mongodb";
import Node from "@/models/Node";
import { NextResponse } from "next/server";
import getServerSession from "next-auth"; // Correct import
import { authOptions } from "@/auth"; // Correct path to authOptions

// Helper function to get user ID from session
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

// Get all nodes for the logged-in user
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

    // Get all nodes for this user
    const nodes = await Node.find({ uid: userId }).populate("tasks").lean();

    // Format nodes for the frontend
    const formattedNodes = nodes.map((node) => ({
      id: node._id.toString(),
      props: {
        listName: node.listName,
        tasks: node.tasks.map((task) => ({
          id: task._id.toString(),
          taskName: task.taskName,
          completed: task.completed,
          createdAt: task.createdAt,
        })),
      },
      isDefault: node.isDefault,
    }));

    return NextResponse.json({ success: true, data: formattedNodes });
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Create a new node for the logged-in user
export async function POST(request) {
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
    if (!body.listName) {
      return NextResponse.json(
        {
          success: false,
          error: "List name is required",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create new node
    const node = await Node.create({
      listName: body.listName,
      uid: userId,
      tasks: [], // Start with empty tasks array
      isDefault: false, // Enforce that new nodes are not default
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: node._id.toString(),
          props: {
            listName: node.listName,
            tasks: [],
          },
          isDefault: node.isDefault,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating node:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
