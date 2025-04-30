export const calculateScoreForQuestion = (question,questionId, selectedAnswers, usedHints) => {
  const selectedAnswer = selectedAnswers[questionId];
  const correctAnswerIds = question.data.options?.filter(option => option.correct).map(option => option.id) || [];

  let gainedMarks = 0;

  if (question.templateId === 'single-choice' || question.templateId === 'true-or-false') {
    // Gain marks if the selected answer is correct
    if (selectedAnswer === correctAnswerIds[0]) {
      gainedMarks += +question.data.marks;
    }
  } else if (question.templateId === 'multiple-choice') {
    const selectedAnswerIds = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer];
    const correctSelected = selectedAnswerIds.filter(answerId => correctAnswerIds.includes(answerId)).length;
    const incorrectSelected = selectedAnswerIds.filter(answerId => !correctAnswerIds.includes(answerId)).length;

    // Award marks only if no incorrect answers are selected
    if (incorrectSelected === 0) {
      gainedMarks += (correctSelected / correctAnswerIds.length) * +question.data.marks;
    }
  }

  // Add hint marks if a hint was used
 // const hintUsed = usedHints[question._id];
 // const finalMarks = gainedMarks + (hintUsed ? +question.data.hintMarks : 0);

  return gainedMarks;
};
