const { calculateScore } = require('../../shared/score');

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { exam, answers } = body;

    if (!exam || !answers) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input' })
      };
    }

    const result = calculateScore(exam, answers);
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'internal_error',
        message: err.message
      })
    };
  }
};
