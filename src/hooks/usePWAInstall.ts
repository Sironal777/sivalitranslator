import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPromptOnLoad, setShowPromptOnLoad] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed on phone or desktop)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // If user hasn't installed yet, trigger on-entry modal notice
      if (!isStandalone) {
        setShowPromptOnLoad(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowPromptOnLoad(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS or first time visitors, show prompt shortly after entry if not installed
    const timer = setTimeout(() => {
      if (!isStandalone) {
        // Show install suggestion
        const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
        if (!dismissed) {
          setShowPromptOnLoad(true);
        }
      }
    }, 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          setShowPromptOnLoad(false);
          return true;
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
    }
    return false;
  };

  const dismissPrompt = () => {
    setShowPromptOnLoad(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    showPromptOnLoad,
    install,
    dismissPrompt,
    openInstallModal: () => setShowPromptOnLoad(true),
  };
}
