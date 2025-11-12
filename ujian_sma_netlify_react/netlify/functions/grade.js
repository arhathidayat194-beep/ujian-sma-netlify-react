// Netlify Function - grade.js
const { scoreQuestion } = require('../../shared/score');

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const payload = JSON.parse(event.body || '{}');
    const exam = payload.exam;
    const answers = payload.answers || [];

    if (!exam || !Array.isArray(exam.questions)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing exam.questions in body' }) };
    }

    let totalObtained = 0;
    let totalMax = 0;
    const details = [];

    for (const q of exam.questions) {
      totalMax += q.max_points || 1;
      const ans = answers.find(a => a.question_id === q.id);
      const resp = ans ? ans.response : undefined;
      const sc = scoreQuestion(q, resp);
      totalObtained += sc;
      details.push({ question_id: q.id, score: sc, max: q.max_points || 1 });
    }

    const percent = totalMax ? Math.round((totalObtained / totalMax) * 10000) / 100 : 0;

    return {
      statusCode: 200,
      body: JSON.stringify({ total_obtained: totalObtained, total_max: totalMax, percent, details })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'internal_error', message: err.message }) };
  }
};
