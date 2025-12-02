import React from "react";
import { useParams } from "react-router-dom";

export default function LevelStudentsPage() {
  const { levelId } = useParams();
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Get all level student</h2>
      <p className="text-gray-600">Placeholder for students in level ID: {levelId}</p>
    </div>
  );
}


