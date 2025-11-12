import React, { useState } from 'react'

const sampleExam = {
  questions: [
    { id: 'q1', type: 'multiple_choice', text: 'Berapa ibu kota Indonesia?', options:['Jakarta','Bandung','Surabaya','Medan'], answer_key: 'Jakarta', max_points: 2 },
    { id: 'q2', type: 'multi_select', text: 'Pilih ibu kota provinsi Jawa Barat', options:['Bandung','Bekasi','Depok','Bogor'], answer_key: ['Bandung','Bogor'], max_points: 4, penalty_per_wrong: 0.5 },
    { id: 'q3', type: 'short_answer', text: 'Sebutkan simbol kimia untuk air', answer_key: 'H2O', max_points: 1, matching: 'exact' },
    { id: 'q4', type: 'essay', text: 'Jelaskan proses fotosintesis pada tumbuhan', max_points: 10 }
  ]
}

const sampleSubmission = {
  answers: [
    { question_id: 'q1', response: 'Jakarta' },
    { question_id: 'q2', response: ['Bandung','Bogor'] },
    { question_id: 'q3', response: 'H2O' },
    { question_id: 'q4', response: 8 }
  ]
}

export default function App(){
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function grade(){
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/.netlify/functions/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam: sampleExam, answers: sampleSubmission.answers })
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, Arial' }}>
      <h1>Ujian SMA — React + Netlify Functions</h1>
      <p>Demo: klik <strong>Grade</strong> untuk memanggil fungsi serverless grading.</p>
      <button onClick={grade} disabled={loading} style={{ padding: '8px 12px' }}>{loading ? 'Loading...' : 'Grade'}</button>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{result ? JSON.stringify(result, null, 2) : 'Belum dinilai'}</pre>
    </div>
  )
}
