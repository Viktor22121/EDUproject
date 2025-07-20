import { Link } from 'react-router-dom'

function About() {
  return (
    <div style={containerStyles}>
      <h1 style={titleStyles}>📚 О нашем портале</h1>
      <p style={descriptionStyles}>
        Мы — команда энтузиастов, которая стремится сделать образование доступным и интересным для каждого. 
        Наш портал помогает ученикам проверять свои знания, а преподавателям — легко создавать и управлять заданиями.
      </p>
      <p style={descriptionStyles}>
        Учеба — это не только труд, но и удовольствие. Мы верим, что каждый может достичь успеха, если ему предоставить правильные инструменты.
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

export default About;