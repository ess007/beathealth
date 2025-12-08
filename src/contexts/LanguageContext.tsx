import * as React from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // App
    "app.title": "Beat",
    "app.tagline": "Keep Your Beat Strong",
    
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
    
    // Accessibility
    "accessibility.textSize": "Text Size",
    "accessibility.normal": "Normal",
    "accessibility.large": "Large",
    
    // Dashboard
    "dashboard.goodMorning": "Good Morning",
    "dashboard.goodAfternoon": "Good Afternoon",
    "dashboard.goodEvening": "Good Evening",
    "dashboard.tagline": "Let's keep your beat strong today.",
    "dashboard.todaysRituals": "Today's Rituals",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.viewTrends": "View Trends",
    "dashboard.familyDashboard": "Family Dashboard",
    "dashboard.aiCopilot": "Beat AI",
    "dashboard.daysStrong": "Days Strong",
    "dashboard.quickAccess": "Quick Access",
    "dashboard.achievements": "Achievements",
    "dashboard.medications": "Medications",
    "dashboard.shop": "Shop",
    "dashboard.challenges": "Challenges",
    "dashboard.premium": "Premium",
    
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
    "checkin.completedSuccess": "Ritual completed!",
    
    // AI Coach
    "coach.title": "Beat AI",
    "coach.subtitle": "Your medical-grade AI health coach",
    "coach.placeholder": "Ask me anything about your health...",
    "coach.send": "Send",
    "coach.thinking": "Thinking...",
    "coach.newChat": "New Chat",
    "coach.disclaimer": "This is AI guidance, not medical diagnosis. Consult a doctor for serious symptoms.",
    "coach.hello": "Hello! I'm Beat",
    "coach.askAnything": "Ask me anything about your health. I'm here to help.",
    
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.success": "Success!",
    "common.error": "Something went wrong",
    
    // Family
    "family.title": "Family Dashboard",
    "family.subtitle": "Keep track of your loved ones' health",
    "family.addMember": "Add Family Member",
    "family.noMembers": "No Family Members Yet",
    "family.addFirst": "Add Your First Member",
    "family.relationship": "Relationship",
    "family.permissions": "Permissions",
    "family.canView": "Can View Health Data",
    "family.canNudge": "Can Send Nudges",
    
    // Onboarding
    "onboarding.welcome": "Welcome to Beat!",
    "onboarding.subtitle": "Keep Your Beat Strong",
    "onboarding.language": "Choose your language",
    "onboarding.continue": "Continue",
    "onboarding.basicInfo": "Basic Information",
    "onboarding.basicInfoDesc": "Tell us about yourself",
    "onboarding.fullName": "Full Name",
    "onboarding.namePlaceholder": "Enter your name",
    "onboarding.dateOfBirth": "Date of Birth",
    "onboarding.gender": "Gender",
    "onboarding.genderPlaceholder": "Select gender",
    "onboarding.male": "Male",
    "onboarding.female": "Female",
    "onboarding.other": "Other",
    "onboarding.height": "Height (cm)",
    "onboarding.weight": "Weight (kg)",
    "onboarding.healthGoals": "Health Goals",
    "onboarding.healthGoalsDesc": "What would you like to track?",
    "onboarding.hasHypertension": "I have high blood pressure",
    "onboarding.hasDiabetes": "I have diabetes",
    "onboarding.hasHeartDisease": "I have heart disease",
    "onboarding.ritualTimes": "Daily Check-in Times",
    "onboarding.ritualTimesDesc": "When should we remind you?",
    "onboarding.morningTime": "Morning Check-in",
    "onboarding.eveningTime": "Evening Check-in",
    "onboarding.finish": "Get Started",
    "onboarding.success": "Welcome to Beat!",
    "onboarding.error": "Failed to complete onboarding",
    
    // Insights
    "insights.title": "Health Insights",
    "insights.subtitle": "Track your health trends and patterns",
    "insights.pdfReport": "PDF Report",
    "insights.avgBP": "Avg BP",
    "insights.avgSugar": "Avg Sugar",
    "insights.heartScore": "HeartScore",
    "insights.avgSteps": "Avg Steps",
    "insights.aiInsights": "AI Health Insights",
    "insights.personalized": "Personalized analysis based on your health data",
    "insights.heartScoreTrend": "HeartScore Trend (30 Days)",
    "insights.bpTrend": "Blood Pressure Trend (30 Days)",
    "insights.sugarTrend": "Blood Sugar Trend (30 Days)",
    
    // Challenges
    "challenges.title": "Health Challenges",
    "challenges.subtitle": "Build healthy habits together with the community",
    "challenges.featured": "Featured Challenges",
    "challenges.myChallenges": "My Challenges",
    "challenges.allChallenges": "All Challenges",
    "challenges.join": "Join",
    "challenges.leave": "Leave",
    "challenges.joined": "Joined",
    "challenges.daysLeft": "days left",
    "challenges.participants": "participants",
    
    // Shop
    "shop.title": "Health Store",
    "shop.subtitle": "Recommended products for your health journey",
    "shop.featured": "Featured Products",
    "shop.viewProduct": "View Product",
    
    // Subscription
    "subscription.title": "Beat Premium",
    "subscription.subtitle": "Unlock your full health potential",
    "subscription.free": "Free",
    "subscription.basic": "Basic",
    "subscription.premium": "Premium",
    "subscription.currentPlan": "Current Plan",
    "subscription.upgrade": "Upgrade",
    "subscription.perMonth": "/month",
    
    // Profile
    "profile.title": "Profile",
    "profile.settings": "Settings",
    "profile.notifications": "Notifications",
    "profile.connectDevices": "Connect Devices",
    "profile.exportData": "Export My Data",
    "profile.deleteAccount": "Delete Account",
    "profile.signOut": "Sign Out"
  },
  hi: {
    // App
    "app.title": "बीट",
    "app.tagline": "अपना बीट मजबूत रखें",
    
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
    
    // Accessibility
    "accessibility.textSize": "टेक्स्ट साइज़",
    "accessibility.normal": "सामान्य",
    "accessibility.large": "बड़ा",
    
    // Dashboard
    "dashboard.goodMorning": "सुप्रभात",
    "dashboard.goodAfternoon": "नमस्ते",
    "dashboard.goodEvening": "शुभ संध्या",
    "dashboard.tagline": "आइए आज अपने दिल को मजबूत रखें।",
    "dashboard.todaysRituals": "आज की दिनचर्या",
    "dashboard.quickActions": "त्वरित कार्य",
    "dashboard.viewTrends": "रुझान देखें",
    "dashboard.familyDashboard": "परिवार डैशबोर्ड",
    "dashboard.aiCopilot": "बीट AI",
    "dashboard.daysStrong": "दिन मजबूत",
    "dashboard.quickAccess": "त्वरित पहुंच",
    "dashboard.achievements": "उपलब्धियां",
    "dashboard.medications": "दवाइयां",
    "dashboard.shop": "शॉप",
    "dashboard.challenges": "चुनौतियां",
    "dashboard.premium": "प्रीमियम",
    
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
    "checkin.completedSuccess": "दिनचर्या पूरी हुई!",
    
    // AI Coach
    "coach.title": "बीट AI",
    "coach.subtitle": "आपका व्यक्तिगत स्वास्थ्य सलाहकार",
    "coach.placeholder": "अपने स्वास्थ्य के बारे में कुछ भी पूछें...",
    "coach.send": "भेजें",
    "coach.thinking": "सोच रहे हैं...",
    "coach.newChat": "नई चैट",
    "coach.disclaimer": "यह AI सलाह है, चिकित्सा निदान नहीं। गंभीर लक्षणों के लिए डॉक्टर से मिलें।",
    "coach.hello": "नमस्ते! मैं बीट हूं",
    "coach.askAnything": "अपने स्वास्थ्य के बारे में कोई भी सवाल पूछें।",
    
    // Common
    "common.loading": "लोड हो रहा है...",
    "common.save": "सेव करें",
    "common.cancel": "रद्द करें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.close": "बंद करें",
    "common.success": "सफलता!",
    "common.error": "कुछ गलत हो गया",
    
    // Family
    "family.title": "परिवार डैशबोर्ड",
    "family.subtitle": "अपने प्रियजनों के स्वास्थ्य पर नज़र रखें",
    "family.addMember": "परिवार का सदस्य जोड़ें",
    "family.noMembers": "अभी तक कोई परिवार का सदस्य नहीं",
    "family.addFirst": "अपना पहला सदस्य जोड़ें",
    "family.relationship": "रिश्ता",
    "family.permissions": "अनुमतियां",
    "family.canView": "स्वास्थ्य डेटा देख सकते हैं",
    "family.canNudge": "नज़ भेज सकते हैं",
    
    // Onboarding
    "onboarding.welcome": "बीट में आपका स्वागत है!",
    "onboarding.subtitle": "अपना बीट मजबूत रखें",
    "onboarding.language": "अपनी भाषा चुनें",
    "onboarding.continue": "जारी रखें",
    "onboarding.basicInfo": "बुनियादी जानकारी",
    "onboarding.basicInfoDesc": "हमें अपने बारे में बताएं",
    "onboarding.fullName": "पूरा नाम",
    "onboarding.namePlaceholder": "अपना नाम दर्ज करें",
    "onboarding.dateOfBirth": "जन्म तिथि",
    "onboarding.gender": "लिंग",
    "onboarding.genderPlaceholder": "लिंग चुनें",
    "onboarding.male": "पुरुष",
    "onboarding.female": "महिला",
    "onboarding.other": "अन्य",
    "onboarding.height": "ऊंचाई (सेमी)",
    "onboarding.weight": "वजन (किग्रा)",
    "onboarding.healthGoals": "स्वास्थ्य लक्ष्य",
    "onboarding.healthGoalsDesc": "आप क्या ट्रैक करना चाहेंगे?",
    "onboarding.hasHypertension": "मुझे उच्च रक्तचाप है",
    "onboarding.hasDiabetes": "मुझे मधुमेह है",
    "onboarding.hasHeartDisease": "मुझे हृदय रोग है",
    "onboarding.ritualTimes": "दैनिक चेक-इन समय",
    "onboarding.ritualTimesDesc": "हमें आपको कब याद दिलाना चाहिए?",
    "onboarding.morningTime": "सुबह की चेक-इन",
    "onboarding.eveningTime": "शाम की चेक-इन",
    "onboarding.finish": "शुरू करें",
    "onboarding.success": "बीट में आपका स्वागत है!",
    "onboarding.error": "ऑनबोर्डिंग पूरी करने में विफल",
    
    // Insights
    "insights.title": "स्वास्थ्य इनसाइट्स",
    "insights.subtitle": "अपने स्वास्थ्य रुझान देखें",
    "insights.pdfReport": "PDF रिपोर्ट",
    "insights.avgBP": "औसत BP",
    "insights.avgSugar": "औसत शुगर",
    "insights.heartScore": "हार्टस्कोर",
    "insights.avgSteps": "औसत कदम",
    "insights.aiInsights": "AI स्वास्थ्य इनसाइट्स",
    "insights.personalized": "आपके स्वास्थ्य डेटा पर आधारित व्यक्तिगत विश्लेषण",
    "insights.heartScoreTrend": "हार्टस्कोर ट्रेंड (30 दिन)",
    "insights.bpTrend": "रक्तचाप ट्रेंड (30 दिन)",
    "insights.sugarTrend": "रक्त शर्करा ट्रेंड (30 दिन)",
    
    // Challenges
    "challenges.title": "स्वास्थ्य चुनौतियां",
    "challenges.subtitle": "समुदाय के साथ मिलकर स्वस्थ आदतें बनाएं",
    "challenges.featured": "लोकप्रिय चुनौतियां",
    "challenges.myChallenges": "मेरी चुनौतियां",
    "challenges.allChallenges": "सभी चुनौतियां",
    "challenges.join": "शामिल हों",
    "challenges.leave": "छोड़ें",
    "challenges.joined": "शामिल",
    "challenges.daysLeft": "दिन बाकी",
    "challenges.participants": "प्रतिभागी",
    
    // Shop
    "shop.title": "स्वास्थ्य स्टोर",
    "shop.subtitle": "आपकी स्वास्थ्य यात्रा के लिए अनुशंसित उत्पाद",
    "shop.featured": "विशेष उत्पाद",
    "shop.viewProduct": "उत्पाद देखें",
    
    // Subscription
    "subscription.title": "बीट प्रीमियम",
    "subscription.subtitle": "अपनी पूरी स्वास्थ्य क्षमता अनलॉक करें",
    "subscription.free": "मुफ्त",
    "subscription.basic": "बेसिक",
    "subscription.premium": "प्रीमियम",
    "subscription.currentPlan": "वर्तमान प्लान",
    "subscription.upgrade": "अपग्रेड",
    "subscription.perMonth": "/महीना",
    
    // Profile
    "profile.title": "प्रोफ़ाइल",
    "profile.settings": "सेटिंग्स",
    "profile.notifications": "सूचनाएं",
    "profile.connectDevices": "डिवाइस कनेक्ट करें",
    "profile.exportData": "मेरा डेटा एक्सपोर्ट करें",
    "profile.deleteAccount": "अकाउंट हटाएं",
    "profile.signOut": "साइन आउट"
  }
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
