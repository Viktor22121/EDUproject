import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTest } from '../endpoints/api'

const SUBJECTS = [
  'Информатика',
  'Математика',
  'Английский',
  'Русский',
];

export default function CreateTestPage() {
  const nav = useNavigate();

  const [test, setTest] = useState({
    title: '',
    questions: [],
    code_tasks: [],
  })

  const update = (path, value) => {
    setTest(prev => {
      const next = structuredClone(prev);
      let ref = next;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path.at(-1)] = value;
      return next;
    });
  };

  const addQuestion  = () =>
    setTest(p => ({ ...p, questions: [...p.questions, { text:'', answers:[] }] }));

  const addAnswer    = qi =>
    setTest(p => {
      const arr = structuredClone(p.questions);
      arr[qi].answers.push({ text:'', is_correct:false });
      return { ...p, questions: arr };
    });

  const addCodeTask  = () =>
    setTest(p => ({
      ...p,
      code_tasks: [
        ...p.code_tasks,
        { title:'', description:'', language:'python', time_limit:2,
          memory_limit:128, docker_image:'python:3.12-alpine', testcases:[] },
      ],
    }));

  const addCase      = ci =>
    setTest(p => {
      const arr = structuredClone(p.code_tasks);
      arr[ci].testcases.push({ stdin:'', expected_out:'', weight:1 });
      return { ...p, code_tasks: arr };
    });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!test.title) return alert('Выберите предмет');

    const payload = test.title === 'Информатика'
      ? test
      : { ...test, code_tasks: undefined };

    try {
      const res = await createTest(payload);
      alert(`✅ Тест создан!  ID = ${res.id}`);
      nav('/teacher');
    } catch {
      alert('❌ Не получилось создать тест');
    }
  };

  return (
    <div style={{ padding:24, maxWidth:800, margin:'0 auto' }}>
      <h2>Создание теста</h2>

      <label>
        Предмет:&nbsp;
        <select
          value={test.title}
          onChange={e => update(['title'], e.target.value)}
        >
          <option value="">-- выберите --</option>
          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </label>

      <h3>Вопросы</h3>
      {test.questions.map((q, qi) => (
        <div key={qi} style={block}>
          <input
            style={{ width:'100%' }}
            placeholder="Текст вопроса"
            value={q.text}
            onChange={e => update(['questions', qi, 'text'], e.target.value)}
          />
          {q.answers.map((a, ai) => (
            <div key={ai} style={{ display:'flex', gap:6, marginTop:4 }}>
              <input
                style={{ flex:1 }}
                placeholder="Вариант ответа"
                value={a.text}
                onChange={e => update(['questions', qi, 'answers', ai, 'text'], e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={a.is_correct}
                  onChange={e => update(['questions', qi, 'answers', ai, 'is_correct'], e.target.checked)}
                /> правильный
              </label>
            </div>
          ))}
          <button type="button" onClick={() => addAnswer(qi)}>+ ответ</button>
        </div>
      ))}
      <button type="button" onClick={addQuestion}>+ вопрос</button>

      {test.title === 'Информатика' && (
        <>
          <h3 style={{ marginTop:24 }}>Задачи на код</h3>
          {test.code_tasks.map((c, ci) => (
            <div key={ci} style={block}>
              <input
                style={{ width:'100%', marginBottom:4 }}
                placeholder="Название задачи"
                value={c.title}
                onChange={e => update(['code_tasks', ci, 'title'], e.target.value)}
              />
              <textarea
                style={{ width:'100%', minHeight:60 }}
                placeholder="Описание"
                value={c.description}
                onChange={e => update(['code_tasks', ci, 'description'], e.target.value)}
              />

              <strong>Тест‑кейсы:</strong>
              {c.testcases.map((t, ti) => (
                <div key={ti} style={{ display:'flex', gap:6, marginTop:4 }}>
                  <input
                    placeholder="stdin"
                    value={t.stdin}
                    onChange={e => update(['code_tasks', ci, 'testcases', ti, 'stdin'], e.target.value)}
                  />
                  <input
                    placeholder="ожидаемый вывод"
                    value={t.expected_out}
                    onChange={e => update(['code_tasks', ci, 'testcases', ti, 'expected_out'], e.target.value)}
                  />
                  <input
                    type="number" min="1" style={{ width:60 }}
                    value={t.weight}
                    onChange={e => update(['code_tasks', ci, 'testcases', ti, 'weight'], +e.target.value)}
                  />
                </div>
              ))}
              <button type="button" onClick={() => addCase(ci)}>+ testcase</button>
            </div>
          ))}
          <button type="button" onClick={addCodeTask}>+ код‑задача</button>
        </>
      )}

      <br /><button onClick={handleSubmit}>Сохранить тест</button>
    </div>
  )
}

const block = { border:'1px solid #ccc', padding:12, margin:'12px 0' }
