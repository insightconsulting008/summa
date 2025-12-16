import { useState, useEffect } from 'react';

export default function HackerPrank() {
  const [terminalLines, setTerminalLines] = useState([]);
  const [popups, setPopups] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alertIndex, setAlertIndex] = useState(0);

  const hackingMessages = [
    '> Initializing hack sequence...',
    '> Accessing system files... GRANTED',
    '> Bypassing firewall... SUCCESS',
    '> Extracting contacts... 100%',
    '> Accessing photos... COMPLETE',
    '> Reading messages... DONE',
    '> Installing keylogger... ACTIVE',
    '> Your phone is now controlled by JAROMJERY',
    '> All your data belongs to us! 😈'
  ];

  const popupMessages = [
    "⚠️ YOUR PHONE IS HACKED BY JAROMJERY!",
    "🔥 ALL YOUR DATA IS BEING STOLEN!",
    "💀 SYSTEM COMPROMISED!",
    "⚡ VIRUS DETECTED!",
    "🚨 SECURITY BREACH!",
    "👾 JAROMJERY IS WATCHING YOU!",
    "📱 ACCESSING YOUR CAMERA!",
    "🎤 MICROPHONE ACTIVATED!",
    "💳 STEALING CREDIT CARDS!"
  ];

  const alerts = [
    "🚨 ALERT: Your phone has been hacked by JAROMJERY! 😱",
    "💀 All your photos are being uploaded...",
    "📱 Your contacts are being stolen...",
    "🔐 Your passwords have been compromised...",
    "😂 Just kidding! This is a PRANK! 🎉",
    "🎭 You've been pranked by your friend Jaromjery! 😄"
  ];

  // Display terminal lines one by one
  useEffect(() => {
    hackingMessages.forEach((msg, index) => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, msg]);
      }, index * 500);
    });
  }, []);

  // Create popups
  useEffect(() => {
    const popupInterval = setInterval(() => {
      createPopup();
    }, 2000);

    // Start showing alerts after 5 seconds
    setTimeout(() => {
      setShowAlerts(true);
    }, 5000);

    return () => clearInterval(popupInterval);
  }, []);

  // Show alerts one by one
  useEffect(() => {
    if (showAlerts && alertIndex < alerts.length) {
      alert(alerts[alertIndex]);
      setAlertIndex(alertIndex + 1);
    }
  }, [showAlerts, alertIndex]);

  const createPopup = () => {
    const message = popupMessages[Math.floor(Math.random() * popupMessages.length)];
    const id = Date.now() + Math.random();
    const top = Math.random() * 60 + 10; // 10-70%
    const left = Math.random() * 60 + 10; // 10-70%
    
    setPopups(prev => [...prev, { id, message, top, left }]);
  };

  const closePopup = (id) => {
    setPopups(prev => prev.filter(p => p.id !== id));
    // Create more popups when one is closed!
    const count = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < count; i++) {
      setTimeout(createPopup, i * 200);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono overflow-hidden relative">
      {/* Matrix Background Effect */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="matrix-rain">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="matrix-column"
              style={{
                left: `${i * 2}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            >
              {Array.from({ length: 20 }).map((_, j) => (
                <div key={j} className="text-xs">
                  {String.fromCharCode(Math.random() * 128)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Screen */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Skull Icon */}
        <div className="text-8xl animate-pulse mb-8">
          💀
        </div>

        {/* Glitch Title */}
        <h1 className="text-6xl font-bold text-red-500 mb-8 animate-glitch">
          SYSTEM HACKED
        </h1>

        {/* Terminal */}
        <div className="w-full max-w-3xl bg-black bg-opacity-90 border-4 border-green-500 p-6 shadow-2xl shadow-green-500/50">
          <div className="space-y-2">
            {terminalLines.map((line, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {line.includes('JAROMJERY') ? (
                  <span className="text-yellow-400 font-bold">{line}</span>
                ) : line.includes('GRANTED') || 
                   line.includes('SUCCESS') || 
                   line.includes('COMPLETE') || 
                   line.includes('DONE') || 
                   line.includes('ACTIVE') ||
                   line.includes('100%') ? (
                  <span>
                    {line.split(' ').slice(0, -1).join(' ')} 
                    <span className="text-red-500 font-bold ml-2">
                      {line.split(' ').slice(-1)}
                    </span>
                  </span>
                ) : (
                  line
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Warning Text */}
        <div className="mt-8 text-center text-red-500 text-xl font-bold animate-pulse">
          ⚠️ DO NOT CLOSE THIS WINDOW ⚠️
        </div>
      </div>

      {/* Popups */}
      {popups.map((popup) => (
        <div
          key={popup.id}
          className="fixed bg-red-600 text-white p-8 border-4 border-white shadow-2xl shadow-red-600/50 animate-shake z-50"
          style={{
            top: `${popup.top}%`,
            left: `${popup.left}%`,
            minWidth: '300px'
          }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            {popup.message}
          </h2>
          <p className="mb-4 text-center">
            Click OK to fix... (Just kidding! 😂)
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => closePopup(popup.id)}
              className="bg-white text-red-600 px-6 py-2 font-bold hover:bg-red-500 hover:text-white transition"
            >
              OK
            </button>
            <button
              onClick={() => closePopup(popup.id)}
              className="bg-white text-red-600 px-6 py-2 font-bold hover:bg-red-500 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={() => closePopup(popup.id)}
              className="bg-white text-red-600 px-6 py-2 font-bold hover:bg-red-500 hover:text-white transition"
            >
              Help!
            </button>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-4px, 4px); }
          40% { transform: translate(-4px, -4px); }
          60% { transform: translate(4px, 4px); }
          80% { transform: translate(4px, -4px); }
          100% { transform: translate(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-5px, 5px) rotate(-2deg); }
          50% { transform: translate(5px, -5px) rotate(2deg); }
          75% { transform: translate(-5px, -5px) rotate(-1deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes matrix-fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .animate-glitch {
          animation: glitch 1s infinite;
        }

        .animate-shake {
          animation: shake 0.5s infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s forwards;
          opacity: 0;
        }

        .matrix-column {
          position: absolute;
          animation: matrix-fall linear infinite;
        }
      `}</style>
    </div>
  );
}