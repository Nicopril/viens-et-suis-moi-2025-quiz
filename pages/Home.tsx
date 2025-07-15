// pages/Home.tsx
import React, { useState } from 'react';
import LessonSelector from '../components/LessonSelector';
import { lessons } from '../data/lessons';

const Home: React.FC = () => {
  const [lessonId, setLessonId] = useState(1);
  const [selectedDay, setSelectedDay] = useState("Lundi");

  const handleGenerateQuiz = async () => {
    const lessonTitle = lessons.find((l) => l.id === lessonId)?.title;
    const body = JSON.stringify({ lessonTitle, day: selectedDay });

    const res = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <div>
      <LessonSelector selectedLessonId={lessonId} onChange={setLessonId} />
      <button onClick={handleGenerateQuiz} className="btn-primary">
        🎯 Générer le quiz
      </button>
    </div>
  );
};

export default Home;
