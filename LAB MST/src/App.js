import React, { useState } from "react";
import StudentCard from "./StudentCard";

// Todo List Component
function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  const addTask = () => {
    if (input.trim()) {
      setTasks([...tasks, { text: input, completed: false }]);
      setInput("");
    }
  };

  const toggleTask = (idx) => {
    setTasks(
      tasks.map((task, i) =>
        i === idx ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Todo List</h2>
      <div className="flex mb-4">
        <input
          className="border rounded-l px-3 py-2 w-full focus:outline-none"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          onClick={addTask}
        >
          Add
        </button>
      </div>
      <ul>
        {tasks.map((task, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between mb-2"
          >
            <span
              className={`flex-1 cursor-pointer ${
                task.completed ? "line-through text-gray-400" : ""
              }`}
              onClick={() => toggleTask(idx)}
            >
              {task.text}
            </span>
            <button
              className="ml-4 text-red-500 hover:text-red-700"
              onClick={() => deleteTask(idx)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Student Data
const students = [
  { name: "Alice Johnson", roll: "101", course: "Mathematics" },
  { name: "Bob Smith", roll: "102", course: "Physics" },
  { name: "Carol Lee", roll: "103", course: "Chemistry" },
  { name: "David Kim", roll: "104", course: "Biology" },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <TodoList />
      <h2 className="text-2xl font-bold mb-4 text-center">Student Info Cards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {students.map((student, idx) => (
          <StudentCard key={idx} {...student} />
        ))}
      </div>
    </div>
  );
}

export default App;
