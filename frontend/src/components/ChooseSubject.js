import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTests } from '../endpoints/api';

const subjects = [
  {
    key: 'math',
    label: 'Математика',
    descr: 'Алгебра, геометрия, анализ',
    icon: 'fas fa-calculator', // Иконка для математики
  },
  {
    key: 'russian',
    label: 'Русский',
    descr: 'Грамматика, орфография, письмо',
    icon: 'fas fa-book-open', // Иконка для русского языка
  },
  {
    key: 'english',
    label: 'Английский',
    descr: 'Разговорный и письменный английский',
    icon: 'fas fa-language', // Иконка для английского языка
  },
  {
    key: 'informatics',
    label: 'Информатика',
    descr: 'Программирование, алгоритмы, ИТ',
    icon: 'fas fa-laptop-code', // Иконка для информатики
  },
];

export default function ChooseSubject() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    (async () => {
      const all = await getTests();
      const c = {};
      subjects.forEach((s) => {
        c[s.key] = all.filter((t) => t.title === s.label).length;
      });
      setCounts(c);
    })();
  }, []);

  return (
    <div className="choose-subject-container">
      <h2 className="title">Выберите предмет</h2>

      {/* Вертикальный список предметов */}
      <div className="subjects-list">
        {subjects.map((s) => (
          <div key={s.key} className="subject-card">
            {/* Иконка */}
            <i className={`${s.icon} subject-icon`} />

            {/* Информация о предмете */}
            <div className="subject-info">
              <h3>{s.label}</h3>
              <p>{s.descr}</p>
              <p style={{ fontStyle: 'italic', marginBottom: '12px' }}>
                Доступно тестов: {counts[s.key] ?? 0}
              </p>
            </div>

            {/* Кнопка "Начать" */}
            <Link to={`/subject/${s.key}`} className="btn btn-primary">
              Начать
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}