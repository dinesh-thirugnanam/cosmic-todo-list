import dbConnect from '@/lib/mongodb';
import Node from '@/models/Node';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const node = await Node.findById(params.id);
    
    if (!node) {
      return NextResponse.json({ success: false, error: 'Node not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        id: node._id.toString(),
        props: {
          name: node.name,
          tasks: node.tasks
        },
        isDefault: node.isDefault
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}


export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    await dbConnect();
    
    // First check if it's a default node
    const existingNode = await Node.findById(params.id);
    
    if (!existingNode) {
      return NextResponse.json({ success: false, error: 'Node not found' }, { status: 404 });
    }
    
    const updateData = {
      tasks: body.tasks
    };
    
    // Only allow name updates for non-default nodes
    if (!existingNode.isDefault && body.name) {
      updateData.name = body.name;
    }
    
    const updatedNode = await Node.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      data: {
        id: updatedNode._id.toString(),
        props: {
          name: updatedNode.name,
          tasks: updatedNode.tasks
        },
        isDefault: updatedNode.isDefault
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}


export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const deletedNode = await Node.findByIdAndDelete(params.id);
    
    if (!deletedNode) {
      return NextResponse.json({ success: false, error: 'Node not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
