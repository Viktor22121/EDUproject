import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentPanel from './components/StudentPanel';
import TeacherPanel from './components/TeacherPanel';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentPanel />} />
        <Route path="/teacher" element={<TeacherPanel />} />
      </Routes>
    </div>
  );
}

export default App;