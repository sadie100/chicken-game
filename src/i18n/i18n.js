import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export function initI18n({ ko, en }) {
    const resources = {
        ko: { translation: ko },
        en: { translation: en },
    };

    if (!i18next.isInitialized) {
        i18next.use(LanguageDetector).init({
            resources,
            fallbackLng: "ko",
            detection: {
                order: ["localStorage", "navigator"],
                caches: ["localStorage"],
            },
            interpolation: { escapeValue: false },
        });
    } else {
        // 동적 리소스 갱신(개발 중 HMR 대비)
        Object.entries(resources).forEach(([lng, ns]) => {
            i18next.addResources(lng, "translation", ns.translation);
        });
    }
}

export function t(key, options) {
    return i18next.t(key, options);
}

export function changeLanguage(lang) {
    return i18next.changeLanguage(lang);
}

export function onLanguageChanged(cb) {
    i18next.on("languageChanged", cb);
    return () => i18next.off("languageChanged", cb);
}

export function currentLanguage() {
    return i18next.language || "ko";
}

export default i18next;

