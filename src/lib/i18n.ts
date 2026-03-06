export type Language = 'en' | 'hi' | 'mr';

export const translations: Record<Language, any> = {
    en: {
        title: "Learning Assessment Report",
        date: "Date",
        age: "Age",
        riskLevels: {
            low: "Low Risk",
            moderate: "Moderate Risk",
            high: "High Risk"
        },
        sections: {
            dyslexia: "Dyslexia Assessment",
            dysgraphia: "Dysgraphia Assessment",
            dyscalculia: "Dyscalculia Assessment"
        },
        labels: {
            score: "Score",
            confidence: "AI Confidence",
            summary: "AI Summary",
            strengths: "Strengths Noted",
            weaknesses: "Key Indicators Detected",
            recommendations: "Recommendations"
        },
        disclaimer: "This report is a screening tool only and does not constitute a clinical diagnosis. Please consult a qualified educational psychologist for a formal assessment."
    },
    hi: {
        title: "शिक्षण मूल्यांकन रिपोर्ट",
        date: "दिनांक",
        age: "आयु",
        riskLevels: {
            low: "कम जोखिम",
            moderate: "मध्यम जोखिम",
            high: "उच्च जोखिम"
        },
        sections: {
            dyslexia: "डिस्लेक्सिया मूल्यांकन (पठन विकार)",
            dysgraphia: "डिस्ग्राफिया मूल्यांकन (लेखन विकार)",
            dyscalculia: "डिस्कैलकुलिया मूल्यांकन (गणित विकार)"
        },
        labels: {
            score: "स्कोर",
            confidence: "AI विश्वसनीयता",
            summary: "AI सारांश",
            strengths: "सकारात्मक पक्ष",
            weaknesses: "पहचाने गए संकेत",
            recommendations: "सुझाव"
        },
        disclaimer: "यह रिपोर्ट केवल एक स्क्रीनिंग उपकरण है और यह नैदानिक निदान नहीं है। कृपया औपचारिक मूल्यांकन के लिए किसी qualified मनोवैज्ञानिक से संपर्क करें।"
    },
    mr: {
        title: "शैक्षणिक मूल्यांकन अहवाल",
        date: "दिनांक",
        age: "वय",
        riskLevels: {
            low: "कमी जोखीम",
            moderate: "मध्यम जोखीम",
            high: "उच्च जोखीम"
        },
        sections: {
            dyslexia: "डिस्लेक्सिया चाचणी (वाचन विकार)",
            dysgraphia: "डिस्ग्राफिया चाचणी (लेखन विकार)",
            dyscalculia: "डिस्कॅल्क्युलिया चाचणी (गणित विकार)"
        },
        labels: {
            score: "गुण",
            confidence: "AI आत्मविश्वास",
            summary: "AI सारांश",
            strengths: "जमेच्या बाजू",
            weaknesses: "आढळलेले संकेत",
            recommendations: "शिफारसी"
        },
        disclaimer: "हा अहवाल केवळ प्राथमिक तपासणीसाठी आहे आणि हे वैद्यकीय निदान नाही. कृपया अधिकृत तपासणीसाठी तज्ज्ञ समुपदेशकाचा सल्ला घ्या."
    }
};
