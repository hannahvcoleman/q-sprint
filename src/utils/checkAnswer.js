import { simplify } from 'mathjs'

export function checkAnswer(userAnswer, question) {
  // Normalisation
  const normalizeAnswer = (answer) => {
    return answer
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/−/g, '-') // Convert typographic minus
      .replace(/dy\/dx=/g, 'dy/dx=')
      .replace(/y=/g, 'y=')
      .replace(/x=/g, 'x=')
      .replace(/⁰/g, '^0')
      .replace(/¹/g, '^1')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/⁴/g, '^4')
      .replace(/⁵/g, '^5')
      .replace(/⁶/g, '^6')
      .replace(/⁷/g, '^7')
      .replace(/⁸/g, '^8')
      .replace(/⁹/g, '^9')
  }

  const normalizedUserAnswer = normalizeAnswer(userAnswer)
  const normalizedCorrectAnswer = normalizeAnswer(question.answer)

  // Check 1: Exact string match after normalisation
  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    return { correct: true, method: 'exact' }
  }

  // Check 2: Match against accepted answers array
  if (question.acceptedAnswers) {
    for (const accepted of question.acceptedAnswers) {
      if (normalizeAnswer(accepted) === normalizedUserAnswer) {
        return { correct: true, method: 'accepted' }
      }
    }
  }

  // Check 3: Algebraic equivalence via mathjs
  try {
    const userExpr = simplify(normalizedUserAnswer)
    const correctExpr = simplify(normalizedCorrectAnswer)
    
    if (userExpr.toString() === correctExpr.toString()) {
      return { correct: true, method: 'algebraic' }
    }
  } catch (error) {
    // MathJS failed, continue to other checks
  }

  // Check 4: Multi-part answers
  if (question.answerParts) {
    const userParts = normalizedUserAnswer.split(/[,\s]+/).filter(p => p.trim())
    
    if (userParts.length === question.answerParts.length) {
      let allPartsMatch = true
      
      for (let i = 0; i < question.answerParts.length; i++) {
        const partMatches = question.answerParts[i].patterns.some(
          pattern => normalizeAnswer(pattern) === userParts[i]
        )
        
        if (!partMatches) {
          allPartsMatch = false
          break
        }
      }
      
      if (allPartsMatch) {
        return { correct: true, method: 'multi-part' }
      }
    }
  }

  return { correct: false, method: 'none' }
}
