// app/api/nodes/[id]/route.ts
import dbConnect from "@/lib/mongodb";
import Node from "@/models/Node";
import Task from "@/models/Task";
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Fetch the node with its tasks populated
    const node = await Node.findOne({
      _id: params.id,
      uid: userId, // Ensure user owns this node
    })
      .populate("tasks")
      .lean();

    if (!node) {
      return NextResponse.json(
        { success: false, error: "Node not found" },
        { status: 404 }
      );
    }

    // Format the response
    return NextResponse.json({
      success: true,
      data: {
        id: node._id.toString(),
        props: {
          listName: node.listName,
          tasks: node.tasks.map((task: any) => ({
            id: task._id.toString(),
            taskName: task.taskName,
            completed: task.completed,
            createdAt: task.createdAt,
          })),
        },
        isDefault: node.isDefault,
        uid: node.uid,
      },
    });
  } catch (error) {
    console.error("Error fetching node:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    await dbConnect();

    // First check if the node exists and belongs to the user
    const existingNode = await Node.findOne({
      _id: params.id,
      uid: userId,
    });

    if (!existingNode) {
      return NextResponse.json(
        { success: false, error: "Node not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Only update listName if it's provided and not a default node
    if (body.listName && !existingNode.isDefault) {
      updateData.listName = body.listName;
    }

    // Update the node
    const updatedNode = await Node.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("tasks");

    return NextResponse.json({
      success: true,
      data: {
        id: updatedNode._id.toString(),
        props: {
          listName: updatedNode.listName,
          tasks: updatedNode.tasks.map((task: any) => ({
            id: task._id.toString(),
            taskName: task.taskName,
            completed: task.completed,
            createdAt: task.createdAt,
          })),
        },
        isDefault: updatedNode.isDefault,
      },
    });
  } catch (error) {
    console.error("Error updating node:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // First check if it's a default node and belongs to the user
    const node = await Node.findOne({
      _id: params.id,
      uid: userId,
    });

    if (!node) {
      return NextResponse.json(
        { success: false, error: "Node not found" },
        { status: 404 }
      );
    }

    // Prevent deletion of default nodes
    if (node.isDefault) {
      return NextResponse.json(
        { success: false, error: "Default nodes cannot be deleted" },
        { status: 403 }
      );
    }

    // Delete all tasks associated with this node
    await Task.deleteMany({ nodeId: params.id });

    // Delete the node
    await Node.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error("Error deleting node:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
