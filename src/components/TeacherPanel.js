import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherPanel() {
  const [subject, setSubject] = useState('');
  const subjects = ['Математика', 'Физика', 'Химия', 'История', 'Русский язык'];
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (subject) {
      alert(`Генерация задания по предмету: ${subject}`);
    } else {
      alert('Выберите дисциплину');
    }
  };

  return (
    <div className="panel-container">
      <h2>👩‍🏫 Генерация домашнего задания</h2>
      <select value={subject} onChange={(e) => setSubject(e.target.value)}>
        <option value="">-- Выберите дисциплину --</option>
        {subjects.map((s, i) => (
          <option key={i} value={s}>{s}</option>
        ))}
      </select>
      <button onClick={handleGenerate} disabled={!subject}>
        Сгенерировать
      </button>
      <br />
      <button onClick={() => navigate('/login')} className="logout-btn">
        Выход
      </button>
    </div>
  );
}