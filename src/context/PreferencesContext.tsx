'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'light' | 'dark' | 'sepia' | 'midnight' | 'maximalism' | 'liquid-glass' | 'claymorphism' | 'synthwave' | 'cyberpunk';
export type AppFont = 'inter' | 'serif' | 'mono' | 'lexend' | 'playfair';
export type AppLanguage = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh' | 'ja';

interface PreferencesContextType {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  font: AppFont;
  setFont: (f: AppFont) => void;
  language: AppLanguage;
  setLanguage: (l: AppLanguage) => void;
  t: (key: string) => string;
}

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    appTitle: "Research Factory",
    subtitle: "Autonomous 5-Agent Intelligence Platform",
    launch: "Launch Research",
    abort: "Abort",
    overview: "Overview",
    planner: "Planner",
    scout: "Scout",
    reader: "Reader",
    critic: "Critic",
    whitepaper: "Whitepaper",
    messageLogs: "Message Bus Logs",
    archive: "Archive",
    vault: "BYOD Vault",
    presets: "Presets",
    config: "Config",
    theme: "Theme",
    font: "Font Style",
    language: "Language",
    inputPlaceholder: "Enter complex research topic, thesis, or technical domain...",
    quick: "Quick (4 Sources)",
    standard: "Standard (10 Sources)",
    deep: "Deep (18 Sources)",
    redTeam: "Red Team",
    systemReady: "System Ready • 5 Agents Idle",
    running: "Running",
  },
  es: {
    appTitle: "Fábrica de Investigación",
    subtitle: "Plataforma de Inteligencia con 5 Agentes Autónomos",
    launch: "Iniciar Investigación",
    abort: "Abortar",
    overview: "Visión General",
    planner: "Planificador",
    scout: "Explorador",
    reader: "Lector",
    critic: "Crítico",
    whitepaper: "Informe Técnico",
    messageLogs: "Registros de Mensajes",
    archive: "Archivo",
    vault: "Bóveda BYOD",
    presets: "Ajustes",
    config: "Configuración",
    theme: "Tema",
    font: "Fuente",
    language: "Idioma",
    inputPlaceholder: "Ingrese tema de investigación o dominio técnico...",
    quick: "Rápido (4 Fuentes)",
    standard: "Estándar (10 Fuentes)",
    deep: "Profundo (18 Fuentes)",
    redTeam: "Equipo Rojo",
    systemReady: "Sistema Listo • 5 Agentes en Espera",
    running: "Ejecutando",
  },
  fr: {
    appTitle: "Usine de Recherche",
    subtitle: "Plateforme Autonome d'Intelligence à 5 Agents",
    launch: "Lancer la Recherche",
    abort: "Interrompre",
    overview: "Vue d'ensemble",
    planner: "Planificateur",
    scout: "Éclaireur",
    reader: "Lecteur",
    critic: "Critique",
    whitepaper: "Livre Blanc",
    messageLogs: "Journal des Messages",
    archive: "Archives",
    vault: "Coffre BYOD",
    presets: "Préréglages",
    config: "Configuration",
    theme: "Thème",
    font: "Police",
    language: "Langue",
    inputPlaceholder: "Entrez un sujet de recherche, une thèse ou un domaine...",
    quick: "Rapide (4 Sources)",
    standard: "Standard (10 Sources)",
    deep: "Approfondi (18 Sources)",
    redTeam: "Équipe Rouge",
    systemReady: "Système Prêt • 5 Agents en Attente",
    running: "En cours",
  },
  de: {
    appTitle: "Forschungs-Fabrik",
    subtitle: "Autonome 5-Agenten-Intelligenzplattform",
    launch: "Recherche Starten",
    abort: "Abbrechen",
    overview: "Übersicht",
    planner: "Planer",
    scout: "Scout",
    reader: "Leser",
    critic: "Kritiker",
    whitepaper: "Whitepaper",
    messageLogs: "Nachrichtenprotokolle",
    archive: "Archiv",
    vault: "BYOD-Tresor",
    presets: "Vorlagen",
    config: "Konfiguration",
    theme: "Design",
    font: "Schriftart",
    language: "Sprache",
    inputPlaceholder: "Komplexes Forschungsthema oder Domäne eingeben...",
    quick: "Schnell (4 Quellen)",
    standard: "Standard (10 Quellen)",
    deep: "Tiefgehend (18 Quellen)",
    redTeam: "Red Team",
    systemReady: "System Bereit • 5 Agenten im Leerlauf",
    running: "Läuft",
  },
  hi: {
    appTitle: "रिसर्च फ़ैक्टरी",
    subtitle: "स्वायत्त 5-एजेंट इंटेलिजेंस प्लेटफ़ॉर्म",
    launch: "अनुसंधान शुरू करें",
    abort: "रोकें",
    overview: "अवलोकन",
    planner: "योजनाकार",
    scout: "खोजक",
    reader: "पाठक",
    critic: "समीक्षक",
    whitepaper: "श्वेतपत्र",
    messageLogs: "संदेश लॉग",
    archive: "संग्रह",
    vault: "दस्तावेज़ वॉल्ट",
    presets: "प्रीसेट",
    config: "सेटिंग्स",
    theme: "थीम",
    font: "फ़ॉन्ट शैली",
    language: "भाषा",
    inputPlaceholder: "अनुसंधान विषय, थीसिस या तकनीकी क्षेत्र दर्ज करें...",
    quick: "त्वरित (4 स्रोत)",
    standard: "मानक (10 स्रोत)",
    deep: "गहन (18 स्रोत)",
    redTeam: "रेड टीम",
    systemReady: "सिस्टम तैयार • 5 एजेंट निष्क्रिय",
    running: "सक्रिय",
  },
  zh: {
    appTitle: "多智能体研究工坊",
    subtitle: "自主 5 智能体协作智能平台",
    launch: "启动全网研报",
    abort: "终止",
    overview: "全景概览",
    planner: "规划师",
    scout: "侦查员",
    reader: "精读员",
    critic: "审计师",
    whitepaper: "深度白皮书",
    messageLogs: "通信总线日志",
    archive: "研报归档",
    vault: "本地知识库",
    presets: "预置场景",
    config: "系统偏好",
    theme: "界面主题",
    font: "排版字体",
    language: "系统语言",
    inputPlaceholder: "输入前沿课题、商业命题或技术方向...",
    quick: "快速洞察 (4个信源)",
    standard: "标准调研 (10个信源)",
    deep: "深度论证 (18个信源)",
    redTeam: "红蓝对抗",
    systemReady: "系统就绪 • 5位智能体待命",
    running: "研报生产中",
  },
  ja: {
    appTitle: "マルチエージェント研究ファクトリー",
    subtitle: "自律型5エージェント知能プラットフォーム",
    launch: "リサーチ開始",
    abort: "中止",
    overview: "全体概要",
    planner: "プランナー",
    scout: "スカウト",
    reader: "リーダー",
    critic: "批評・監査",
    whitepaper: "レポート",
    messageLogs: "バスログ",
    archive: "アーカイブ",
    vault: "資料保管庫",
    presets: "プリセット",
    config: "設定",
    theme: "テーマ",
    font: "フォント",
    language: "言語",
    inputPlaceholder: "研究テーマ、仮説、技術領域を入力...",
    quick: "クイック (4件)",
    standard: "スタンダード (10件)",
    deep: "ディープ (18件)",
    redTeam: "レッドチーム",
    systemReady: "システム待機中 • 5エージェント",
    running: "実行中",
  },
};

