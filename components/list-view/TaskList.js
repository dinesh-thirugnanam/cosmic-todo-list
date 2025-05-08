"use client";

import TaskItem from "./TaskItem";

export default function TaskList({ tasks, setTasks, showCompleted, setShowCompleted, selectedNodeId }) {
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="overflow-y-auto h-fit max-h-[70vh] px-20">
      {activeTasks.length > 0 && (
        <div>
          <div className="text-lg font-semibold text-cyan-400 border-b border-dashed border-cyan-400 pb-2 mt-8">
            Active Tasks
          </div>
          {activeTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              setTasks={setTasks}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
      {completedTasks.length > 0 && (
        <div id="completed-section">
          <div className="flex justify-between items-center text-lg font-semibold text-cyan-400 border-b border-dashed border-cyan-400 pb-2 mt-8">
            Completed Tasks
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              {showCompleted ? "Hide" : "Show"}
            </button>
          </div>
          {showCompleted &&
            completedTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                setTasks={setTasks}
                selectedNodeId={selectedNodeId}
              />
            ))}
        </div>
      )}
    </div>
  );
}