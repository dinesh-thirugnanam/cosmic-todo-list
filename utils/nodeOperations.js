// utils/nodeOperations.js

export async function fetchNodes() {
  const response = await fetch('/api/nodes');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch nodes');
  }
  
  return data.data;
}

export async function fetchNode(id) {
  const response = await fetch(`/api/nodes/${id}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch node');
  }
  
  return data.data;
}

export async function createNode(nodeData) {
  const response = await fetch('/api/nodes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nodeData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create node');
  }
  
  return data.data;
}

export async function updateNode(id, nodeData) {
  const response = await fetch(`/api/nodes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nodeData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to update node');
  }
  
  return data.data;
}

export async function deleteNode(id) {
  const response = await fetch(`/api/nodes/${id}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete node');
  }
  
  return true;
}

export async function isDefaultNode(id) {
  const node = await fetchNode(id);
  return node?.isDefault || false;
}