/**
 * إضافة تصفية أدوات Jupyter Notebook
 * تقوم بإزالة الأدوات المتعلقة بملفات .ipynb
 */

function process(requestBody) {
  try {
    if (requestBody.tools && Array.isArray(requestBody.tools)) {
      // تصفية الأدوات التي لا تتعلق بـ Jupyter
      requestBody.tools = requestBody.tools.filter(tool => {
        const toolName = tool.name || '';
        const toolDescription = tool.description || '';
        
        // قائمة بالكلمات المفتاحية للأدوات المتعلقة بـ Jupyter
        const jupyterKeywords = [
          'jupyter',
          'notebook',
          'ipynb',
          'kernel',
          'cell',
          'execute_code',
          'run_python'
        ];
        
        // التحقق من وجود أي كلمة مفتاحية
        const hasJupyterKeyword = jupyterKeywords.some(keyword => 
          toolName.toLowerCase().includes(keyword) || 
          toolDescription.toLowerCase().includes(keyword)
        );
        
        return !hasJupyterKeyword;
      });
    }
    
    return requestBody;
  } catch (error) {
    console.error('خطأ في إضافة notebook-tools-filter:', error.message);
    return requestBody;
  }
}

module.exports = { process };