export default function App() {
  return (
    <div style={styles.outerShell}>
      <div className="frame" style={styles.innerFrame}>
        <h1 style={styles.title}>Q-Sprint</h1>
        <p style={styles.subtitle}>App shell working</p>
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
  }
}
