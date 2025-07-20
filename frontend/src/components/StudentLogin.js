import { useState } from 'react'
import { useAuth } from '../contexts/useAuth'
import { useNavigate } from 'react-router-dom'

const StudentLogin = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login_student } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    login_student(username, password);
  }

  return (
    <div className="auth-container">
      <h2>📚 Вход для учеников</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="username">Логин:</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Введите логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Войти</button>
      </form>
      <p style={{ marginTop: 10 }}>
        Нет аккаунта?{' '}
        <button
          onClick={() => navigate('/register')}
          className="link-button"
        >
          Зарегистрируйтесь
        </button>
      </p>
    </div>
  )
}


export default StudentLogin;