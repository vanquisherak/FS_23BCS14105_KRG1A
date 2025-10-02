import React from "react";

function StudentCard({ name, roll, course }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
      <div className="font-semibold text-lg mb-2">{name}</div>
      <div className="text-gray-600 mb-1">Roll No: <span className="font-medium">{roll}</span></div>
      <div className="text-gray-600">Course: <span className="font-medium">{course}</span></div>
    </div>
  );
}

export default StudentCard;
