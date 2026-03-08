import { useState, useEffect } from 'react'

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
            <div style={styles.welcomeHero}>
              <div style={styles.logoMark}>Q</div>
              <h1 style={styles.logoTitle}>Q-Sprint</h1>
              <p style={styles.tagline}>Sharp questions. Sharper mathematicians.</p>
            </div>

            <div style={styles.welcomeCard}>
              {returningName ? (
                <>
                  <p style={styles.welcomeBack}>Welcome back,</p>
                  <p style={styles.returningName}>{returningName} 👋</p>
                  <button
                    onClick={() => confirmName(returningName)}
                    style={styles.primaryButton}
                  >
                    Continue →
                  </button>
                  <button onClick={switchUser} style={styles.ghostButton}>
                    Not {returningName}?
                  </button>
                </>
              ) : (
                <>
                  <label style={styles.nameLabel}>What's your name?</label>
                  <input
                    type="text"
                    placeholder="e.g. Amara"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && nameInput.trim() && confirmName(nameInput.trim())}
                    style={styles.nameInput}
                    autoFocus
                  />
                  <button
                    onClick={() => confirmName(nameInput.trim())}
                    disabled={!nameInput.trim()}
                    style={nameInput.trim() ? styles.primaryButton : styles.primaryButtonDisabled}
                  >
                    Let's go →
                  </button>
                </>
              )}
            </div>

            <p style={styles.welcomeFooter}>GCSE & A-Level Maths</p>
          </div>
        )

      case SCREENS.SETUP: {
        const curricula = [
          { value: 'gcse', label: 'GCSE', sub: 'Foundation or Higher tier' },
          { value: 'a-level', label: 'A-Level', sub: 'Maths or Further Maths' },
          { value: 'ib', label: 'IB', sub: 'SL or HL content' },
        ]
        
        const subjectLevels = {
          gcse: [
            { value: 'gcse-foundation', label: 'Foundation' },
            { value: 'gcse-higher', label: 'Higher' },
          ],
          'a-level': [
            { value: 'a-level-maths', label: 'Maths' },
            { value: 'a-level-further', label: 'Further Maths' },
          ],
          ib: [
            { value: 'ib-sl', label: 'SL' },
            { value: 'ib-hl', label: 'HL' },
          ],
        }
        const confidenceLevels = [
          { value: 'low',  label: 'Low' },
          { value: 'mid',  label: 'Mid' },
          { value: 'high', label: 'High' },
        ]
        const durations = [10, 15, 20, 25, 30]
        const questionStyles = [
          { value: 'quickfire', label: 'Quickfire', desc: 'Rapid-fire questions to build speed and recall.' },
          { value: 'mixed',     label: 'Mixed',     desc: 'A blend of quick and longer problems. Balanced practice.' },
          { value: 'exam',      label: 'Exam',      desc: 'Exam-style questions modelled on mark schemes.' },
        ]
        const canContinue = subject && confidence

        return (
          <div style={styles.setupScreen}>
            <div style={styles.setupHeader}>
              <h2 style={styles.setupTitle}>Set up your sprint</h2>
              <button onClick={switchUser} style={styles.switchUserBtn}>
                {studentName} · switch
              </button>
            </div>

            <div style={styles.setupSection}>
              <p style={styles.sectionLabel}>Subject</p>
              
              {!selectedCurriculum ? (
                <div style={styles.subjectCards}>
                  {curricula.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setSelectedCurriculum(c.value)}
                      style={styles.subjectCard}
                    >
                      <span style={styles.subjectCardLabel}>{c.label}</span>
                      <span style={styles.subjectCardSub}>{c.sub}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <button 
                    onClick={() => {
                      setSelectedCurriculum('')
                      setSubject('')
                    }}
                    style={styles.backButton}
                  >
                    ← Back to curricula
                  </button>
                  <div style={styles.subjectCards}>
                    {subjectLevels[selectedCurriculum].map(level => (
                      <button
                        key={level.value}
                        onClick={() => setSubject(level.value)}
                        style={subject === level.value ? styles.subjectCardSelected : styles.subjectCard}
                      >
                        <span style={styles.subjectCardLabel}>{level.label}</span>
                        <span style={styles.subjectCardSub}>
                          {curricula.find(c => c.value === selectedCurriculum)?.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.setupSection}>
              <p style={styles.sectionLabel}>How confident are you feeling?</p>
              <div style={styles.confidenceRow}>
                {confidenceLevels.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setConfidence(c.value)}
                    style={confidence === c.value ? styles.confidenceBtnSelected : styles.confidenceBtn}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.setupSection}>
              <p style={styles.sectionLabel}>Sprint duration</p>
              <div style={styles.chipRow}>
                {durations.map(d => (
                  <button
                    key={d}
                    onClick={() => setSprintDuration(d)}
                    style={sprintDuration === d ? styles.chipSelected : styles.chip}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.setupSection}>
              <p style={styles.sectionLabel}>Question style</p>
              <div style={styles.styleCards}>
                {questionStyles.map(qs => (
                  <button
                    key={qs.value}
                    onClick={() => setQuestionStyle(qs.value)}
                    style={questionStyle === qs.value ? styles.styleCardSelected : styles.styleCard}
                  >
                    <span style={styles.styleCardLabel}>{qs.label}</span>
                    <span style={styles.styleCardDesc}>{qs.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigateTo(SCREENS.READY)}
              disabled={!canContinue}
              style={canContinue ? styles.primaryButton : styles.primaryButtonDisabled}
            >
              Continue →
            </button>
          </div>
        )
      }

      case SCREENS.READY:
        return (
          <div style={styles.screenPlaceholder}>
            <h2>READY</h2>
            <p>Ready to start your sprint, {studentName}?</p>
            <button onClick={() => navigateTo(SCREENS.SPRINT)} style={styles.button}>
              Begin Sprint
            </button>
            <button onClick={() => navigateTo(SCREENS.SETUP)} style={styles.backButton}>
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
        return (
          <div style={styles.screenPlaceholder}>
            <h2>BREAK</h2>
            <p>Time for a break!</p>
            <button onClick={() => navigateTo(SCREENS.READY)} style={styles.button}>
              Start Next Sprint
            </button>
            <button onClick={() => navigateTo(SCREENS.SESSION_SUMMARY)} style={styles.button}>
              End Session
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
    gap: '3px',
    padding: '14px 16px',
    backgroundColor: '#f5f0e8',
    border: '2px solid transparent',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  styleCardSelected: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '3px',
    padding: '14px 16px',
    backgroundColor: '#eeeaf8',
    border: '2px solid #1e1b4b',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  styleCardLabel: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#1e1b4b',
  },
  styleCardDesc: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 400,
    fontSize: '0.8rem',
    color: '#6b6580',
    lineHeight: 1.4,
  },

  // Shared / other screens
  screenPlaceholder: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    textAlign: 'center',
    padding: '20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'IBM Plex Sans, sans-serif'
  },
  button: {
    backgroundColor: '#1e1b4b',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    margin: '8px',
  },
  backButton: {
    backgroundColor: 'transparent',
    color: '#6b6580',
    border: '1px solid #6b6580',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    margin: '8px'
  },
  exitButton: {
    backgroundColor: '#dc3545',
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
    color: '#1e1b4b',
    border: 'none',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontFamily: 'IBM Plex Sans, sans-serif'
  },
  formGroup: {
    margin: '16px 0',
    textAlign: 'left'
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
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    minWidth: '300px'
  }
}
