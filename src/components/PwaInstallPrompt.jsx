import { useEffect, useState } from "react";

const STORAGE_KEY = "pantry-pwa-prompt-shown";

function isStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(window.navigator.standalone)
  );
}

function isIOSDevice() {
  if (typeof window === "undefined") return false;

  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const standalone = isStandalone();
    const ios = isIOSDevice();
    const alreadyShown = window.sessionStorage.getItem(STORAGE_KEY) === "true";

    setIsInstalled(standalone);
    setIsIOS(ios);

    if (standalone || alreadyShown) {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsVisible(true);
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (ios) {
      setIsVisible(true);
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    } else {
      const timer = window.setTimeout(() => {
        setIsVisible(true);
        window.sessionStorage.setItem(STORAGE_KEY, "true");
      }, 1200);

      return () => {
        window.clearTimeout(timer);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt,
        );
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setIsVisible(false);
      }

      return;
    }

    if (isIOS) {
      window.open(
        "https://support.apple.com/guide/iphone/add-website-shortcut-iphome-iph42ab2f3a7/ios",
        "_blank",
        "noopener,noreferrer",
      );
    }

    setIsVisible(false);
  }

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-200">
            התקן את האפליקציה
          </p>
          <p className="mt-1 text-xs leading-5 text-emerald-100/85">
            {isIOS
              ? "פתח את האתר ב-Safari, הקש על שיתוף ואז על 'הוסף למסך הבית'"
              : "התקן את Pantry למסך הבית שלך ותוכל להשתמש בו כמו אפליקציה"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-xl bg-emerald-500/80 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            {isIOS ? "הוראות התקנה" : "התקן"}
          </button>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="rounded-xl px-2.5 py-1.5 text-sm text-emerald-100/80 transition hover:bg-white/10"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
