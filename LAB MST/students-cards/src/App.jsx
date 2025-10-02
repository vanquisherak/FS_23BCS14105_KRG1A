import React from 'react'
import StudentCard from './StudentCard'

const students = [
  { id: 1, name: 'Alice Johnson', roll: 'S101', course: 'Physics' },
  { id: 2, name: 'Bob Smith', roll: 'S102', course: 'Mathematics' },
  { id: 3, name: 'Carlos Diaz', roll: 'S103', course: 'Chemistry' },
  { id: 4, name: 'Divya Patel', roll: 'S104', course: 'Computer Science' }
]

export default function App() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold mb-6">Students</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {students.map(s => (
          <StudentCard key={s.id} name={s.name} roll={s.roll} course={s.course} />
        ))}
      </div>
    </div>
  )
}
