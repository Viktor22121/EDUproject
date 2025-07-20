import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSolvedAttempts } from '../endpoints/api'

export default function StatisticsPage() {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    (async () => setAttempts(await getSolvedAttempts()))();
  }, []);

  if (!attempts.length) return <p style={{ padding: 20 }}>Загрузка…</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>📈 Ваша статистика</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th style={th}>Ученик</th>
            <th style={th}>Предмет</th>
            <th style={th}>Тест №</th>
            <th style={th}>Попытка №</th>
            <th style={th}>Оценка</th>
            <th style={th}>Детали</th>
          </tr>
        </thead>

        <tbody>
          {attempts.map(a => (
            <tr key={a.id_attempt}>
              <td style={td}>
                {a.first_name} {a.last_name}
              </td>
              <td style={td}>{a.title}</td>
              <td style={td}>{a.id_test}</td>
              <td style={td}>{a.id_attempt}</td>
              <td style={td}>{a.grade ?? '—'}</td>
              <td style={td}>
                <Link to={`/attempt/${a.id_attempt}`}>Открыть</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


const th = { borderBottom: '1px solid #ccc', padding: '8px' };
const td = { borderBottom: '1px solid #eee', padding: '8px', textAlign: 'center' };
