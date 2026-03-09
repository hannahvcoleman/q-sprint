import { useState, useEffect } from 'react'
import topicsData from './data/topics.json'
import questionsData from './data/questions.json'
import { checkAnswer } from './utils/checkAnswer'

// Design system colors
const colors = {
  cream: '#f5f0e8',
  white: '#fffefb',
  blue: '#3430d4',
  navy: '#1e1b4b',
  terracotta: '#c8553d',
  text: '#3d3552',
  textLight: '#6b6580',
  textMuted: '#9992a8',
  border: '#d8d0c4'
}

const SCREENS = {
  WELCOME: 'WELCOME',
  SETUP: 'SETUP',
  READY: 'READY',
  SPRINT: 'SPRINT',
  FEEDBACK: 'FEEDBACK',
  SPRINT_REVIEW: 'SPRINT_REVIEW',
  BREAK: 'BREAK',
  SESSION_SUMMARY: 'SESSION_SUMMARY'
}

const LS_NAME_KEY = 'qsprint_student_name'

// Milk Glass Timer Component
const MilkGlass = ({ fill, size = 'small', time }) => {
  const dimensions = size === 'small' 
    ? { width: 54, height: 70 }
    : { width: 120, height: 160 }
  
  const glassHeight = dimensions.height - 10 // Leave room at top
  const milkHeight = glassHeight * fill
  const isLow = fill < 0.1
  
  return (
    <div style={styles.milkGlassContainer}>
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={styles.milkGlassSvg}
      >
        {/* Glass outline */}
        <path 
          d={`M 5,10 L ${dimensions.width - 5},10 L ${dimensions.width - 10},${dimensions.height - 5} L 10,${dimensions.height - 5} Z`}
          fill="none" 
          stroke={colors.blue} 
          strokeWidth="2"
        />
        
        {/* Milk fill */}
        <path 
          d={`M 7,${12 + (glassHeight - milkHeight)} L ${dimensions.width - 7},${12 + (glassHeight - milkHeight)} L ${dimensions.width - 12},${glassHeight - 7} L 12,${glassHeight - 7} Z`}
          fill={isLow ? '#ffcccc' : 'white'} 
          opacity="0.9"
        />
        
        {/* Time overlay */}
        <text
          x={dimensions.width / 2}
          y={dimensions.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            ...styles.milkGlassTime,
            fill: isLow ? colors.terracotta : colors.text,
            fontSize: size === 'small' ? '12px' : '18px'
          }}
        >
          {time}
        </text>
      </svg>
    </div>
  )
}

// Load state from localStorage
const loadState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch { return fallback }
}

