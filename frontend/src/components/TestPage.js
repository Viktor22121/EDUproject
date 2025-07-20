import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import {
  getTestById, startAttempt, answerQuestion, finishAttempt,
  submitCode, getSubmission
} from '../endpoints/api'

export default function TestPage() {
  const { id } = useParams();
  const testId = Number(id);
  const navigate = useNavigate();

  const [testData, setTestData] = useState(null);
  const [attempt,  setAttempt]  = useState(null);

  const [answers,  setAnswers]  = useState({}); 
  const [checking, setChecking] = useState({});
  const [results,  setResults]  = useState({});

  const [devToolsOpen, setDevToolsOpen] = useState(false);
  
  const polling = useRef({});

  useEffect(() => {
    (async () => {
      const data = await getTestById(testId);
      const att  = await startAttempt(testId);
      setTestData(data);
      setAttempt(att);
    })()
    return () => Object.values(polling.current).forEach(clearInterval);
  }, [testId])

  useEffect(() => {
    const blockCopy = (e) => e.preventDefault();
    const blockContextMenu = (e) => e.preventDefault();
    const blockSelection = (e) => e.preventDefault();

    const detectDevTools = () => {
      const threshold = 100;
      const widthDiff = window.outerWidth - window.innerWidth * window.devicePixelRatio*0.8;
      const heightDiff = window.outerHeight - window.innerHeight * window.devicePixelRatio*0.8;

      if (widthDiff > threshold || heightDiff > threshold) {
        setDevToolsOpen(true);
      } else {
        setDevToolsOpen(false);
      }
    };

    const interval = setInterval(detectDevTools, 500);

    document.addEventListener("copy", blockCopy);
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("selectstart", blockSelection);
    window.addEventListener("resize", detectDevTools);
    window.addEventListener("wheel", detectDevTools);

    detectDevTools();

    return () => {
      clearInterval(interval);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("selectstart", blockSelection);
      window.removeEventListener("resize", detectDevTools);
      window.removeEventListener("wheel", detectDevTools);
    }
  }, [])




  const updateAnswer = async (key, value, sendNow = false) => {
    setAnswers(prev => ({ ...prev, [key]: value }))

    if (sendNow && attempt) {
      const qId = typeof key === 'string' ? Number(key.split('-')[1]) : key;
      await answerQuestion(attempt.id, qId, value)
    }
  }

  const handleCheck = async qId => {
    const code = answers[`code-${qId}`] || '';
    if (!code.trim()) { alert('Введите код'); return; }

    setChecking(p => ({ ...p, [qId]: true }));
    const sub = await submitCode(attempt.id, qId, code);

    polling.current[qId] = setInterval(async () => {
      const res = await getSubmission(sub.id);
      if (res.status !== 'PENDING') {
        clearInterval(polling.current[qId]);
        setResults(p => ({ ...p, [qId]: res }));
        setChecking(p => ({ ...p, [qId]: false }));
      }
    }, 1000)
  }

  const handleFinish = async () => {
    for (const [k, v] of Object.entries(answers)) {
      if (k.startsWith('code-') || typeof v !== 'string') continue;
      await answerQuestion(attempt.id, Number(k), v);
    }
    await finishAttempt(attempt.id);
    navigate(`/attempt/${attempt.id}`);
  }

  if (!testData) return <p style={{ padding: 20 }}>Загрузка...</p>;

  if (devToolsOpen) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: 50 }}>
        <h1>Включены DevTools! Тест заблокирован.</h1>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="test-container">
        <div className="left-panel">
          <h2>📚 {testData.title}</h2>
          <p>Попытка №{attempt.id}</p>
          <button onClick={() => navigate('/student/dashboard')}>Выход</button>
        </div>

        <div className="right-panel">
          <h2 style={{ textAlign: 'center' }}>📝 {testData.title}</h2>

          {testData.questions.map(q => (
            <div key={q.id_question} className="question-container">
              <p>{q.text}</p>
              {q.answers.length ? (
                q.answers.map(a => (
                  <label key={a.id_answer} style={{ display: 'block' }}>
                    <input
                      type="radio"
                      name={`q-${q.id_question}`}
                      value={a.id_answer}
                      checked={answers[q.id_question] === a.id_answer}
                      onChange={() =>
                        updateAnswer(q.id_question, a.id_answer, true)
                      }
                    />
                    {a.text}
                  </label>
                ))
              ) : (
                <textarea
                  rows={3}
                  style={{ width: '100%', marginTop: 8 }}
                  value={answers[q.id_question] || ''}
                  onChange={e =>
                    updateAnswer(q.id_question, e.target.value, false)
                  }
                />
              )}
            </div>
          ))}

          {testData.code_tasks.length > 0 && (
            <>
              <h3 style={{ marginTop: 24 }}>💻 Задачи на код</h3>
              {testData.code_tasks.map(c => (
                <div key={c.id_question} style={{ marginBottom: 24 }}>
                  <p><strong>{c.title}</strong></p>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{c.description}</pre>

                  <textarea
                    rows={8}
                    style={{ width: '100%' }}
                    placeholder="Введите ваш код…"
                    value={answers[`code-${c.id_question}`] || ''}
                    onChange={e =>
                      updateAnswer(`code-${c.id_question}`, e.target.value)
                    }
                  />

                  <button
                    style={{ marginTop: 8 }}
                    disabled={checking[c.id_question]}
                    onClick={() => handleCheck(c.id_question)}
                  >
                    {checking[c.id_question] ? 'Проверка…' : 'Проверить'}
                  </button>

                  {results[c.id_question] && (
                    <pre style={{ background: '#f4f4f4', padding: 10, marginTop: 8 }}>
                      Статус: {results[c.id_question].status}{"\n"}
                      Баллы:  {results[c.id_question].score}
                    </pre>
                  )}
                </div>
              ))}
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={handleFinish}>Завершить задание</button>
          </div>
        </div>
      </div>
    </div>
  )
}
