import * as React from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    "header.insights": "Insights",
    "header.family": "Family",
    "header.coach": "AI Coach",
    "header.signOut": "Sign Out",
    "header.language": "Language",
    "header.theme": "Theme",
    "header.english": "English",
    "header.hindi": "Hindi",
    "header.light": "Light",
    "header.dark": "Dark",
    "header.system": "System",
    
    // Dashboard
    "dashboard.goodMorning": "Good Morning",
    "dashboard.goodAfternoon": "Good Afternoon",
    "dashboard.goodEvening": "Good Evening",
    "dashboard.tagline": "Let's keep your beat strong today.",
    "dashboard.todaysRituals": "Today's Rituals",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.viewTrends": "View Trends",
    "dashboard.familyDashboard": "Family Dashboard",
    "dashboard.aiCopilot": "AI Copilot",
    
    // Rituals
    "ritual.morning": "Morning Ritual",
    "ritual.evening": "Evening Ritual",
    "ritual.morningSubtitle": "With chai ☕",
    "ritual.eveningSubtitle": "After dinner 🍽️",
    "ritual.bloodPressure": "Blood Pressure",
    "ritual.fastingSugar": "Fasting Sugar",
    "ritual.sleepQuality": "Sleep Quality",
    "ritual.medsTaken": "Meds Taken",
    "ritual.randomSugar": "Random Sugar",
    "ritual.stepsCount": "Steps Count",
    "ritual.stressLevel": "Stress Level",
    "ritual.startRitual": "Start Ritual",
    "ritual.completed": "Completed",
    "ritual.eveningComingSoon": "Evening ritual coming soon!",
    
    // HeartScore
    "heartScore.title": "Your HeartScore",
    "heartScore.excellent": "Excellent!",
    "heartScore.good": "Good progress",
    "heartScore.needsWork": "Needs attention",
    "heartScore.aiExplanation": "What moved your score today",
    
    // Checkin
    "checkin.step": "Step",
    "checkin.of": "of",
    "checkin.bloodPressure": "Blood Pressure",
    "checkin.enterMorningBP": "Enter your morning BP reading",
    "checkin.enterEveningBP": "Enter your evening BP reading",
    "checkin.systolic": "Systolic (Top)",
    "checkin.diastolic": "Diastolic (Bottom)",
    "checkin.mmHg": "mmHg",
    "checkin.fastingSugar": "Fasting Sugar",
    "checkin.randomSugar": "Random Sugar",
    "checkin.enterSugar": "Enter your sugar level",
    "checkin.mgdL": "mg/dL",
    "checkin.optional": "Optional",
    "checkin.sleepQuality": "Sleep Quality",
    "checkin.howDidYouSleep": "How did you sleep last night?",
    "checkin.veryPoor": "Very Poor",
    "checkin.poor": "Poor",
    "checkin.fair": "Fair",
    "checkin.good": "Good",
    "checkin.excellent": "Excellent",
    "checkin.medications": "Medications",
    "checkin.didYouTakeMeds": "Did you take your prescribed medications?",
    "checkin.yes": "Yes",
    "checkin.no": "No",
    "checkin.stepsCount": "Steps Count",
    "checkin.enterSteps": "Enter your steps count for today",
    "checkin.steps": "steps",
    "checkin.stressLevel": "Stress Level",
    "checkin.howStressed": "How stressed do you feel?",
    "checkin.low": "Low",
    "checkin.moderate": "Moderate",
    "checkin.high": "High",
    "checkin.veryHigh": "Very High",
    "checkin.next": "Next",
    "checkin.back": "Back",
    "checkin.complete": "Complete Ritual",
    "checkin.completedSuccess": "Ritual completed! 🎉",
    
    // AI Coach
    "coach.title": "Beat Copilot",
    "coach.subtitle": "Your AI health assistant",
    "coach.placeholder": "Ask me anything about your health...",
    "coach.send": "Send",
    "coach.thinking": "Thinking...",
    
    // Common
    "common.loading": "Loading...",
    
    // Family
    "family.title": "Family Dashboard",
    "family.subtitle": "Keep track of your loved ones' health",
    "family.addMember": "Add Family Member",
    "family.noMembers": "No Family Members Yet",
    "family.addFirst": "Add Your First Member",
  },
  hi: {
    // Header
    "header.insights": "जानकारी",
    "header.family": "परिवार",
    "header.coach": "AI सहायक",
    "header.signOut": "साइन आउट",
    "header.language": "भाषा",
    "header.theme": "थीम",
    "header.english": "English",
    "header.hindi": "हिंदी",
    "header.light": "लाइट",
    "header.dark": "डार्क",
    "header.system": "सिस्टम",
    
    // Dashboard
    "dashboard.goodMorning": "सुप्रभात",
    "dashboard.goodAfternoon": "नमस्ते",
    "dashboard.goodEvening": "शुभ संध्या",
    "dashboard.tagline": "आइए आज अपने दिल को मजबूत रखें।",
    "dashboard.todaysRituals": "आज की दिनचर्या",
    "dashboard.quickActions": "त्वरित कार्य",
    "dashboard.viewTrends": "रुझान देखें",
    "dashboard.familyDashboard": "परिवार डैशबोर्ड",
    "dashboard.aiCopilot": "AI सहायक",
    
    // Rituals
    "ritual.morning": "सुबह की दिनचर्या",
    "ritual.evening": "शाम की दिनचर्या",
    "ritual.morningSubtitle": "चाय के साथ ☕",
    "ritual.eveningSubtitle": "रात के खाने के बाद 🍽️",
    "ritual.bloodPressure": "रक्तचाप",
    "ritual.fastingSugar": "खाली पेट शुगर",
    "ritual.sleepQuality": "नींद की गुणवत्ता",
    "ritual.medsTaken": "दवाई ली",
    "ritual.randomSugar": "रैंडम शुगर",
    "ritual.stepsCount": "कदमों की गिनती",
    "ritual.stressLevel": "तनाव का स्तर",
    "ritual.startRitual": "शुरू करें",
    "ritual.completed": "पूरा हुआ",
    "ritual.eveningComingSoon": "शाम की दिनचर्या जल्द आ रही है!",
    
    // HeartScore
    "heartScore.title": "आपका हार्टस्कोर",
    "heartScore.excellent": "बहुत बढ़िया!",
    "heartScore.good": "अच्छी प्रगति",
    "heartScore.needsWork": "ध्यान देने की जरूरत",
    "heartScore.aiExplanation": "आज आपके स्कोर में क्या बदलाव आया",
    
    // Checkin
    "checkin.step": "चरण",
    "checkin.of": "में से",
    "checkin.bloodPressure": "रक्तचाप",
    "checkin.enterMorningBP": "अपनी सुबह की BP रीडिंग दर्ज करें",
    "checkin.enterEveningBP": "अपनी शाम की BP रीडिंग दर्ज करें",
    "checkin.systolic": "सिस्टोलिक (ऊपर)",
    "checkin.diastolic": "डायस्टोलिक (नीचे)",
    "checkin.mmHg": "mmHg",
    "checkin.fastingSugar": "खाली पेट शुगर",
    "checkin.randomSugar": "रैंडम शुगर",
    "checkin.enterSugar": "अपनी शुगर का स्तर दर्ज करें",
    "checkin.mgdL": "mg/dL",
    "checkin.optional": "वैकल्पिक",
    "checkin.sleepQuality": "नींद की गुणवत्ता",
    "checkin.howDidYouSleep": "कल रात आपकी नींद कैसी रही?",
    "checkin.veryPoor": "बहुत खराब",
    "checkin.poor": "खराब",
    "checkin.fair": "ठीक",
    "checkin.good": "अच्छी",
    "checkin.excellent": "बेहतरीन",
    "checkin.medications": "दवाइयां",
    "checkin.didYouTakeMeds": "क्या आपने अपनी दवाइयां ली हैं?",
    "checkin.yes": "हाँ",
    "checkin.no": "नहीं",
    "checkin.stepsCount": "कदमों की गिनती",
    "checkin.enterSteps": "आज के कदमों की संख्या दर्ज करें",
    "checkin.steps": "कदम",
    "checkin.stressLevel": "तनाव का स्तर",
    "checkin.howStressed": "आप कितना तनाव महसूस कर रहे हैं?",
    "checkin.low": "कम",
    "checkin.moderate": "मध्यम",
    "checkin.high": "उच्च",
    "checkin.veryHigh": "बहुत उच्च",
    "checkin.next": "आगे",
    "checkin.back": "पीछे",
    "checkin.complete": "पूरा करें",
    "checkin.completedSuccess": "दिनचर्या पूरी हुई! 🎉",
    
    // AI Coach
    "coach.title": "बीट सहायक",
    "coach.subtitle": "आपका AI स्वास्थ्य सहायक",
    "coach.placeholder": "अपने स्वास्थ्य के बारे में कुछ भी पूछें...",
    "coach.send": "भेजें",
    "coach.thinking": "सोच रहे हैं...",
    
    // Common
    "common.loading": "लोड हो रहा है...",
    
    // Family
    "family.title": "परिवार डैशबोर्ड",
    "family.subtitle": "अपने प्रियजनों के स्वास्थ्य पर नज़र रखें",
    "family.addMember": "परिवार का सदस्य जोड़ें",
    "family.noMembers": "अभी तक कोई परिवार का सदस्य नहीं",
    "family.addFirst": "अपना पहला सदस्य जोड़ें",
  },
};

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = React.useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
