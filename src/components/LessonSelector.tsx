// src/components/LessonSelector.tsx

import React from 'react';
import { lessons } from '../data/lessons';

interface LessonSelectorProps {
  // selectedIndex ici représente l'ID de la leçon, pas l'index du tableau
  selectedIndex: number; 
  onChange: (lessonId: number) => void; // On attend l'ID de la leçon en retour
}

const LessonSelector: React.FC<LessonSelectorProps> = ({ selectedIndex, onChange }) => {
  return (
    <div className="mb-6">
      <label htmlFor="lesson-select" className="block text-slate-700 font-semibold mb-2">
        Choisissez une leçon :
      </label>
      <select
        id="lesson-select"
        value={selectedIndex} // La valeur sélectionnée est l'ID
        onChange={(e) => onChange(parseInt(e.target.value, 10))} // On parse l'ID en entier
        className="w-full p-3 text-lg border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 bg-slate-50"
      >
        {lessons.map((lesson) => (
          <option key={lesson.id} value={lesson.id}>
            Leçon {lesson.id} : {lesson.reference}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LessonSelector;
