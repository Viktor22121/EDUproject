import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={containerStyles}>
      <h1 style={titleStyles}>🎓 Добро пожаловать на Образовательный портал!</h1>
      <p style={descriptionStyles}>
        Здесь вы найдете все необходимое для обучения и саморазвития. Выберите предмет, пройдите тест и узнайте свой уровень знаний.
        Наш портал создан для учеников и преподавателей, которые стремятся к успеху в учебе.
      </p>
      <Link to="/login">
        <button style={ctaButtonStyles}>Начать обучение</button>
      </Link>
    </div>
  );
}

// Стили для контейнера
const containerStyles = {
  textAlign: "center",
  marginTop: "50px",
  padding: "20px",
};

// Стили для заголовка
const titleStyles = {
  fontSize: "2.5rem",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px",
};

// Стили для описания
const descriptionStyles = {
  fontSize: "1.2rem",
  color: "#555",
  marginBottom: "30px",
};

// Стили для кнопки
const ctaButtonStyles = {
  padding: "15px 30px",
  backgroundColor: "#0d6efd",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "1.2rem",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

ctaButtonStyles["&:hover"] = {
  backgroundColor: "#0b5ed7",
};

export default Home;