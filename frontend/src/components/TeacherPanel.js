import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function TeacherPanel() {
  const nav = useNavigate();
  const { logout_all } = useAuth();

  return (
    <div className="panel-container">
      <h2 className="panel-title">👩‍🏫 Панель преподавателя</h2>

      {/* Контейнер для кнопок */}
      <div className="button-grid">
        {/* Кнопка "Электронный дневник" */}
        <button
          className="action-button"
          onClick={() => nav('/teacher/journal')}
        >
          📑 Электронный дневник
        </button>

        {/* Кнопка "Создание тестов" */}
        <button
          className="action-button"
          onClick={() => nav('/teacher/create-test')}
        >
          ➕ Создание тестов
        </button>

        {/* Кнопка "Выход" */}
        <button className="action-button logout-button" onClick={logout_all}>
          🚪 Выход
        </button>
      </div>
    </div>
  );
}