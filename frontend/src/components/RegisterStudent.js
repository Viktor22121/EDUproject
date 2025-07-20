import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');

  const { register_student } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    register_student(username, email, password, first, last);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Регистрация</h2>

      <form onSubmit={handleRegister} style={styles.form}>
        {/* Имя */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Имя:</label>
          <input
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        {/* Фамилия */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Фамилия:</label>
          <input
            value={last}
            onChange={(e) => setLast(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        {/* Логин */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Логин:</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        {/* E-mail */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>E‑mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        {/* Пароль */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        {/* Кнопка регистрации */}
        <button type="submit" style={styles.button}>
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

// Стили
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    backgroundColor: '#ffffff', // Белый фон для контейнера
    border: '1px solid #ddd',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', // Увеличенная тень для лучшего контраста
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '12px', // Увеличенные отступы для удобства
    fontSize: '16px', // Единый размер шрифта
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxSizing: 'border-box', // Чтобы поля ввода были одного размера
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
};

export default Register;