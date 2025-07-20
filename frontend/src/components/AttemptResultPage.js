import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { getAttemptById, getTestById } from '../endpoints/api'

export default function AttemptResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt,  setAttempt]  = useState(null);
  const [testInfo, setTestInfo] = useState(null);

  useEffect(() => {
    (async () => {
      const att = await getAttemptById(id);
      setAttempt(att);
      setTestInfo(await getTestById(att.test));
    })();
  }, [id]);

  if (!attempt || !testInfo) return <p style={{ padding:20 }}>Загрузка…</p>;

  const codeTitle = Object.fromEntries(
    testInfo.code_tasks.map(ct => [ct.id_question, ct.title])
  );

  const styles = {
    container:{ textAlign:'center', marginTop:50, padding:20 },
    title:    { fontSize:'2.5rem', fontWeight:'bold', marginBottom:20 },
    score:    { fontSize:'1.5rem', marginBottom:10 },
    grade:    { fontSize:'1.4rem', marginBottom:30 },
    author:   { fontSize:'1.2rem', marginBottom:20, color:'#555' },
    btn:      {
      display:'inline-block', padding:'15px 30px',
      background:'#0d6efd', color:'#fff', borderRadius:8,
      fontSize:'1.2rem', cursor:'pointer',
    },
  };

  return (
    <div>
      <Header />

      <div style={styles.container}>
        <h1 style={styles.title}>📊 Результаты теста</h1>

        <p style={styles.author}>
          Проходил: <strong>{attempt.first_name} {attempt.last_name}</strong>
        </p>

        <p style={styles.score}>
          Вы набрали <strong>{attempt.score}</strong> из{' '}
          <strong>{attempt.max_score}</strong> баллов&nbsp;
          (<strong>{Math.round((attempt.score / attempt.max_score) * 100)}%</strong>).
        </p>

        <p>
          Начат: {new Date(attempt.started_at).toLocaleString()} <br />
          Завершён: {new Date(attempt.finished_at).toLocaleString()}
        </p>

        <p style={styles.grade}>
          Ваша оценка: <strong>{attempt.grade}</strong>
        </p>

        <button style={styles.btn} onClick={() => navigate('/student/dashboard')}>
          Вернуться к предметам
        </button>
      </div>

      <div style={{ padding:24, maxWidth:800, margin:'0 auto' }}>
        <h3 style={{ marginTop:24 }}>Ваши ответы</h3>
        {attempt.answers.map(ans => (
          <div key={ans.id} style={{ marginBottom:16 }}>
            <p><strong>{ans.question}</strong></p>
            {ans.is_correct ? (
              <p style={{ color:'green', paddingLeft:12 }}>✅ {ans.selected.text}</p>
            ) : (
              <p style={{ color:'red',   paddingLeft:12 }}>❌ {ans.selected.text}</p>
            )}
          </div>
        ))}

        {attempt.submissions.length > 0 && (
          <>
            <h3 style={{ marginTop:32 }}>💻 Задачи на код</h3>
            {attempt.submissions.map(sub => (
              <div key={sub.id} style={{ marginBottom:24 }}>
                <p>
                  <strong>{codeTitle[sub.question] || `Задача ${sub.question}`}</strong>
                </p>
                <p>
                  Статус: <b>{sub.status}</b> &nbsp;|&nbsp;
                  Баллы: <b>{sub.score}</b>
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