export default function App() {
  const [screen, setScreen] = useState(() => 
    loadState('qs_name', '') ? SCREENS.SETUP : SCREENS.WELCOME
  )
  const [studentName, setStudentName] = useState(() => loadState('qs_name', ''))
  const [nameInput, setNameInput] = useState('')
  const [returningName, setReturningName] = useState(() => loadState('qs_name', ''))
  const [subject, setSubject] = useState('')
  const [selectedCurriculum, setSelectedCurriculum] = useState('')
  const [confidence, setConfidence] = useState(null)
  const [sprintDuration, setSprintDuration] = useState(15)
  const [questionStyle, setQuestionStyle] = useState('mixed')
  const [showExitModal, setShowExitModal] = useState(false)
  const [breakTimeLeft, setBreakTimeLeft] = useState(180) // 3 minutes in seconds
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [sprintResults, setSprintResults] = useState([])
  const [timeLeft, setTimeLeft] = useState(sprintDuration * 60)
  const [hasWorkedIt, setHasWorkedIt] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [masteryMap, setMasteryMap] = useState({})
  const [sprintsCompleted, setSprintsCompleted] = useState(0)

  useEffect(() => {
    const saved = loadState('qs_name', '')
    if (saved) setReturningName(saved)
  }, [])

  useEffect(() => {
    if (studentName) localStorage.setItem('qs_name', JSON.stringify(studentName))
  }, [studentName])

  useEffect(() => {
    localStorage.setItem('qs_mastery', JSON.stringify(masteryMap))
  }, [masteryMap])

  // Sprint timer countdown
  useEffect(() => {
    if (screen !== SCREENS.SPRINT || timeLeft <= 0 || showExitModal) return
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setScreen(SCREENS.SPRINT_REVIEW)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [screen, timeLeft > 0, showExitModal])

  // Break timer countdown
  useEffect(() => {
    if (screen !== SCREENS.BREAK || breakTimeLeft <= 0) return
    
    const interval = setInterval(() => {
      setBreakTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [screen, breakTimeLeft > 0])

  const navigateTo = (targetScreen) => {
    setScreen(targetScreen)
  }

  const selectNextQuestion = () => {
    console.log('selectNextQuestion called, subject:', subject)
    console.log('questionsData length:', questionsData?.length)
    console.log('questionsData is array:', Array.isArray(questionsData))
    
    // Build list of levels this subject can see
    const levelMap = {
      'gcse-foundation': ['gcse-foundation'],
      'gcse-higher': ['gcse-foundation', 'gcse-higher'],
      'alevel-maths': ['alevel-maths'],
      'alevel-further': ['alevel-maths', 'alevel-further'],
      'ib-sl': ['ib-sl'],
      'ib-hl': ['ib-sl', 'ib-hl'],
    }
    const allowedLevels = levelMap[subject] || []

    // Filter by level
    let pool = questionsData.filter(q => allowedLevels.includes(q.level))
    console.log('pool after level filter:', pool.length)

    // Filter by question style
    if (questionStyle === 'quickfire') {
      pool = pool.filter(q => q.questionType === 'short')
    } else if (questionStyle === 'mixed') {
      pool = pool.filter(q => q.questionType === 'short' || q.questionType === 'standard')
    } else if (questionStyle === 'exam') {
      pool = pool.filter(q => q.questionType === 'standard' || q.questionType === 'extended')
    }
    console.log('pool after style filter:', pool.length)

    // Exclude already-asked questions this sprint
    const asked = new Set(sprintResults.map(r => r.questionId))
    pool = pool.filter(q => !asked.has(q.id))

    // Fallback: if no questions match, try without style filter
    if (pool.length === 0) {
      pool = questionsData.filter(q => allowedLevels.includes(q.level))
      pool = pool.filter(q => !asked.has(q.id))
    }

    if (pool.length === 0) {
      console.warn('No questions available for', subject, questionStyle)
      setCurrentQuestion(null)
      return false  // return false to indicate failure
    }

    const idx = Math.floor(Math.random() * pool.length)
    setCurrentQuestion(pool[idx])
    setUserAnswer('')
    setShowHint(false)
    setHintLevel(0)
    setHasWorkedIt(false)
    return true  // return true on success
  }

  const submitAnswer = () => {
    if (!currentQuestion || !userAnswer.trim()) return
    
    const isCorrect = checkAnswer(userAnswer, currentQuestion)
    const newResult = {
      questionId: currentQuestion.id,
      correct: isCorrect,
      userAnswer: userAnswer.trim(),
      correctAnswer: currentQuestion.answer,
      timeSpent: (sprintDuration * 60) - timeLeft,
      hintsUsed: hintLevel,
      timestamp: Date.now(),
      classification: isCorrect ? 'correct' : null
    }
    
    setSprintResults(prev => [...prev, newResult])
    setLastResult(newResult)
    
    // Update mastery tracking
    const st = currentQuestion.subtopic
    setMasteryMap(prev => {
      const current = prev[st] || { score: 0.5, attempts: 0, correct: 0 }
      const newCorrect = current.correct + (isCorrect ? 1 : 0)
      const newAttempts = current.attempts + 1
      return {
        ...prev,
        [st]: { score: newCorrect / newAttempts, attempts: newAttempts, correct: newCorrect }
      }
    })
    
    navigateTo(SCREENS.FEEDBACK)
  }

  const confirmName = (name) => {
    setStudentName(name)
    setReturningName(name)
    setScreen(SCREENS.SETUP)
  }

  const switchUser = () => {
    localStorage.removeItem('qs_name')
    setStudentName('')
    setReturningName('')
    setNameInput('')
    setSubject('')
    setSelectedCurriculum('')
    setConfidence(null)
    setSprintDuration(15)
    setQuestionStyle('mixed')
    setScreen(SCREENS.WELCOME)
  }

  const saveAndEnd = () => {
    setShowExitModal(false)
    setScreen(SCREENS.SESSION_SUMMARY)
  }

  const discardSprint = () => {
    setShowExitModal(false)
    setScreen(SCREENS.SETUP)
  }

  const renderScreen = () => {
    // Helper function for time formatting
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    switch (screen) {
      case SCREENS.WELCOME:
        return (
          <div style={styles.welcomeScreen}>
            {/* Mountain logo */}
            <div style={styles.logoContainer}>
              <svg width="36" height="24" viewBox="0 0 60 40">
                <path d="M5 35 L20 10 L30 22 L40 8 L55 35" stroke={colors.blue} 
                  strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" 
                  fill="none"/>
              </svg>
              <h1 style={styles.logoTitle}>Q-Sprint</h1>
            </div>

            {/* Scallop wave divider */}
            <svg viewBox="0 0 400 32" preserveAspectRatio="none" style={styles.waveDivider}>
              <path d="M0 32 C20 0,40 0,50 16 C60 32,80 32,100 16 C110 0,130 
                0,150 16 C160 32,180 32,200 16 C210 0,230 0,250 16 C260 32,280 
                32,300 16 C310 0,330 0,350 16 C360 32,380 32,400 16 L400 32Z" 
                fill={colors.blue} />
            </svg>

            {/* Hero content */}
            <div style={styles.heroContent}>
              <h2 style={styles.heroTitle}>Focused maths practice, one question at a time.</h2>
              <p style={styles.heroSubtitle}>
                Q-Sprint helps you build mathematical confidence through focused practice sessions. 
                Choose your subject, set your difficulty, and improve one step at a time.
              </p>
            </div>

            {/* Name input */}
            <div style={styles.nameInputSection}>
              <label style={styles.inputLabel}>What should I call you?</label>
              <input 
                type="text" 
                placeholder="Your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={styles.nameInput}
              />
            </div>

            {/* Continue button */}
            <button 
              onClick={() => confirmName(nameInput)}
              disabled={!nameInput.trim()}
              style={nameInput.trim() ? styles.primaryButton : styles.primaryButtonDisabled}
            >
              Let's go →
            </button>

            {/* Footer note */}
            <p style={styles.footerNote}>Grab a pen and paper — you'll need them.</p>
          </div>
        )

      case SCREENS.SETUP: {
        const curricula = [
          { value: 'gcse', label: 'GCSE Maths' },
          { value: 'a-level', label: 'A-Level Maths' },
          { value: 'ib', label: 'IB Maths' },
        ]
        
        const subjectLevels = {
          gcse: [
            { value: 'gcse-foundation', label: 'Foundation' },
            { value: 'gcse-higher', label: 'Higher' },
          ],
          'a-level': [
            { value: 'alevel-maths', label: 'Maths' },
            { value: 'alevel-further', label: 'Further Maths' },
          ],
          ib: [
            { value: 'ib-sl', label: 'SL' },
            { value: 'ib-hl', label: 'HL' },
          ],
        }
        const confidenceLevels = [
          { value: 'low', label: 'I struggle', color: colors.terracotta },
          { value: 'mid', label: 'Getting there', color: '#d4882a' },
          { value: 'high', label: 'Fairly solid', color: colors.blue },
        ]
        const durations = [10, 15, 20, 25]
        const questionStyles = [
          { value: 'quickfire', label: 'Quick fire', desc: 'Fast recall — aim for speed and accuracy' },
          { value: 'mixed',     label: 'Mixed',     desc: 'A balanced mix of quick and multi-step questions' },
          { value: 'exam',      label: 'Exam practice', desc: 'Longer problems like you\'d see in an exam' },
        ]

        return (
          <div style={styles.setupScreen}>
            {/* Greeting */}
            <div style={styles.greeting}>
              <p style={styles.greetingText}>Hey {studentName} 👋</p>
              <button onClick={switchUser} style={styles.switchUserLink}>
                Not {studentName}? Switch user
              </button>
            </div>

            {/* Title */}
            <h2 style={styles.setupTitle}>Set up your session</h2>

            {/* Scallop wave divider */}
            <svg viewBox="0 0 400 32" preserveAspectRatio="none" style={styles.waveDivider}>
              <path d="M0 32 C20 0,40 0,50 16 C60 32,80 32,100 16 C110 0,130 
                0,150 16 C160 32,180 32,200 16 C210 0,230 0,250 16 C260 32,280 
                32,300 16 C310 0,330 0,350 16 C360 32,380 32,400 16 L400 32Z" 
                fill={colors.blue} />
            </svg>

            {/* STEP 1 - Curriculum */}
            <div style={styles.stepSection}>
              <p style={styles.stepLabel}>STEP 1 — CURRICULUM</p>
              <div style={styles.chipContainer}>
                {curricula.map(c => (
                  <button
                    key={c.value}
                    onClick={() => {
                      setSelectedCurriculum(c.value)
                      setSubject('')
                    }}
                    style={selectedCurriculum === c.value ? styles.chipActive : styles.chip}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2 - Sub-level */}
            {selectedCurriculum && (
              <div style={styles.stepSection}>
                <p style={styles.stepLabel}>STEP 2 — LEVEL</p>
                <div style={styles.chipContainer}>
                  {subjectLevels[selectedCurriculum].map(level => (
                    <button
                      key={level.value}
                      onClick={() => setSubject(level.value)}
                      style={subject === level.value ? styles.chipActive : styles.chip}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
                
                {/* Topics coverage text */}
                {subject && topicsData[subject] && (
                  <p style={styles.coverageText}>
                    Covers: {topicsData[subject].topics.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* STEP 3 - Confidence */}
            <div style={styles.stepSection}>
              <p style={styles.stepLabel}>STEP 3 — CONFIDENCE</p>
              <div style={styles.confidenceContainer}>
                {confidenceLevels.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setConfidence(c.value)}
                    style={confidence === c.value ? styles.confidenceCardActive : styles.confidenceCard}
                  >
                    <div style={{...styles.confidenceColor, backgroundColor: c.color}}></div>
                    <div style={styles.confidenceLabel}>{c.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 4 - Sprint duration */}
            <div style={styles.stepSection}>
              <p style={styles.stepLabel}>STEP 4 — SPRINT DURATION</p>
              <div style={styles.chipContainer}>
                {durations.map(d => (
                  <button
                    key={d}
                    onClick={() => setSprintDuration(d)}
                    style={sprintDuration === d ? styles.chipActive : styles.chip}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 5 - Question style */}
            <div style={styles.stepSection}>
              <p style={styles.stepLabel}>STEP 5 — QUESTION STYLE</p>
              <div style={styles.chipContainer}>
                {questionStyles.map(style => (
                  <button
                    key={style.value}
                    onClick={() => setQuestionStyle(style.value)}
                    style={questionStyle === style.value ? styles.chipActive : styles.chip}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
              {questionStyle && (
                <p style={styles.styleHint}>
                  {questionStyles.find(s => s.value === questionStyle)?.desc}
                </p>
              )}
            </div>

            {/* Start session button */}
            <button 
              onClick={() => navigateTo(SCREENS.READY)}
              disabled={!subject || !confidence}
              style={!subject || !confidence ? styles.startButtonDisabled : styles.startButton}
            >
              Start session →
            </button>
          </div>
        )
      }

      case SCREENS.READY:
        return (
          <div style={styles.readyScreen}>
            {/* Large emoji */}
            <div style={styles.readyEmoji}>📝</div>
            
            {/* Title */}
            <h2 style={styles.readyTitle}>Ready?</h2>
            
            {/* Scallop wave */}
            <svg viewBox="0 0 400 32" preserveAspectRatio="none" style={styles.waveDivider}>
              <path d="M0 32 C20 0,40 0,50 16 C60 32,80 32,100 16 C110 0,130 
                0,150 16 C160 32,180 32,200 16 C210 0,230 0,250 16 C260 32,280 
                32,300 16 C310 0,330 0,350 16 C360 32,380 32,400 16 L400 32Z" 
                fill={colors.blue} />
            </svg>
            
            {/* Duration text */}
            <p style={styles.readyDuration}>
              You've got {sprintDuration} minutes of focused practice ahead.
            </p>
            
            {/* Checklist */}
            <div style={styles.checklist}>
              <div style={styles.checklistItem}>
                <span style={styles.checklistIcon}>✓</span>
                <span>Pen and paper</span>
              </div>
              <div style={styles.checklistItem}>
                <span style={styles.checklistIcon}>✓</span>
                <span>Calculator (if needed)</span>
              </div>
              <div style={styles.checklistItem}>
                <span style={styles.checklistIcon}>✓</span>
                <span>No distractions</span>
              </div>
            </div>
            
            {/* Begin sprint button */}
            <button 
              onClick={() => {
                setTimeLeft(sprintDuration * 60)
                setSprintResults([])
                setLastResult(null)
                const hasQuestions = selectNextQuestion()
                if (hasQuestions) {
                  setScreen(SCREENS.SPRINT)
                } else {
                  alert('No questions available for this level and style yet. Try a different combination.')
                }
              }} 
              style={styles.beginSprintButton}
            >
              Begin sprint
            </button>
            
            {/* Back link */}
            <button 
              onClick={() => navigateTo(SCREENS.SETUP)} 
              style={styles.backLink}
            >
              ← Back to setup
            </button>
          </div>
        )

      case SCREENS.SPRINT:
        const progress = ((sprintDuration * 60 - timeLeft) / (sprintDuration * 60)) * 100

        return (
          <div style={styles.sprintScreen}>
            {/* Top bar */}
            <div style={styles.sprintTopBar}>
              <MilkGlass 
                fill={timeLeft / (sprintDuration * 60)} 
                size="small" 
                time={formatTime(timeLeft)}
              />
              <div style={styles.sprintProgress}>
                <div style={{...styles.progressBar, width: `${progress}%`}}></div>
              </div>
              <button onClick={() => setShowExitModal(true)} style={styles.sprintExitBtn}>
                Exit
              </button>
            </div>

            {/* Topic tag */}
            <div style={styles.topicTag}>
              {currentQuestion?.topic?.toUpperCase() || 'MATHS'}
            </div>

            {/* Question */}
            <h3 style={styles.questionText}>
              {currentQuestion?.question || 'Loading question...'}
            </h3>

            {/* Diagram renderer */}
            {currentQuestion?.diagram && (
              <div style={styles.diagramContainer}>
                {currentQuestion.diagram === 'right-triangle' && (
                  <svg width="200" height="150" viewBox="0 0 200 150">
                    <path d="M 50,130 L 150,130 L 100,30 Z" 
                      fill="none" stroke={colors.blue} strokeWidth="2"/>
                    <text x="100" y="90" textAnchor="middle" fill={colors.text}>a</text>
                    <text x="60" y="110" textAnchor="middle" fill={colors.text}>b</text>
                    <text x="140" y="110" textAnchor="middle" fill={colors.text}>c</text>
                  </svg>
                )}
              </div>
            )}

            {/* Hint box */}
            {showHint && (
              <div style={styles.hintBox}>
                <div style={styles.hintHeader}>
                  <span style={styles.hintIcon}>💡</span>
                  <span style={styles.hintTitle}>Hint</span>
                </div>
                <div style={styles.hintContent}>
                  {hintLevel === 1 && "Try breaking this down into smaller steps."}
                  {hintLevel === 2 && "What's the first thing you need to figure out?"}
                  {hintLevel === 3 && currentQuestion?.hint}
                </div>
              </div>
            )}

            {/* Work area */}
            {!hasWorkedIt ? (
              <div style={styles.workArea}>
                <p style={styles.workPrompt}>Work this out on paper first.</p>
                <button 
                  onClick={() => setHasWorkedIt(true)}
                  style={styles.primaryButton}
                >
                  I've worked it out
                </button>
                <button
                  onClick={() => setHintLevel(prev => Math.min(prev + 1, 3))}
                  style={styles.hintButton}
                >
                  {hintLevel === 0 ? "I'm stuck — give me a hint" : "Show more"}
                </button>
              </div>
            ) : (
              <div style={styles.workArea}>
                <input 
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  style={styles.answerInput}
                  autoFocus
                />
                <button 
                  onClick={submitAnswer}
                  style={styles.checkButton}
                >
                  Check
                </button>
                {hintLevel < 3 && (
                  <button
                    onClick={() => setHintLevel(prev => Math.min(prev + 1, 3))}
                    style={styles.hintButton}
                  >
                    Need a hint?
                  </button>
                )}
              </div>
            )}
          </div>
        )

      case SCREENS.FEEDBACK:
        const isCorrect = lastResult?.correct || false
        
        return (
          <div style={styles.feedbackScreen}>
            {/* Top bar */}
            <div style={styles.sprintTopBar}>
              <MilkGlass 
                fill={timeLeft / (sprintDuration * 60)} 
                size="small" 
                time={formatTime(timeLeft)}
              />
            </div>

            {isCorrect ? (
              /* CORRECT feedback */
              <div style={styles.correctFeedback}>
                <div style={styles.feedbackIcon}>✓</div>
                <h3 style={styles.feedbackTitle}>Correct!</h3>
                <p style={styles.correctAnswer}>{lastResult?.correctAnswer}</p>
                <button 
                  onClick={() => {
                    if (timeLeft > 0) {
                      selectNextQuestion()
                      setScreen(SCREENS.SPRINT)
                    } else {
                      setScreen(SCREENS.SPRINT_REVIEW)
                    }
                  }}
                  style={styles.nextButton}
                >
                  Next question →
                </button>
              </div>
            ) : (
              /* INCORRECT feedback */
              <div style={styles.incorrectFeedback}>
                <div style={styles.feedbackIcon}>✗</div>
                <h3 style={styles.feedbackTitle}>Not quite</h3>
                <div style={styles.answerComparison}>
                  <div style={styles.answerBox}>
                    <p style={styles.answerLabel}>Your answer:</p>
                    <p style={styles.userAnswer}>{lastResult?.userAnswer}</p>
                  </div>
                  <div style={styles.answerBox}>
                    <p style={styles.answerLabel}>Correct answer:</p>
                    <p style={styles.correctAnswer}>{lastResult?.correctAnswer}</p>
                  </div>
                </div>
                
                {/* Worked solution */}
                <div style={styles.workedSolution}>
                  <p style={styles.solutionLabel}>Worked solution:</p>
                  <p style={styles.solutionText}>
                    {currentQuestion?.hint || 'Solution not available'}
                  </p>
                </div>
                
                {/* Classification buttons */}
                <div style={styles.classificationButtons}>
                  <button 
                    onClick={() => {
                      // Update result with slip-up classification
                      const updatedResults = sprintResults.map(r => 
                        r.questionId === lastResult.questionId 
                          ? { ...r, classification: 'slip_up' }
                          : r
                      )
                      setSprintResults(updatedResults)
                      
                      if (timeLeft > 0) {
                        selectNextQuestion()
                        setScreen(SCREENS.SPRINT)
                      } else {
                        setScreen(SCREENS.SPRINT_REVIEW)
                      }
                    }}
                    style={styles.slipUpButton}
                  >
                    💡 Slip-up / I understand
                  </button>
                  <button 
                    onClick={() => {
                      // Update result with need_practice classification
                      const updatedResults = sprintResults.map(r => 
                        r.questionId === lastResult.questionId 
                          ? { ...r, classification: 'need_practice' }
                          : r
                      )
                      setSprintResults(updatedResults)
                      
                      if (timeLeft > 0) {
                        selectNextQuestion()
                        setScreen(SCREENS.SPRINT)
                      } else {
                        setScreen(SCREENS.SPRINT_REVIEW)
                      }
                    }}
                    style={styles.needPracticeButton}
                  >
                    🏳️ Need more practice
                  </button>
                </div>
              </div>
            )}
          </div>
        )

      case SCREENS.SPRINT_REVIEW:
        const correctCount = sprintResults.filter(r => r.correct).length
        const slipUps = sprintResults.filter(r => r.classification === 'slip_up').length
        const needPractice = sprintResults.filter(r => r.classification === 'need_practice').length

        return (
          <div style={styles.reviewScreen}>
            {/* Title */}
            <h2 style={styles.reviewTitle}>Sprint complete! 🎉</h2>
            
            {/* Scallop wave divider */}
            <div style={styles.scallopDivider}></div>
            
            {/* Stats row */}
            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{correctCount}</span>
                <span style={styles.statLabel}>Correct</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{slipUps}</span>
                <span style={styles.statLabel}>Slip-ups</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{needPractice}</span>
                <span style={styles.statLabel}>To revisit</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <button 
              onClick={() => {
                setSprintsCompleted(prev => prev + 1)
                navigateTo(SCREENS.BREAK)
              }} 
              style={styles.primaryButton}
            >
              Take a 5-minute break
            </button>
            <button 
              onClick={() => navigateTo(SCREENS.SESSION_SUMMARY)} 
              style={styles.secondaryButton}
            >
              End session
            </button>
            <button 
              onClick={() => navigateTo(SCREENS.SETUP)} 
              style={styles.backLink}
            >
              ← Back to menu
            </button>
          </div>
        )

      case SCREENS.BREAK:
        return (
          <div style={styles.breakScreen}>
            {/* Title */}
            <h2 style={styles.breakTitle}>Break time</h2>
            <p style={styles.breakSubtitle}>Step away. Stretch. Get water.</p>
            
            {/* Milk glass timer */}
            <div style={styles.timerContainer}>
              <MilkGlass 
                fill={breakTimeLeft / 180} 
                size="large" 
                time={formatTime(breakTimeLeft)}
              />
            </div>
            
            {/* Action buttons */}
            <button 
              onClick={() => navigateTo(SCREENS.READY)} 
              style={styles.primaryButton}
            >
              Start next sprint
            </button>
            
            <button 
              onClick={() => navigateTo(SCREENS.SESSION_SUMMARY)} 
              style={styles.secondaryButton}
            >
              End session
            </button>
            
            {/* Back link */}
            <button 
              onClick={() => navigateTo(SCREENS.SETUP)} 
              style={styles.backLink}
            >
              ← Back to menu
            </button>
          </div>
        )

      case SCREENS.SESSION_SUMMARY:
        // Get unique subtopics from masteryMap
        const allSubtopics = Object.keys(masteryMap)
        
        const totalTime = sprintsCompleted * sprintDuration

        return (
          <div style={styles.summaryScreen}>
            {/* Top banner */}
            <div style={styles.summaryBanner}>
              <div style={styles.bannerWave}></div>
              <h2 style={styles.summaryTitle}>Session Facts</h2>
            </div>
            
            {/* Thick divider */}
            <div style={styles.thickDivider}></div>
            
            {/* Stats rows */}
            <div style={styles.summaryStats}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Sprints Completed</span>
                <span style={styles.summaryValue}>{sprintsCompleted}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Focus Time</span>
                <span style={styles.summaryValue}>{totalTime} min</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Accuracy</span>
                <span style={styles.summaryValue}>--</span>
              </div>
            </div>
            
            {/* Medium divider */}
            <div style={styles.mediumDivider}></div>
            
            {/* Mastery by subtopic */}
            <div style={styles.masterySection}>
              {allSubtopics.map(subtopic => (
                <div key={subtopic} style={styles.masteryRow}>
                  <div style={styles.masteryRow}>
                    <span style={styles.masterySubtopic}>
                      {subtopic} ({masteryMap[subtopic]?.attempts || 0} Qs)
                    </span>
                    <span style={styles.masteryPercentage}>
                      {Math.round((masteryMap[subtopic]?.score || 0) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Thin divider */}
            <div style={styles.thinDivider}></div>
            
            {/* Disclaimer */}
            <p style={styles.disclaimer}>
              Next session will prioritise weaker areas while maintaining strengths.
            </p>
            
            {/* Action button */}
            <button 
              onClick={() => {
                // Keep name, reset everything else
                setSubject('')
                setSelectedCurriculum('')
                setConfidence(null)
                setSprintDuration(15)
                setQuestionStyle('mixed')
                setScreen(SCREENS.SETUP)
              }} 
              style={styles.primaryButton}
            >
              Finish & Close
            </button>
          </div>
        )

      default:
        return <div>Unknown screen</div>
    }
  }

  return (
    <div style={styles.outerShell}>
      <div className="frame" style={styles.innerFrame}>
        {renderScreen()}
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        
        @media (min-width: 769px) {
          .frame {
            max-width: 480px;
            width: 100%;
            height: 92vh;
          }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          .frame {
            max-width: 95vw;
            height: 95vh;
            border-radius: 16px;
          }
        }
        
        @media (max-width: 480px) {
          .frame {
            width: 100vw;
            height: 100vh;
            border-radius: 0;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  )
}

const styles = {
  outerShell: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#f5f0e8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  innerFrame: {
    backgroundColor: '#fffefb',
    borderRadius: '20px',
    boxShadow: '0 8px 40px rgba(30,27,75,0.10)',
    overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    padding: '24px 20px',
  },

  // Welcome screen
  welcomeScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    padding: '40px 24px 32px',
    boxSizing: 'border-box',
  },
  welcomeHero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    justifyContent: 'center',
  },
  logoMark: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    backgroundColor: '#1e1b4b',
    color: '#f5f0e8',
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    fontSize: '2.4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
    boxShadow: '0 4px 20px rgba(30,27,75,0.25)',
  },
  logoTitle: {
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    color: '#1e1b4b',
    fontSize: '2.8rem',
    margin: 0,
    lineHeight: 1.1,
  },
  tagline: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 400,
    color: '#6b6580',
    fontSize: '1rem',
    margin: '8px 0 0',
    textAlign: 'center',
  },
  welcomeCard: {
    width: '100%',
    backgroundColor: '#f5f0e8',
    borderRadius: '16px',
    padding: '28px 24px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  welcomeBack: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    color: '#6b6580',
    fontSize: '1rem',
    margin: 0,
    fontWeight: 400,
  },
  returningName: {
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    color: '#1e1b4b',
    fontSize: '1.8rem',
    fontWeight: 700,
    margin: '0 0 8px',
  },
  nameLabel: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 500,
    color: '#1e1b4b',
    fontSize: '1rem',
    alignSelf: 'flex-start',
  },
  nameInput: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e0daf0',
    borderRadius: '10px',
    fontSize: '16px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    backgroundColor: '#fffefb',
    color: '#1e1b4b',
    outline: 'none',
    boxSizing: 'border-box',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#1e1b4b',
    color: '#fffefb',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '10px',
    fontSize: '1rem',
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  primaryButtonDisabled: {
    width: '100%',
    backgroundColor: '#ccc8dc',
    color: '#fffefb',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '10px',
    fontSize: '1rem',
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 600,
    cursor: 'not-allowed',
    letterSpacing: '0.02em',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    color: '#6b6580',
    border: 'none',
    fontSize: '0.9rem',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '4px',
  },
  welcomeFooter: {
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: '0.75rem',
    color: '#b0a8c8',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginTop: '24px',
  },

  // Setup screen
  setupScreen: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    padding: '28px 4px 8px',
    fontFamily: 'IBM Plex Sans, sans-serif',
  },
  setupHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  setupTitle: {
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    color: '#1e1b4b',
    fontSize: '1.6rem',
    margin: 0,
  },
  switchUserBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6b6580',
    fontSize: '0.85rem',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
  setupSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionLabel: {
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: '0.72rem',
    fontWeight: 500,
    color: '#6b6580',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: 0,
  },
  subjectCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  subjectCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    padding: '14px 16px',
    backgroundColor: '#f5f0e8',
    border: '2px solid transparent',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  subjectCardSelected: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    padding: '14px 16px',
    backgroundColor: '#eeeaf8',
    border: '2px solid #1e1b4b',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  subjectCardLabel: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#1e1b4b',
  },
  subjectCardSub: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 400,
    fontSize: '0.8rem',
    color: '#6b6580',
  },
  confidenceRow: {
    display: 'flex',
    gap: '8px',
  },
  confidenceBtn: {
    flex: 1,
    padding: '12px 8px',
    backgroundColor: '#f5f0e8',
    border: '2px solid transparent',
    borderRadius: '10px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 500,
    fontSize: '0.95rem',
    color: '#1e1b4b',
    cursor: 'pointer',
  },
  confidenceBtnSelected: {
    flex: 1,
    padding: '12px 8px',
    backgroundColor: '#eeeaf8',
    border: '2px solid #1e1b4b',
    borderRadius: '10px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#1e1b4b',
    cursor: 'pointer',
  },
  chipRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  chip: {
    padding: '8px 16px',
    backgroundColor: '#f5f0e8',
    border: '2px solid transparent',
    borderRadius: '999px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 500,
    fontSize: '0.88rem',
    color: '#1e1b4b',
    cursor: 'pointer',
  },
  chipSelected: {
    padding: '8px 16px',
    backgroundColor: '#1e1b4b',
    border: '2px solid #1e1b4b',
    borderRadius: '999px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 600,
    fontSize: '0.88rem',
    color: '#fffefb',
    cursor: 'pointer',
  },
  styleCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  styleCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  confidenceCard: {
    flex: 1,
    minWidth: '100px',
    padding: '16px 12px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.white,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  },
  confidenceCardActive: {
    flex: 1,
    minWidth: '100px',
    padding: '16px 12px',
    border: `2px solid transparent`,
    borderRadius: '8px',
    backgroundColor: colors.white,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  confidenceColor: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    margin: '0 auto 8px auto'
  },
  confidenceLabel: {
    fontSize: '14px',
    fontWeight: '500',
    margin: 0
  },
  styleHint: {
    fontSize: '13px',
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: '8px',
    margin: '8px 0 0 0'
  },
  startButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: colors.blue,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '24px'
  },
  startButtonDisabled: {
    width: '100%',
    padding: '16px',
    backgroundColor: colors.border,
    color: colors.textMuted,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'not-allowed',
    marginTop: '24px'
  },
  screenPlaceholder: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    textAlign: 'center',
    padding: '20px'
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    color: colors.navy,
    fontSize: '2.5rem',
    marginBottom: '16px',
    textAlign: 'center'
  },
  subtitle: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 400,
    color: colors.textLight,
    fontSize: '1.1rem',
    textAlign: 'center'
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'IBM Plex Sans, sans-serif'
  },
  button: {
    backgroundColor: colors.navy,
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    margin: '8px'
  },
  backButton: {
    backgroundColor: 'transparent',
    color: colors.textLight,
    border: `1px solid ${colors.textLight}`,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    margin: '8px'
  },
  exitButton: {
    backgroundColor: colors.terracotta,
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    margin: '8px'
  },
  linkButton: {
    backgroundColor: 'transparent',
    color: colors.navy,
    border: 'none',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontFamily: 'IBM Plex Sans, sans-serif'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    minWidth: '300px'
  },
  // Welcome screen styles
  welcomeScreen: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    gap: '12px'
  },
  logoTitle: {
    fontFamily: 'Playfair Display, serif',
    fontWeight: 700,
    color: colors.blue,
    fontSize: '24px',
    margin: 0
  },
  waveDivider: {
    width: '100%',
    height: '20px',
    marginBottom: '32px'
  },
  heroContent: {
    marginBottom: '40px'
  },
  heroTitle: {
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    color: colors.navy,
    fontSize: '32px',
    margin: '0 0 16px 0',
    lineHeight: 1.2
  },
  heroSubtitle: {
    fontSize: '16px',
    color: colors.textLight,
    lineHeight: 1.5,
    margin: 0
  },
  nameInputSection: {
    marginBottom: '32px'
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: colors.text,
    marginBottom: '8px',
    textAlign: 'left'
  },
  nameInput: {
    width: '100%',
    padding: '16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    marginBottom: '24px'
  },
  primaryButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: colors.blue,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginBottom: '16px'
  },
  primaryButtonDisabled: {
    width: '100%',
    padding: '16px',
    backgroundColor: colors.border,
    color: colors.textMuted,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'not-allowed',
    marginBottom: '16px'
  },
  footerNote: {
    fontSize: '14px',
    color: colors.textMuted,
    fontStyle: 'italic',
    margin: 0
  },
  // Ready screen styles
  readyScreen: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  readyEmoji: {
    fontSize: '64px',
    marginBottom: '24px'
  },
  readyTitle: {
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    color: colors.navy,
    fontSize: '32px',
    margin: '0 0 24px 0'
  },
  readyDuration: {
    fontSize: '18px',
    color: colors.text,
    margin: '0 0 32px 0',
    lineHeight: 1.4
  },
  checklist: {
    textAlign: 'left',
    marginBottom: '32px'
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '16px'
  },
  checklistIcon: {
    color: colors.blue,
    fontWeight: 'bold',
    marginRight: '12px',
    fontSize: '18px'
  },
  beginSprintButton: {
    width: '100%',
    padding: '18px',
    backgroundColor: colors.terracotta,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginBottom: '24px'
  },
  backLink: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textLight,
    fontSize: '14px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  // Break screen styles
  breakScreen: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  breakTitle: {
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    color: colors.navy,
    fontSize: '32px',
    margin: '0 0 16px 0'
  },
  breakSubtitle: {
    fontSize: '16px',
    color: colors.textLight,
    margin: '0 0 40px 0',
    lineHeight: 1.4
  },
  timerContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px'
  },
  milkGlassContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  milkGlassSvg: {
    display: 'block'
  },
  milkGlassTime: {
    fontFamily: 'IBM Plex Mono, monospace',
    fontWeight: 'bold'
  },
  secondaryButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'transparent',
    color: colors.text,
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '12px'
  },
  // Sprint screen styles
  sprintScreen: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    color: colors.text,
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px'
  },
  sprintTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '12px 16px',
    backgroundColor: colors.cream,
    borderRadius: '12px',
    position: 'sticky',
    top: '0',
    zIndex: 10
  },
  sprintProgress: {
    flex: 1,
    height: '8px',
    backgroundColor: colors.border,
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.blue,
    transition: 'width 0.3s ease'
  },
  sprintExitBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textLight,
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'IBM Plex Sans, sans-serif'
  },
  topicTag: {
    backgroundColor: colors.blue,
    color: colors.white,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: '24px'
  },
  questionText: {
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    color: colors.navy,
    fontSize: '24px',
    lineHeight: 1.3,
    margin: '0 0 32px 0',
    textAlign: 'center'
  },
  diagramContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px'
  },
  workArea: {
    backgroundColor: colors.white,
    padding: '24px',
    borderRadius: '12px',
    border: `2px solid ${colors.border}`,
    marginBottom: '24px'
  },
  workPrompt: {
    fontSize: '16px',
    color: colors.text,
    marginBottom: '16px',
    margin: 0
  },
  hintButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.blue,
    fontSize: '14px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginTop: '8px'
  },
  answerInput: {
    width: '100%',
    padding: '16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '18px',
    fontFamily: 'IBM Plex Mono, monospace',
    marginBottom: '16px',
    backgroundColor: colors.cream
  },
  checkButton: {
    backgroundColor: colors.terracotta,
    color: colors.white,
    border: 'none',
    padding: '16px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    alignSelf: 'flex-end'
  },
  hintBox: {
    backgroundColor: '#fff3cd',
    border: `2px solid ${colors.blue}`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px'
  },
  hintHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    fontWeight: '600'
  },
  hintIcon: {
    fontSize: '18px',
    marginRight: '8px'
  },
  hintTitle: {
    fontSize: '16px',
    color: colors.navy
  },
  hintContent: {
    fontSize: '14px',
    lineHeight: 1.4
  },
  // Feedback screen styles
  feedbackScreen: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    color: colors.text,
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px'
  },
  correctFeedback: {
    backgroundColor: '#d4edda',
    border: `2px solid #22c55e`,
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center'
  },
  incorrectFeedback: {
    backgroundColor: '#ffe6e6',
    border: `2px solid #dc3545`,
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center'
  },
  feedbackIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px'
  },
  feedbackTitle: {
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    fontSize: '24px',
    margin: '0 0 16px 0'
  },
  correctAnswer: {
    fontSize: '18px',
    color: colors.text,
    marginBottom: '24px'
  },
  answerComparison: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    textAlign: 'left'
  },
  answerBox: {
    flex: 1,
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: colors.white
  },
  answerLabel: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 8px 0',
    color: colors.textMuted
  },
  userAnswer: {
    fontSize: '16px',
    color: colors.text
  },
  workedSolution: {
    backgroundColor: '#f0f9ff',
    border: `2px solid ${colors.blue}`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px'
  },
  solutionLabel: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 8px 0',
    color: colors.blue
  },
  solutionText: {
    fontSize: '14px',
    color: colors.text
  },
  classificationButtons: {
    display: 'flex',
    gap: '12px'
  },
  slipUpButton: {
    backgroundColor: colors.blue,
    color: colors.white,
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    flex: 1
  },
  needPracticeButton: {
    backgroundColor: '#ffe6e6',
    color: colors.text,
    border: `2px solid ${colors.text}`,
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    flex: 1
  },
  // Sprint review styles
  reviewScreen: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    color: colors.text,
    maxWidth: '500px',
    margin: '0 auto',
    padding: '40px 20px',
    textAlign: 'center'
  },
  reviewTitle: {
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    color: colors.navy,
    fontSize: '32px',
    margin: '0 0 24px 0'
  },
  scallopDivider: {
    width: '100%',
    height: '20px',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' viewBox=\'0 0 100 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z\' fill=\'%23f8f8f8\'/%3E%3C/svg%3E")',
    backgroundSize: 'cover',
    marginBottom: '32px'
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '32px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statNumber: {
    fontFamily: 'Playfair Display, serif',
    fontWeight: 700,
    color: colors.navy,
    fontSize: '34px',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.textMuted
  },
  // Session summary styles
  summaryScreen: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    color: colors.text,
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: colors.white,
    borderRadius: '12px',
    border: '1px solid #ddd'
  },
  summaryBanner: {
    backgroundColor: colors.blue,
    color: colors.white,
    padding: '16px',
    borderRadius: '12px 12px 0 0',
    position: 'relative'
  },
  bannerWave: {
    position: 'absolute',
    bottom: '-10px',
    left: 0,
    right: 0,
    height: '10px',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'10\' viewBox=\'0 0 100 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,0 Q25,10 50,0 T100,0 L100,10 L0,10 Z\' fill=\'white\'/%3E%3C/svg%3E")',
    backgroundSize: 'cover'
  },
  summaryTitle: {
    fontFamily: 'Playfair Display, serif',
    fontWeight: 900,
    color: colors.navy,
    fontSize: '32px',
    letterSpacing: '-1px',
    margin: '0',
    textAlign: 'center'
  },
  thickDivider: {
    height: '10px',
    backgroundColor: colors.navy,
    margin: '16px 0'
  },
  mediumDivider: {
    height: '3px',
    backgroundColor: colors.navy,
    margin: '16px 0'
  },
  thinDivider: {
    height: '1px',
    backgroundColor: colors.navy,
    margin: '8px 0'
  },
  summaryStats: {
    marginBottom: '16px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontWeight: 'bold'
  },
  summaryLabel: {
    fontSize: '14px'
  },
  summaryValue: {
    fontSize: '14px'
  },
  masterySection: {
    marginBottom: '16px'
  },
  masteryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '12px'
  },
  masterySubtopic: {
    color: colors.text
  },
  masteryPercentage: {
    fontWeight: 'bold'
  },
  disclaimer: {
    fontSize: '11px',
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: '16px'
  }
}
