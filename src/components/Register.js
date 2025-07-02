import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // По умолчанию ученик
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify({ name, email, role }));
    alert('Регистрация успешна!');
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <h2>📝 Регистрация</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="ФИО"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Ученик</option>
          <option value="teacher">Учитель</option>
        </select>

        <button type="submit">Зарегистрироваться</button>
      </form>
      <br />
      <button onClick={() => navigate('/login')} className="back-btn">
        ← Назад
      </button>
    </div>
  );
}