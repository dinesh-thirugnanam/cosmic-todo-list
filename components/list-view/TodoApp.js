"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import TaskList from "./TaskList";
import AddTaskButton from "./AddTaskButton";
import { fetchUserNodes, fetchNodeTasks, createTask, deleteNode } from "../../lib/actions";

export default function TodoApp({ nodeClicked, setNodeClicked }) {
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(nodeClicked || null);
  const [tasks, setTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortCriteria, setSortCriteria] = useState("createdAt");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function loadNodes() {
      try {
        setLoading(true);
        const result = await fetchUserNodes();
        if (result.success) {
          setNodes(result.data);
          // Validate nodeClicked
          const validNode = result.data.find((node) => node._id === nodeClicked);
          if (nodeClicked && validNode) {
            setSelectedNodeId(nodeClicked);
          } else {
            const defaultNode = result.data.find((node) => node.isDefault) || result.data[0];
            setSelectedNodeId(defaultNode?._id || null);
          }
        } else {
          setError(result.error);
          if (result.error === "Unauthorized") {
            router.push("/api/auth/signin");
          }
        }
      } catch (err) {
        setError("Failed to load lists");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNodes();
  }, [router, nodeClicked]);

  useEffect(() => {
    async function loadTasks() {
      if (selectedNodeId) {
        try {
          const result = await fetchNodeTasks(selectedNodeId, {
            sortBy: sortCriteria,
            order: "desc",
          });
          if (result.success) {
            setTasks(
              result.data.map((task) => ({
                ...task,
                _id: task._id.toString(),
              }))
            );
          } else {
            console.log(result.error);
          }
        } catch (err) {
          console.error("Failed to load tasks:", err);
        }
      }
    }
    loadTasks();
  }, [selectedNodeId, sortCriteria]);

  const handleAddTask = async () => {
    if (!selectedNodeId) return;
    try {
      const result = await createTask({
        nodeId: selectedNodeId,
        taskName: "New Task",
      });
      if (result.success) {
        setTasks((prev) => [...prev, { ...result.data, _id: result.data._id.toString() }]);
      } else {
        console.error(result.error);
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleSort = (criteria) => {
    setSortCriteria(criteria === "alpha" ? "taskName" : "createdAt");
  };

  const handleDeleteNode = async () => {
    if (!selectedNodeId) return;
    try {
      const result = await deleteNode(selectedNodeId);
      if (result.success) {
        setNodes((prev) => prev.filter((node) => node._id !== selectedNodeId));
        const nextNode = nodes.find((node) => node._id !== selectedNodeId) || nodes[0];
        setSelectedNodeId(nextNode ? nextNode._id : null);
        setTasks([]);
      } else {
        // console.error(result.error);
        alert(result.error);
      }
    } catch (err) {
      console.error("Failed to delete list:", err);
      alert("Failed to delete list");
    }
  };

  const selectedNode = nodes.find((node) => node._id === selectedNodeId);

  if (loading) {
    return <div className="text-white text-center pt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center pt-10">Error: {error}</div>;
  }

  if (!selectedNodeId) {
    return <div className="text-white text-center pt-10">No lists available</div>;
  }

  return (
    <div className="px-4 absolute z-100 bg-black/70 h-screen w-screen">
      <Header
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
        listName={selectedNode?.listName || "Untitled List"}
        onSort={handleSort}
        onDeleteNode={handleDeleteNode}
        setNodeClicked={setNodeClicked}
      />
      <TaskList
        tasks={tasks}
        setTasks={setTasks}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
        selectedNodeId={selectedNodeId}
      />
      <AddTaskButton onAddTask={handleAddTask} />
    </div>
  );
}