import React from 'react'

export default function StudentCard({ name, roll, course }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-3">
      <div className="text-lg font-medium">{name}</div>
      <div className="text-sm text-gray-600">Roll: <span className="font-medium">{roll}</span></div>
      <div className="text-sm text-gray-600">Course: <span className="font-medium">{course}</span></div>
      <div className="mt-auto pt-2">
        <button className="text-blue-600 hover:underline">View profile</button>
      </div>
    </div>
  )
}
