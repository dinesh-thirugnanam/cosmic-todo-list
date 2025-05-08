"use client";

import { useState } from "react";
import { updateTask, deleteTask } from "../../lib/actions";

export default function TaskItem({ task, setTasks, selectedNodeId }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTextChange = async (e) => {
    const newText = e.target.textContent;
    if (newText && newText !== task.taskName) {
      const result = await updateTask(task._id, { taskName: newText });
      if (result.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === task._id ? { ...t, taskName: newText } : t
          )
        );
      } else {
        console.error(result.error);
      }
    }
  };

  const handleCompletion = async () => {
    setIsAnimating(true);
    setTimeout(async () => {
      const result = await updateTask(task._id, { completed: !task.completed });
      if (result.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === task._id ? { ...t, completed: !t.completed } : t
          )
        );
      } else {
        console.error(result.error);
      }
      setIsAnimating(false);
    }, 600);
  };

  const handleDelete = async () => {
    setIsAnimating(true);
    setTimeout(async () => {
      const result = await deleteTask(task._id);
      if (result.success) {
        setTasks((prev) => prev.filter((t) => t._id !== task._id));
      } else {
        console.error(result.error);
      }
      setIsAnimating(false);
    }, 600);
  };

  return (
    <div
      className={`flex justify-between items-center my-3 p-3 border border-cyan-400 rounded-lg bg-white/5 transition-opacity duration-300 ${
        isAnimating ? "animate-crumble" : ""
      }`}
    >
      <div className={`flex items-center gap-3 ${task.completed ? "line-through text-gray-500" : ""}`}>
        <span>⭐</span>
        <span
          contentEditable
          onBlur={handleTextChange}
          className="outline-none"
          suppressContentEditableWarning
        >
          {task.taskName}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleCompletion}
          className="h-5 w-5 text-cyan-400 border-gray-300 rounded focus:ring-cyan-300"
        />
        <button onClick={handleDelete} className="text-red-500 hover:text-red-400">
          ✖
        </button>
      </div>
      <style jsx>{`
        @keyframes crumble {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          40% { transform: scale(0.8) rotate(10deg); opacity: 0.7; }
          70% { transform: scale(0.4) rotate(-15deg); opacity: 0.3; }
          100% { transform: scale(0) rotate(45deg); opacity: 0; }
        }
        .animate-crumble {
          animation: crumble 0.6s forwards;
        }
      `}</style>
    </div>
  );
}