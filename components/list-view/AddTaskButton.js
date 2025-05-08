"use client";

export default function AddTaskButton({ onAddTask }) {
  return (
    <div className="text-center mt-6">
      <button
        onClick={onAddTask}
        className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-full px-6 py-2 hover:from-cyan-400 hover:to-blue-500 transition-all"
      >
        + Add Task
      </button>
    </div>
  );
}