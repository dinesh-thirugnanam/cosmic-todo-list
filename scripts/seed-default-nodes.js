// scripts/seed-default-nodes.js
import dbConnect from '../lib/mongodb.js';
import Node from '../models/Node.js';

const DEFAULT_NODES = [
  {
    name: "My Day",
    tasks: [],
    isDefault: true
  },
  {
    name: "Favorites",
    tasks: [],
    isDefault: true
  },
  {
    name: "Planned",
    tasks: [],
    isDefault: true
  }
];

async function seedDefaultNodes() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');
    
    // For each default node, insert if it doesn't exist
    for (const nodeData of DEFAULT_NODES) {
      const existingNode = await Node.findOne({ name: nodeData.name, isDefault: true });
      
      if (!existingNode) {
        await Node.create(nodeData);
        console.log(`Created default node: ${nodeData.name}`);
      } else {
        console.log(`Default node already exists: ${nodeData.name}`);
      }
    }
    
    console.log('Default nodes seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding default nodes:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDefaultNodes();