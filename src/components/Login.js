import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.email === email && password) {
      // Здесь можно добавить проверку пароля
      if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/teacher');
      }
    } else {
      alert('Неверные данные');
    }
  };

  return (
    <div className="auth-container">
      <h2>🔐 Вход</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Войти</button>
      </form>
      <p>
        Нет аккаунта?{' '}
        <a href="/register">Зарегистрируйтесь</a>
      </p>
    </div>
  );
}