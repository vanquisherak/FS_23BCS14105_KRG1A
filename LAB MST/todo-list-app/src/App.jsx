import React, { useState } from 'react'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [text, setText] = useState('')

  function addTask(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    const newTask = { id: Date.now(), text: trimmed, done: false }
    setTasks(prev => [newTask, ...prev])
    setText('')
  }

  function toggleDone(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full">
      <h1 className="text-2xl font-semibold mb-4">Todo List</h1>

      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="Add a new task"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Add</button>
      </form>

      <ul className="space-y-2">
        {tasks.length === 0 && <li className="text-gray-500">No tasks yet. Add one!</li>}
        {tasks.map(task => (
          <li key={task.id} className="flex items-center justify-between bg-gray-50 border rounded p-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={task.done} onChange={() => toggleDone(task.id)} className="w-4 h-4" />
              <span className={task.done ? 'line-through text-gray-400' : ''}>{task.text}</span>
            </div>
            <div>
              <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:underline">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
