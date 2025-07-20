import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSolvedAttempts, filterAttempts } from '../endpoints/api';

export default function JournalPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [testId, setTestId] = useState('');

  useEffect(() => {
    (async () => {
      setAttempts(await getSolvedAttempts());
      setLoading(false);
    })();
  }, []);

  const handleFilter = async (e) => {
    e.preventDefault();
    setLoading(true);

    const params = {};
    if (firstName.trim()) params.first_name = firstName.trim();
    if (lastName.trim()) params.last_name = lastName.trim();
    if (testId.trim()) params.test = testId.trim();

    setAttempts(
      Object.keys(params).length
        ? await filterAttempts(params)
        : await getSolvedAttempts()
    );
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={styles.title}>📑 Электронный дневник</h2>

      {/* Форма фильтра */}
      <form onSubmit={handleFilter} style={styles.filterForm}>
        <input
          placeholder="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="ID теста"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Фильтровать
        </button>
        <button
          type="button"
          onClick={() => {
            setFirstName('');
            setLastName('');
            setTestId('');
            handleFilter(new Event('submit')); // сброс
          }}
          style={styles.resetButton}
        >
          Сброс
        </button>
      </form>

      {/* Таблица результатов */}
      {loading ? (
        <p style={styles.loading}>Загрузка…</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Студент</th>
              <th style={styles.th}>Тест №</th>
              <th style={styles.th}>Предмет</th>
              <th style={styles.th}>Оценка</th>
              <th style={styles.th}>Детали</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 ? (
              <tr>
                <td colSpan="5" style={styles.noData}>
                  Ничего не найдено
                </td>
              </tr>
            ) : (
              attempts.map((a) => (
                <tr key={a.id_attempt}>
                  <td style={styles.td}>{a.first_name} {a.last_name}</td>
                  <td style={styles.td}>{a.id_test}</td>
                  <td style={styles.td}>{a.title}</td>
                  <td style={styles.td}>{a.grade ?? '—'}</td>
                  <td style={styles.td}>
                    <Link to={`/attempt/${a.id_attempt}`} style={styles.link}>
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Стили
const styles = {
  title: {
    fontSize: '1.75rem',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  filterForm: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    width: '100%',
    maxWidth: '200px',
  },
  inputFocus: {
    borderColor: '#0d6efd',
    boxShadow: '0 0 5px rgba(13, 110, 253, 0.5)',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0d6efd',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0b5ed7',
  },
  resetButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  resetButtonHover: {
    backgroundColor: '#c82333',
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1.2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    borderBottom: '1px solid #ccc',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: '12px',
    textAlign: 'center',
  },
  noData: {
    padding: '12px',
    textAlign: 'center',
    color: '#999',
  },
  link: {
    color: '#0d6efd',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'color 0.3s ease',
  },
  linkHover: {
    color: '#0b5ed7',
  },
};