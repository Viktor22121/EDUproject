import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Импорты компонентов
import Header from './components/Header';
import Login from './components/Login';
import Home from './components/Home';
import About from './components/About'; // Страница "О нас"
import StudentLogin from './components/StudentLogin'; // Страница входа для учеников
import RegisterStudent from './components/RegisterStudent'; // Регистрация ученика
import ChooseSubject from './components/ChooseSubject'; // Выбор предмета
import StudentDashboard from './components/StudentPanel'; // Панель ученика
import TeacherPanel from './components/TeacherPanel'; // Панель учителя
import JournalPage from './components/JournalPage';
import CreateTestPage from './components/CreateTestPage';

import AttemptResultPage from './components/AttemptResultPage'; // Страница результата
import SubjectPage from './components/SubjectPage';
import TestPage from './components/TestPage';
import StatisticsPage from './components/StatisticsPage';

import { AuthProvider } from './contexts/useAuth';
import PrivateRoute from './components/private_route';
function App() {
  const [userFullName, setUserFullName] = useState(null);

  return (
    <Router>
      <AuthProvider>
      <div className="App">
        {/* Шапка сайта */}
        <Header userFullName={userFullName} />

        {/* Основной контент */}
        <main style={mainStyles}>
          <Routes>
            {/* Главная страница */}
            <Route path="/" element={<Home />} />

            {/* Страница "О нас" */}
            <Route path="/about" element={<About />} />

            {/* Вход и регистрация */}
            <Route
              path="/login"
              element={<Login setUserFullName={setUserFullName} />}
            />
            <Route
              path="/register"
              element={<RegisterStudent setUserFullName={setUserFullName} />}
            />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/register-student" element={<RegisterStudent />} />

            {/* Учителя*/}
            <Route path="/teacher" element={<PrivateRoute requireTeacher><TeacherPanel /></PrivateRoute>} />
            <Route path="/teacher/journal" element={<PrivateRoute requireTeacher><JournalPage /></PrivateRoute>} />
            <Route path="/teacher/create-test" element={<PrivateRoute requireTeacher><CreateTestPage /></PrivateRoute>} />

            {/* Ученики */}
            <Route path="/student/dashboard" element={<PrivateRoute requireStudent><StudentDashboard /></PrivateRoute>} />
            <Route path="/statistics" element={<PrivateRoute requireStudent><StatisticsPage /></PrivateRoute>} />
            <Route path="/choose-subject" element={<PrivateRoute requireStudent><ChooseSubject /></PrivateRoute>} />
            <Route path="/subject/:name"element={<PrivateRoute requireStudent><SubjectPage /></PrivateRoute>} />
            <Route path="/test/:id"     element={<PrivateRoute><TestPage /></PrivateRoute>} />
            <Route path="/attempt/:id"  element={<PrivateRoute><AttemptResultPage /></PrivateRoute>} />


          </Routes>
        </main>
      </div>
      </AuthProvider>
    </Router>
  )
}

// Стили для основного контента
const mainStyles = {
  paddingTop: "80px", // Отступ сверху, чтобы контент не перекрывался шапкой
  minHeight: "100vh",
};

export default App;