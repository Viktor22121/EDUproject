import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header style={headerStyles}>
      <button
        onClick={() => {
          navigate(-1);
          setTimeout(() => window.location.reload(), 100);
        }}
        style={backButtonStyles}
      >
        ← Назад
      </button>

      <h1 style={titleStyles}>🎓 Образовательный портал</h1>

      <nav style={navStyles}>
        <Link to="/about" style={linkStyles}>О нас</Link>

        {user ? (
          <span style={{ ...linkStyles, cursor: 'default' }}>
            {user.first_name} {user.last_name}
          </span>
        ) : (
          <Link to="/login" style={linkStyles}>Войти</Link>
        )}
      </nav>
    </header>
  );
}

// Стили для шапки
const headerStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: "#0d6efd",
  padding: "10px 20px",
  color: "white",
  zIndex: 10,
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

// Стили для кнопки "Назад"
const backButtonStyles = {
  padding: "5px 10px", // Уменьшаем отступы
  backgroundColor: "#fff",
  color: "#0d6efd",
  border: "none",
  borderRadius: "5px", // Меняем на обычные скругленные углы
  cursor: "pointer",
  fontSize: "0.9rem", // Уменьшаем размер текста
  whiteSpace: "nowrap", // Запрещаем перенос текста
  minWidth: "80px", // Минимальная ширина кнопки
  maxWidth: "120px", // Максимальная ширина кнопки
};

// Стили для заголовка
const titleStyles = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  margin: 0,
  textAlign: "center",
  flexGrow: 1, // Раздвигаем заголовок по центру
};

// Стили для навигации
const navStyles = {
  display: "flex",
  gap: "15px",
};

// Стили для ссылок
const linkStyles = {
  color: "#fff",
  textDecoration: "none",
  fontSize: "1rem",
  fontWeight: "bold",
};

export default Header;