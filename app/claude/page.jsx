// app/page.js
'use client'

import { useState } from 'react'
import TaskMap from '../../components/TaskMap'

export default function Home() {
  // Sample task data - in a real app, you'd fetch from an API or database
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Read documentation', completed: false },
    { id: 2, title: 'Setup project', completed: false },
    { id: 3, title: 'Create components', completed: false },
    { id: 4, title: 'Implement features', completed: false },
    { id: 5, title: 'Test application', completed: false },
  ])

  const handleTaskComplete = (taskId) => {
    console.log(`Task ${taskId} completed!`)
    // Update task status in your state or database
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: true }
          : task
      )
    )
  }

  // Filter out completed tasks for display
  const activeTasks = tasks.filter(task => !task.completed)

  return (
    <main className="min-h-screen bg-black">
      <TaskMap tasks={activeTasks} onTaskComplete={handleTaskComplete} />
    </main>
  )
}