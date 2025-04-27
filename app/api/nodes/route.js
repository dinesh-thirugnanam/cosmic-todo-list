// app/api/nodes/route.js - GET all nodes and POST new node
import dbConnect from '@/lib/mongodb';
import Node from '@/models/Node';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const nodes = await Node.find({});
    
    // Format nodes for the frontend
    const formattedNodes = nodes.map(node => ({
      id: node._id.toString(),
      props: {
        name: node.name,
        tasks: node.tasks
      },
      isDefault: node.isDefault
    }));

    return NextResponse.json({ success: true, data: formattedNodes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await dbConnect();
    
    const node = await Node.create({
      name: body.name,
      tasks: body.tasks || [],
      isDefault: false // Enforce that new nodes are not default
    });
    
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
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}