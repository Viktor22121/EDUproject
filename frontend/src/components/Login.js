import { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [code, setCode] = useState('');
  const { login_teacher } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    login_teacher(code);
  };

  // Обработка регистрации ученика
  const handleStudentRegister = () => {
    navigate('/register'); // Переходим на страницу регистрации ученика
  };

  // Обработка входа ученика
  const handleStudentLogin = () => {
    navigate('/student/login'); // Переходим на страницу входа ученика
  };

  return (
    <div className="auth-container">
      {/* Раздел для учителей */}
      <section className="auth-section teacher-section">
        <h2>👨‍🏫 Вход для учителей</h2>
        <p>
          Введите ваш учительский код для доступа к панели управления тестами и просмотру
          результатов учеников.
        </p>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Введите учительский код"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit">Войти как учитель</button>
        </form>
      </section>

      {/* Раздел для учеников */}
      <section className="auth-section student-section">
        <h2>📚 Вход для учеников</h2>
        <p>Войдите в свой аккаунт, чтобы проходить тесты и отслеживать свои результаты.</p>
        <button onClick={handleStudentLogin}>Войти как ученик</button>
        <br />
        <p>Если у вас еще нет аккаунта, зарегистрируйтесь:</p>
        <button onClick={handleStudentRegister}>Зарегистрироваться как ученик</button>
      </section>

      {/* Дополнительная информация */}
      <footer className="auth-footer">
        <p>
          Если у вас возникли вопросы, свяжитесь с нами по адресу{' '}
          <a href="mailto:support@example.com">support@example.com</a>.
        </p>
      </footer>
    </div>
  );
}