import React from 'react';
import { lessons } from '../data/lessons';

interface LessonSelectorProps {
  selectedIndex: number;
  onChange: (index: number) => void;
}

const LessonSelector: React.FC<LessonSelectorProps> = ({ selectedIndex, onChange }) => {
  return (
    <div className="mb-6">
      <label htmlFor="lesson-select" className="block text-slate-700 font-semibold mb-2">
        Choisissez une leçon :
      </label>
      <select
        id="lesson-select"
        value={selectedIndex}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
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
