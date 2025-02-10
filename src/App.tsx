import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

// URL encodée de manière sécurisée
const ENCODED_URL = 'aHR0cHM6Ly9iaWdmYXJtYS5mcg==';

function App() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [message, setMessage] = useState('');

  // Protection renforcée contre les outils de développement
  useEffect(() => {
    const handleDevTools = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: Event) => e.preventDefault();
    
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = '';
      }
    };
    
    document.addEventListener('keydown', handleDevTools);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', detectDevTools);
    
    return () => {
      document.removeEventListener('keydown', handleDevTools);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', detectDevTools);
    };
  }, []);

  const handleRedirect = (isAdult: boolean) => {
    setIsRedirecting(true);
    let count = 3;
    
    try {
      if (isAdult) {
        setMessage("Super, on prépare ton accès... 🎉");
        // Track l'événement avec GA4
        (window as any).gtag?.('event', 'age_verification', {
          'event_category': 'user_action',
          'event_label': 'adult_confirmed',
          'value': 1
        });
        // Track l'événement avec Facebook Pixel
        (window as any).fbq?.('track', 'AgeVerification', {
          status: 'adult',
          timestamp: Date.now()
        });
      } else {
        setMessage("Ah mince, tu n'as le droit de toucher qu'avec les yeux 👀");
        // Track l'événement avec GA4
        (window as any).gtag?.('event', 'age_verification', {
          'event_category': 'user_action',
          'event_label': 'minor_confirmed',
          'value': 0
        });
        // Track l'événement avec Facebook Pixel
        (window as any).fbq?.('track', 'AgeVerification', {
          status: 'minor',
          timestamp: Date.now()
        });
      }
      
      const timer = setInterval(() => {
        count -= 1;
        setCountdown(count);
        
        if (count === 0) {
          clearInterval(timer);
          
          try {
            // Décodage sécurisé de l'URL
            const targetUrl = atob(ENCODED_URL);
            
            // Nettoyage complet avant redirection
            window.history.replaceState({}, document.title, window.location.pathname);
            sessionStorage.clear();
            localStorage.clear();
            
            // Track la redirection
            (window as any).gtag?.('event', 'redirect_initiated', {
              'event_category': 'navigation',
              'event_label': isAdult ? 'adult_redirect' : 'minor_redirect'
            });
            
            window.location.href = targetUrl;
          } catch (decodeError) {
            console.error('Erreur de décodage:', decodeError);
            setMessage("Oups ! Un petit souci technique. Réessaie dans un instant 🔄");
            setIsRedirecting(false);
          }
        }
      }, 1000);

      return () => clearInterval(timer);
    } catch (error) {
      console.error('Erreur de redirection:', error);
      setMessage("Oups ! Un petit souci technique. Réessaie dans un instant 🔄");
      setIsRedirecting(false);
      
      // Track l'erreur
      (window as any).gtag?.('event', 'exception', {
        'description': 'Redirect error',
        'fatal': false
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#DFF6DD] via-white to-[#DFF6DD]">
      <div 
        className="max-w-sm w-full bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 space-y-8 transform transition-all duration-300 hover:shadow-2xl"
        style={{ willChange: 'transform' }}
      >
        <div className="text-center space-y-4">
          <Bot 
            className="w-12 h-12 mx-auto text-[#4CAF50] animate-[pulse_2s_ease-in-out_infinite]"
            aria-hidden="true"
          />
          <h1 className="text-3xl font-bold text-gray-800 font-poppins">
            Hey ! Tu as quel âge ? 👋
          </h1>
          <p className="text-base text-gray-700">
            Promis, c'est rapide et on t'ouvre les portes en un clic ! 😊
          </p>
          {message && (
            <p 
              className="mt-4 text-lg text-gray-700 animate-[fadeIn_0.3s_ease-in] font-medium"
              role="status"
              aria-live="polite"
            >
              {message}
              {isRedirecting && <span className="ml-2">{countdown}...</span>}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleRedirect(true)}
            disabled={isRedirecting}
            className={`
              w-full px-6 py-4 text-xl font-medium text-white
              rounded-2xl transition-all duration-300 transform
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isRedirecting
                  ? 'bg-green-400 cursor-wait'
                  : 'bg-[#4CAF50] hover:bg-[#388E3C] hover:-translate-y-1 hover:shadow-lg active:translate-y-0'
              }
            `}
            aria-label="Confirmer que vous avez plus de 18 ans"
          >
            Oui, j'ai plus de 18 ans !
          </button>

          <button
            onClick={() => handleRedirect(false)}
            disabled={isRedirecting}
            className={`
              w-full px-6 py-4 text-xl font-medium text-white
              bg-[#BDBDBD] rounded-2xl
              transition-all duration-300 transform
              hover:bg-gray-500 hover:-translate-y-1 hover:shadow-lg
              active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
            `}
            aria-label="Confirmer que vous avez moins de 18 ans"
          >
            Non, j'ai moins de 18 ans
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;