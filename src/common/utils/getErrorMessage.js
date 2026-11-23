
const messages = {
    shortPassword: {
        en: "Password must be at least 5 characters",
        ar: "كلمة المرور يجب ألا تقل عن 5 أحرف"
    },
    invalidEmail: {
        en: "Invalid email address",
        ar: "البريد الإلكتروني غير صحيح"
    }
};

export default function getErrorMessage(key, lang = "en") {
    return messages[key]?.[lang] || messages[key]?.en || "Invalid input";
}
