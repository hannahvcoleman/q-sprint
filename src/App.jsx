import { useState, useEffect } from 'react'
import topicsData from './data/topics.json'

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

export default function App() {
  const [screen, setScreen] = useState(SCREENS.WELCOME)
  const [studentName, setStudentName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [returningName, setReturningName] = useState(null)
  const [subject, setSubject] = useState('')
  const [selectedCurriculum, setSelectedCurriculum] = useState('')
  const [confidence, setConfidence] = useState(null)
  const [sprintDuration, setSprintDuration] = useState(15)
  const [questionStyle, setQuestionStyle] = useState('mixed')
  const [showExitModal, setShowExitModal] = useState(false)
  const [breakTimeLeft, setBreakTimeLeft] = useState(180) // 3 minutes in seconds

  useEffect(() => {
    const saved = localStorage.getItem(LS_NAME_KEY)
    if (saved) setReturningName(saved)
  }, [])

  const navigateTo = (targetScreen) => {
    setScreen(targetScreen)
  }

  const confirmName = (name) => {
    localStorage.setItem(LS_NAME_KEY, name)
    setStudentName(name)
    setReturningName(name)
    setScreen(SCREENS.SETUP)
  }

  const switchUser = () => {
    localStorage.removeItem(LS_NAME_KEY)
    setStudentName('')
    setReturningName(null)
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
              onClick={() => navigateTo(SCREENS.SPRINT)} 
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
        return (
          <div style={styles.screenPlaceholder}>
            <h2>SPRINT</h2>
            <p>Sprint in progress...</p>
            <button onClick={() => navigateTo(SCREENS.FEEDBACK)} style={styles.button}>
              Submit Answer
            </button>
            <button onClick={() => setShowExitModal(true)} style={styles.exitButton}>
              Exit Sprint
            </button>
            {showExitModal && (
              <div style={styles.modal}>
                <div style={styles.modalContent}>
                  <h3>Exit Sprint?</h3>
                  <button onClick={saveAndEnd} style={styles.button}>Save & End</button>
                  <button onClick={discardSprint} style={styles.button}>Discard</button>
                  <button onClick={() => setShowExitModal(false)} style={styles.button}>Resume</button>
                </div>
              </div>
            )}
          </div>
        )

      case SCREENS.FEEDBACK:
        return (
          <div style={styles.screenPlaceholder}>
            <h2>FEEDBACK</h2>
            <p>Answer feedback here</p>
            <button onClick={() => navigateTo(SCREENS.SPRINT)} style={styles.button}>
              Next Question
            </button>
            <button onClick={() => navigateTo(SCREENS.SPRINT_REVIEW)} style={styles.button}>
              Timer Ran Out → Review
            </button>
          </div>
        )

      case SCREENS.SPRINT_REVIEW:
        return (
          <div style={styles.screenPlaceholder}>
            <h2>SPRINT_REVIEW</h2>
            <p>Review your sprint results</p>
            <button onClick={() => navigateTo(SCREENS.BREAK)} style={styles.button}>
              Take a Break
            </button>
            <button onClick={() => navigateTo(SCREENS.SESSION_SUMMARY)} style={styles.button}>
              End Session
            </button>
          </div>
        )

      case SCREENS.BREAK:
        const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60)
          const secs = seconds % 60
          return `${mins}:${secs.toString().padStart(2, '0')}`
        }
        
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
        return (
          <div style={styles.screenPlaceholder}>
            <h2>SESSION_SUMMARY</h2>
            <p>Session complete! Here are your results.</p>
            <button onClick={() => {
              // Keep name, reset everything else
              setSubject('')
              setSelectedCurriculum('')
              setConfidence(null)
              setSprintDuration(15)
              setQuestionStyle('mixed')
              setScreen(SCREENS.SETUP)
            }} style={styles.button}>
              Finish → Setup (keep name)
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
  }
}
