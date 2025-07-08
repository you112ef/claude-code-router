# Claude Code Router - Android

<div align="center">

![Claude Code Router](https://img.shields.io/badge/Claude%20Code-Router-blue?style=for-the-badge&logo=android)
![React Native](https://img.shields.io/badge/React%20Native-0.73-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Mobile-green?style=for-the-badge&logo=nodedotjs)
![Local AI](https://img.shields.io/badge/Local%20AI-Enabled-purple?style=for-the-badge&logo=brain)

**تطبيق أندرويد متطور لتوجيه طلبات Claude Code إلى مقدمي خدمة ذكاء اصطناعي مختلفين مع دعم النماذج المحلية**

[📱 تحميل APK](#التحميل) • [🚀 البدء السريع](#البدء-السريع) • [📖 الوثائق](#الوثائق) • [🤝 المساهمة](#المساهمة)

</div>

---

## ✨ الميزات الرئيسية

### 🏠 إدارة الخدمة الشاملة
- **تحكم كامل**: بدء وإيقاف خدمة Claude Code Router
- **مراقبة في الوقت الفعلي**: عرض حالة الخدمة والمنفذ المستخدم
- **إشعارات ذكية**: تنبيهات عند تغيير حالة الخدمة

### ⚙️ إعدادات متقدمة
- **إدارة مقدمي الخدمة**: إضافة وتعديل مقدمي خدمة متعددين (OpenAI, DeepSeek, OpenRouter, وغيرها)
- **توجيه ذكي**: توجيه الطلبات تلقائياً حسب الحجم ونوع المهمة
- **تخصيص شامل**: إعدادات مرنة لكل مقدم خدمة

### 🧠 ذكاء اصطناعي محلي متقدم
- **يعمل بدون انترنت**: نماذج AI محلية على جهازك
- **دعم متعدد التقنيات**: TensorFlow Lite, ONNX Runtime, GGML
- **نماذج محسنة**: Phi-3, TinyLlama, Qwen2.5-Coder وغيرها
- **خصوصية كاملة**: لا يتم إرسال أي بيانات خارج الجهاز

### 🔌 نظام إضافات قوي
- **إضافات مدمجة**: تصفية أدوات Jupyter، تحسين استخدام الأدوات
- **إضافات مخصصة**: إنشاء إضافاتك الخاصة بـ JavaScript
- **سهولة الإدارة**: تفعيل وإلغاء تفعيل الإضافات بنقرة واحدة

### 📊 مراقبة ومتابعة شاملة
- **سجلات مفصلة**: عرض جميع عمليات النظام في الوقت الفعلي
- **تصفية ذكية**: البحث والتصفية حسب مستوى الخطورة
- **إحصائيات مفيدة**: عدد الطلبات، الأخطاء، والتحذيرات

---

## 🏗️ المعمارية التقنية

### 📱 الواجهة الأمامية
- **React Native 0.73**: واجهة مستخدم حديثة ومتجاوبة
- **React Native Paper**: مكونات Material Design
- **React Navigation**: نظام تنقل سلس ومتقدم
- **TypeScript**: أمان نوع البيانات وتطوير أفضل

### 🖥️ الخادم المحلي
- **Node.js Mobile**: خادم Node.js يعمل مباشرة على الأندرويد
- **Express.js**: API سريع وموثوق
- **Middleware System**: نظام وسطاء مرن وقابل للتوسع
- **Plugin Architecture**: معمارية إضافات قابلة للتخصيص

### 🤖 الذكاء الاصطناعي المحلي
- **TensorFlow Lite**: تشغيل نماذج TensorFlow محلياً
- **ONNX Runtime**: دعم نماذج ONNX عالية الأداء
- **GGML Support**: تشغيل نماذج GGML (مثل Llama)
- **Native Integration**: تكامل محلي مع Android NDK

---

## 🚀 البدء السريع

### متطلبات النظام
- **Android**: 7.0+ (API level 24)
- **RAM**: 4GB+ (يُنصح بـ 6GB+ للنماذج المحلية)
- **Storage**: 8GB+ مساحة فارغة
- **CPU**: ARM64 أو x86_64

### التثبيت

#### 📱 من GitHub Releases
1. انتقل إلى [صفحة الإصدارات](https://github.com/your-repo/claude-code-router-android/releases)
2. حمل أحدث ملف APK
3. فعّل "تثبيت من مصادر غير معروفة" في إعدادات الأندرويد
4. ثبت التطبيق

#### 🔨 البناء من المصدر
```bash
# استنساخ المستودع
git clone https://github.com/your-repo/claude-code-router-android.git
cd claude-code-router-android

# تثبيت التبعيات
npm install

# بناء مشروع Node.js
npm run build:js

# بناء APK
cd android
./gradlew assembleRelease
```

### الإعداد الأولي

1. **افتح التطبيق** وانتقل إلى تبويب "الإعدادات"
2. **أضف مقدم خدمة**:
   ```
   الاسم: OpenAI
   الرابط: https://api.openai.com/v1
   المفتاح: sk-your-api-key
   النماذج: gpt-3.5-turbo, gpt-4
   ```
3. **ابدأ الخدمة** من تبويب "الرئيسية"
4. **اختياري**: حمل نموذجاً محلياً من تبويب "الذكاء المحلي"

---

## 📖 الوثائق التفصيلية

### 🔧 إعداد مقدمي الخدمة

#### OpenAI
```json
{
  "name": "openai",
  "api_base_url": "https://api.openai.com/v1",
  "api_key": "sk-your-openai-key",
  "models": ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"]
}
```

#### DeepSeek
```json
{
  "name": "deepseek",
  "api_base_url": "https://api.deepseek.com",
  "api_key": "sk-your-deepseek-key",
  "models": ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"]
}
```

#### OpenRouter
```json
{
  "name": "openrouter",
  "api_base_url": "https://openrouter.ai/api/v1",
  "api_key": "sk-your-openrouter-key",
  "models": [
    "anthropic/claude-3.5-sonnet",
    "google/gemini-2.0-flash-exp",
    "meta-llama/llama-3.2-90b-vision-instruct"
  ]
}
```

### 🧠 النماذج المحلية المدعومة

| النموذج | الحجم | النوع | الوصف |
|---------|-------|-------|--------|
| **Phi-3 Mini** | 2.4GB | GGML | نموذج سريع للمحادثات العامة |
| **TinyLlama** | 1.1GB | GGML | نموذج خفيف للأجهزة المحدودة |
| **Qwen2.5-Coder** | 1.5GB | GGML | متخصص في البرمجة والكود |

### 🔌 تطوير الإضافات

إنشاء إضافة جديدة:

```javascript
// مثال: إضافة تصفية اللغة
function process(requestBody) {
  // تصفية المحتوى غير المرغوب
  if (requestBody.messages) {
    requestBody.messages = requestBody.messages.filter(msg => 
      !msg.content.includes('محتوى غير مرغوب')
    );
  }
  
  return requestBody;
}

module.exports = { process };
```

### 🎯 التوجيه الذكي

يقوم النظام بتوجيه الطلبات تلقائياً:

- **المهام الخلفية** → نماذج محلية أو مقدمين اقتصاديين
- **التفكير المعقد** → نماذج متقدمة مثل DeepSeek Reasoner
- **السياق الطويل** → نماذج بسياق كبير مثل Gemini 2.0

---

## 📱 لقطات الشاشة

<div align="center">

### 🏠 الشاشة الرئيسية
![Home Screen](screenshots/home.png)

### ⚙️ إدارة الإعدادات
![Config Screen](screenshots/config.png)

### 🧠 الذكاء المحلي
![Local AI Screen](screenshots/localai.png)

### 🔌 نظام الإضافات
![Plugins Screen](screenshots/plugins.png)

### 📊 السجلات والمراقبة
![Logs Screen](screenshots/logs.png)

</div>

---

## 🔄 CI/CD والتطوير

### GitHub Actions
يتم بناء APK تلقائياً عند:
- **Push** إلى فرع `main` أو `develop`
- **Pull Request** جديد
- **Release** جديد

### بناء محلي
```bash
# تشغيل في وضع التطوير
npm start
npm run android

# بناء الإنتاج
npm run build:js
cd android && ./gradlew assembleRelease

# اختبار الكود
npm run lint
npm test
```

### هيكل المشروع
```
claude-code-router-android/
├── src/                          # كود React Native
│   ├── components/              # مكونات قابلة للإعادة
│   ├── screens/                 # شاشات التطبيق
│   ├── services/                # خدمات التطبيق
│   ├── contexts/                # React Context
│   └── utils/                   # أدوات مساعدة
├── nodejs-assets/               # مشروع Node.js
│   └── nodejs-project/
│       ├── main.js              # نقطة الدخول
│       ├── middlewares/         # وسطاء Express
│       ├── utils/               # أدوات Node.js
│       └── plugins/             # الإضافات
├── android/                     # مشروع Android
│   ├── app/                     # تطبيق Android الرئيسي
│   └── gradle/                  # إعدادات Gradle
├── .github/workflows/           # GitHub Actions
└── scripts/                     # سكريبت البناء
```

---

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

### 🐛 الإبلاغ عن الأخطاء
1. تحقق من [القضايا الموجودة](https://github.com/your-repo/claude-code-router-android/issues)
2. أنشئ قضية جديدة مع وصف مفصل
3. أضف لقطات شاشة إن أمكن

### 💡 اقتراح ميزات جديدة
1. أنشئ **Discussion** جديدة
2. اشرح الميزة والفائدة منها
3. ناقش التنفيذ مع المجتمع

### 🔧 المساهمة بالكود
1. **Fork** المستودع
2. أنشئ فرعاً جديداً: `git checkout -b feature/amazing-feature`
3. **Commit** تغييراتك: `git commit -m 'Add amazing feature'`
4. **Push** للفرع: `git push origin feature/amazing-feature`
5. أنشئ **Pull Request**

### 📋 معايير الكود
- استخدم **TypeScript** للملفات الجديدة
- اتبع **ESLint** المعدة في المشروع
- أضف **تعليقات** باللغة العربية
- اكتب **اختبارات** للميزات الجديدة

---

## 📜 الترخيص

هذا المشروع مرخص تحت [رخصة MIT](LICENSE) - راجع ملف الترخيص للتفاصيل.

---

## 🙏 الشكر والتقدير

- **[Claude Code](https://claude.ai/code)** - الإلهام الأساسي للمشروع
- **[React Native](https://reactnative.dev/)** - إطار عمل التطبيق
- **[nodejs-mobile](https://github.com/nodejs-mobile/nodejs-mobile-react-native)** - تشغيل Node.js على الأندرويد
- **[TensorFlow Lite](https://www.tensorflow.org/lite)** - نماذج الذكاء الاصطناعي المحلية
- **[DeepSeek](https://deepseek.com/)** - نماذج ذكاء اصطناعي متطورة
- **[OpenRouter](https://openrouter.ai/)** - الوصول لنماذج متعددة

---

## 📞 التواصل والدعم

- **GitHub Issues**: [الإبلاغ عن المشاكل](https://github.com/your-repo/claude-code-router-android/issues)
- **GitHub Discussions**: [المناقشات العامة](https://github.com/your-repo/claude-code-router-android/discussions)
- **Email**: support@claudecoderouter.app

---

<div align="center">

**صُنع بـ ❤️ لمجتمع المطورين العرب**

![Stars](https://img.shields.io/github/stars/your-repo/claude-code-router-android?style=social)
![Forks](https://img.shields.io/github/forks/your-repo/claude-code-router-android?style=social)
![Issues](https://img.shields.io/github/issues/your-repo/claude-code-router-android)
![License](https://img.shields.io/github/license/your-repo/claude-code-router-android)

</div>