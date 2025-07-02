import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <h1>🎓 Образовательный портал</h1>
      <p>Выберите роль:</p>
      <button onClick={() => navigate('/teacher')}>👩‍🏫 Учитель</button>
      <button onClick={() => navigate('/student')}>🧑‍🎓 Ученик</button>
    </div>
  );
}