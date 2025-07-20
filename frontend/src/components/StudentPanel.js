import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth';

export default function StudentPanel() {
  const navigate = useNavigate();

  const { logout_all } = useAuth();

  return (
    <div>
      <h2>🎓 Студенческая панель</h2>
      <p>Выберите действие.</p>

      <div style={{ display:'flex', gap:16, marginBottom:32 }}>
        <Link to="/choose-subject">
          <button style={{ padding:'12px 24px' }}>Выбрать предмет</button>
        </Link>

        <Link to="/statistics">
          <button style={{ padding:'12px 24px' }}>Статистика</button>
        </Link>
      </div>

      <button onClick={logout_all}>Выход</button>
    </div>
  )
}
