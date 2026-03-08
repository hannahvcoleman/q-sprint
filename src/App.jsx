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

export default function App() {
  const [screen, setScreen] = useState(SCREENS.WELCOME)
  const [studentName, setStudentName] = useState('')
  const [subject, setSubject] = useState('')
  const [confidence, setConfidence] = useState(null)
  const [sprintDuration, setSprintDuration] = useState(15)
  const [questionStyle, setQuestionStyle] = useState('mixed')
  const [showExitModal, setShowExitModal] = useState(false)

  useEffect(() => {
    // Skip WELCOME if studentName is already set (from localStorage later)
    if (studentName) {
      setScreen(SCREENS.SETUP)
    }
  }, [studentName])

  const navigateTo = (targetScreen) => {
    setScreen(targetScreen)
  }

  const switchUser = () => {
    setStudentName('')
    setSubject('')
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
          <div style={styles.screenPlaceholder}>
            <h2>WELCOME</h2>
            <p>Enter your name to continue</p>
            <input 
              type="text" 
              placeholder="Your name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={styles.input}
            />
            <button 
              onClick={() => navigateTo(SCREENS.SETUP)}
              disabled={!studentName.trim()}
              style={styles.button}
            >
              Continue
            </button>
          </div>
        )

      case SCREENS.SETUP:
        return (
          <div style={styles.screenPlaceholder}>
            <h2>SETUP</h2>
            {studentName && (
              <p>Not {studentName}? <button onClick={switchUser} style={styles.linkButton}>Switch user</button></p>
            )}
            <div style={styles.formGroup}>
              <label>Subject:</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} style={styles.input}>
                <option value="">Select subject</option>
                <option value="gcse-higher">GCSE Higher</option>
                <option value="gcse-foundation">GCSE Foundation</option>
                <option value="a-level">A-Level</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Confidence:</label>
              <select value={confidence || ''} onChange={(e) => setConfidence(e.target.value)} style={styles.input}>
                <option value="">Select confidence</option>
                <option value="low">Low</option>
                <option value="mid">Mid</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Sprint Duration (minutes):</label>
              <input 
                type="number" 
                value={sprintDuration}
                onChange={(e) => setSprintDuration(parseInt(e.target.value))}
                min="5"
                max="60"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Question Style:</label>
              <select value={questionStyle} onChange={(e) => setQuestionStyle(e.target.value)} style={styles.input}>
                <option value="quickfire">Quickfire</option>
                <option value="mixed">Mixed</option>
                <option value="exam">Exam</option>
              </select>
            </div>
            <button 
              onClick={() => navigateTo(SCREENS.READY)}
              disabled={!subject || !confidence}
              style={styles.button}
            >
              Continue
            </button>
          </div>
        )

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
    '&::-webkit-scrollbar': {
      display: 'none'
    }
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
    color: '#1e1b4b',
    fontSize: '2.5rem',
    marginBottom: '16px',
    textAlign: 'center'
  },
  subtitle: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 400,
    color: '#6b6580',
    fontSize: '1.1rem',
    textAlign: 'center'
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
    '&:hover': {
      backgroundColor: '#2d2868'
    },
    '&:disabled': {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    }
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
