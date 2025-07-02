import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentPanel() {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert('Выберите файл');
      return;
    }
    alert(`Спасибо, ${name}! Ваш файл "${file.name}" отправлен.`);
  };

  return (
    <div className="panel-container">
      <h2>🧑‍🎓 Загрузить домашнее задание</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Введите ваше ФИО"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Отправить задание</button>
      </form>
      <br />
      <button onClick={() => navigate('/login')} className="logout-btn">
        Выход
      </button>
    </div>
  );
}