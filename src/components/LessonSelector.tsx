import React from 'react';
import { lessons } from '../data/lessons';

type Props = {
  selectedLessonId: number;
  onChange: (id: number) => void;
};

const LessonSelector: React.FC<Props> = ({ selectedLessonId, onChange }) => {
  return (
    <div className="my-4">
      <label htmlFor="lesson" className="block text-slate-700 font-semibold mb-1">
        📚 Choisissez une leçon :
      </label>
      <select
        id="lesson"
        value={selectedLessonId}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-slate-300 rounded px-3 py-2 w-full"
      >
        {lessons.map((lesson) => (
          <option key={lesson.id} value={lesson.id}>
            {lesson.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LessonSelector;
