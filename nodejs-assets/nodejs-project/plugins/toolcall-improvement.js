/**
 * إضافة تحسين استخدام الأدوات
 * تضيف تعليمات واضحة لاستخدام الأدوات بشكل أفضل
 */

function process(requestBody) {
  try {
    const improvementPrompt = `
## **تعليمات مهمة:**
يجب عليك استخدام الأدوات المتاحة بأكبر قدر ممكن من الكفاءة والدقة لمساعدة المستخدم في حل مشكلته.
أعطِ الأولوية لاستخدام الأدوات كلما أمكن ذلك لتحسين الدقة والكفاءة وجودة الاستجابة.

عند توفر أدوات لتعديل الملفات أو إنشائها، استخدمها بدلاً من إرجاع الكود كنص عادي.
`;

    // إضافة التعليمات إلى رسالة النظام
    if (typeof requestBody.system === 'string') {
      requestBody.system = requestBody.system + '\n\n' + improvementPrompt;
    } else if (Array.isArray(requestBody.system)) {
      requestBody.system.push({
        type: 'text',
        text: improvementPrompt
      });
    } else {
      requestBody.system = improvementPrompt;
    }
    
    return requestBody;
  } catch (error) {
    console.error('خطأ في إضافة toolcall-improvement:', error.message);
    return requestBody;
  }
}

module.exports = { process };