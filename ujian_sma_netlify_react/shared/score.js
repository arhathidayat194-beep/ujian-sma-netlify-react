// shared/score.js
function normalizeText(s) {
  return String(s || '').trim().toLowerCase();
}

function scoreQuestion(question, response) {
  const max = question.max_points || 1;
  switch (question.type) {
    case 'multiple_choice':
      return response === question.answer_key ? max : 0;

    case 'multi_select': {
      const studentSet = new Set(response || []);
      const keySet = new Set(question.answer_key || []);
      const totalCorrect = keySet.size || 1;
      let correctChosen = 0;
      let wrongChosen = 0;
      for (const opt of studentSet) {
        if (keySet.has(opt)) correctChosen++;
        else wrongChosen++;
      }
      const base = (correctChosen / totalCorrect) * max;
      const penaltyPerWrong = question.penalty_per_wrong || 0;
      const score = Math.max(0, base - (penaltyPerWrong * wrongChosen));
      return Math.round(score * 100) / 100;
    }

    case 'short_answer': {
      const exact = question.matching === 'exact';
      if (exact) {
        return normalizeText(response) === normalizeText(question.answer_key) ? max : 0;
      } else {
        const a = normalizeText(response);
        const b = normalizeText(question.answer_key);
        if (!a || !b) return 0;
        const common = a.split('').filter(ch => b.includes(ch)).length;
        const score = Math.min(1, common / Math.max(b.length, 1)) * max;
        return Math.round(score * 100) / 100;
      }
    }

    case 'essay':
      return typeof response === 'number' ? Math.min(max, Math.max(0, response)) : 0;

    default:
      return 0;
  }
}

module.exports = { scoreQuestion };
