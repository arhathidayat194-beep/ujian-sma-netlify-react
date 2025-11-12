// netlify/functions/grade.js
const path = require('path');

function safeRequire(relPath) {
  try {
    return require(relPath);
  } catch (e) {
    // fallback with .js extension
    try { return require(relPath + '.js'); } catch (e2) { throw e; }
  }
}

let scorer;
try {
  // adjust path relative to this file; shared/score.js should export scoreQuestion
  scorer = safeRequire(path.join(__dirname, '..', '..', 'shared', 'score'));
} catch (err) {
  console.error('Failed to require shared/score:', err && err.stack ? err.stack : String(err));
  scorer = null;
}

exports.handler = async function(event, context) {
  try {
    // Always return JSON; accept GET (info) and POST (grading)
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, message: 'grade function alive' })
      };
    }

    // Expect POST
    const payload = (() => {
      try {
        return JSON.parse(event.body || '{}');
      } catch (e) {
        return null;
      }
    })();

    if (!payload) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'invalid_json', message: 'Request body is not valid JSON' })
      };
    }

    const { exam, answers } = payload;
    if (!exam || !Array.isArray(exam.questions)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'missing_exam', message: 'exam.questions array required' })
      };
    }

    if (!scorer || typeof scorer.scoreQuestion !== 'function') {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'scorer_missing', message: 'scoring module not found or invalid' })
      };
    }

    // grade
    let totalObtained = 0;
    let totalMax = 0;
    const details = [];

    for (const q of exam.questions) {
      const max = q.max_points || 1;
      totalMax += max;
      const ansObj = (answers || []).find(a => a.question_id === q.id);
      const resp = ansObj ? ansObj.response : undefined;
      let sc;
      try {
        sc = scorer.scoreQuestion(q, resp);
      } catch (err) {
        console.error('Error scoring question', q.id, err && err.stack ? err.stack : String(err));
        sc = 0;
      }
      totalObtained += sc;
      details.push({ question_id: q.id, score: sc, max });
    }

    const percent = totalMax ? Math.round((totalObtained / totalMax) * 10000) / 100 : 0;
    return {
      statusCode: 200,
      body: JSON.stringify({ total_obtained: totalObtained, total_max: totalMax, percent, details })
    };

  } catch (err) {
    console.error('Unhandled in handler:', err && err.stack ? err.stack : String(err));
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'internal_error', message: err.message || String(err), stack: err.stack || null })
    };
  }
};
