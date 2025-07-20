import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTests } from '../endpoints/api'

const titleMap = {
  math:        'Математика',
  russian:     'Русский',
  english:     'Английский',
  informatics: 'Информатика',
}

export default function SubjectPage() {
  const { name } = useParams();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    (async () => {
      const all = await getTests();
      setTests(all.filter(t => t.title === titleMap[name]));
    })()
  }, [name])

  return (
    <div>
      <h2>📚 {titleMap[name]}</h2>
      <p>Выберите тест:</p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {tests.map(t => (
          <Link key={t.id_tests} to={`/test/${t.id_tests}`}>
            <button>{`Тест №${t.id_tests}`}</button>
          </Link>
        ))}
      </div>
    </div>
  )
}