const PreferencesContext = createContext<PreferencesContextType>({
  theme: 'light',
  setTheme: () => {},
  font: 'inter',
  setFont: () => {},
  language: 'en',
  setLanguage: () => {},
  t: (k: string) => k,
});

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>('liquid-glass');
  const [font, setFontState] = useState<AppFont>('inter');
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    const savedTheme = localStorage.getItem('rf_theme') as AppTheme;
    const savedFont = localStorage.getItem('rf_font') as AppFont;
    const savedLang = localStorage.getItem('rf_lang') as AppLanguage;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (savedTheme === 'dark' || savedTheme === 'midnight' || savedTheme === 'liquid-glass' || savedTheme === 'maximalism' || savedTheme === 'synthwave' || savedTheme === 'cyberpunk') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setThemeState('liquid-glass');
      localStorage.setItem('rf_theme', 'liquid-glass');
      document.documentElement.setAttribute('data-theme', 'liquid-glass');
      document.documentElement.classList.add('dark');
    }
    if (savedFont) setFontState(savedFont);
    if (savedLang) setLanguageState(savedLang);
  }, []);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem('rf_theme', t);
    document.documentElement.setAttribute('data-theme', t);
    if (t === 'dark' || t === 'midnight' || t === 'liquid-glass' || t === 'maximalism' || t === 'synthwave' || t === 'cyberpunk') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setFont = (f: AppFont) => {
    setFontState(f);
    localStorage.setItem('rf_font', f);
    document.documentElement.setAttribute('data-font', f);
  };

  const setLanguage = (l: AppLanguage) => {
    setLanguageState(l);
    localStorage.setItem('rf_lang', l);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font', font);
    if (theme === 'dark' || theme === 'midnight' || theme === 'liquid-glass' || theme === 'maximalism' || theme === 'synthwave' || theme === 'cyberpunk') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, font]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <PreferencesContext.Provider value={{ theme, setTheme, font, setFont, language, setLanguage, t }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
