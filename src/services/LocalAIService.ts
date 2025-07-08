import {NativeModules, Platform} from 'react-native';
import RNFS from 'react-native-fs';

// إنشاء Native Module للذكاء الاصطناعي المحلي
const {LocalAIModule} = NativeModules;

export interface ModelInfo {
  name: string;
  path: string;
  type: 'onnx' | 'tflite' | 'ggml';
  size: number;
  isLoaded: boolean;
}

export interface InferenceOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  repetitionPenalty?: number;
}

export interface InferenceResult {
  text: string;
  tokensGenerated: number;
  inferenceTime: number;
  error?: string;
}

export class LocalAIService {
  private static instance: LocalAIService;
  private currentModel: ModelInfo | null = null;
  private isInitialized = false;

  static getInstance(): LocalAIService {
    if (!LocalAIService.instance) {
      LocalAIService.instance = new LocalAIService();
    }
    return LocalAIService.instance;
  }

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // تحقق من توفر Native Module
      if (!LocalAIModule) {
        throw new Error('LocalAI Native Module not available');
      }

      await LocalAIModule.initialize();
      this.isInitialized = true;
      console.log('LocalAI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LocalAI Service:', error);
      throw error;
    }
  }

  async loadModel(modelPath: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // التحقق من وجود الملف
      const exists = await RNFS.exists(modelPath);
      if (!exists) {
        throw new Error(`Model file not found: ${modelPath}`);
      }

      // تحديد نوع النموذج من الامتداد
      const modelType = this.getModelType(modelPath);
      
      // تحميل النموذج باستخدام Native Module
      const success = await LocalAIModule.loadModel(modelPath, modelType);
      
      if (success) {
        this.currentModel = {
          name: modelPath.split('/').pop() || 'Unknown',
          path: modelPath,
          type: modelType,
          size: (await RNFS.stat(modelPath)).size,
          isLoaded: true,
        };
        
        console.log(`Model loaded successfully: ${this.currentModel.name}`);
        return true;
      } else {
        throw new Error('Failed to load model');
      }
    } catch (error) {
      console.error('Error loading model:', error);
      return false;
    }
  }

  async unloadModel(): Promise<void> {
    try {
      if (this.currentModel && LocalAIModule) {
        await LocalAIModule.unloadModel();
        this.currentModel = null;
        console.log('Model unloaded successfully');
      }
    } catch (error) {
      console.error('Error unloading model:', error);
      throw error;
    }
  }

  async generateText(
    prompt: string,
    options: InferenceOptions = {}
  ): Promise<InferenceResult> {
    try {
      if (!this.currentModel) {
        throw new Error('No model loaded');
      }

      const startTime = Date.now();
      
      // استخدام النموذج لتوليد النص
      const result = await LocalAIModule.generateText(prompt, {
        maxTokens: options.maxTokens || 512,
        temperature: options.temperature || 0.7,
        topP: options.topP || 0.9,
        topK: options.topK || 40,
        repetitionPenalty: options.repetitionPenalty || 1.1,
      });

      const inferenceTime = Date.now() - startTime;

      return {
        text: result.text || '',
        tokensGenerated: result.tokensGenerated || 0,
        inferenceTime,
      };
    } catch (error) {
      console.error('Error generating text:', error);
      return {
        text: '',
        tokensGenerated: 0,
        inferenceTime: 0,
        error: (error as Error).message,
      };
    }
  }

  async chatCompletion(
    messages: Array<{role: string; content: string}>,
    options: InferenceOptions = {}
  ): Promise<InferenceResult> {
    try {
      // تحويل الرسائل إلى prompt واحد
      const prompt = this.formatMessagesAsPrompt(messages);
      return await this.generateText(prompt, options);
    } catch (error) {
      console.error('Error in chat completion:', error);
      return {
        text: '',
        tokensGenerated: 0,
        inferenceTime: 0,
        error: (error as Error).message,
      };
    }
  }

  private formatMessagesAsPrompt(messages: Array<{role: string; content: string}>): string {
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `System: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `Human: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    prompt += 'Assistant: ';
    return prompt;
  }

  private getModelType(modelPath: string): 'onnx' | 'tflite' | 'ggml' {
    const extension = modelPath.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'onnx':
        return 'onnx';
      case 'tflite':
        return 'tflite';
      case 'gguf':
      case 'bin':
        return 'ggml';
      default:
        return 'ggml'; // default to GGML
    }
  }

  getCurrentModel(): ModelInfo | null {
    return this.currentModel;
  }

  isModelLoaded(): boolean {
    return this.currentModel !== null && this.currentModel.isLoaded;
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const modelsDir = `${RNFS.DocumentDirectoryPath}/models`;
      const exists = await RNFS.exists(modelsDir);
      
      if (!exists) {
        return [];
      }

      const files = await RNFS.readDir(modelsDir);
      const models: ModelInfo[] = [];

      for (const file of files) {
        if (this.isModelFile(file.name)) {
          models.push({
            name: file.name,
            path: file.path,
            type: this.getModelType(file.name),
            size: file.size,
            isLoaded: this.currentModel?.path === file.path,
          });
        }
      }

      return models;
    } catch (error) {
      console.error('Error getting available models:', error);
      return [];
    }
  }

  private isModelFile(filename: string): boolean {
    const validExtensions = ['.onnx', '.tflite', '.gguf', '.bin'];
    return validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  async downloadModel(url: string, filename: string, onProgress?: (progress: number) => void): Promise<string> {
    try {
      const modelsDir = `${RNFS.DocumentDirectoryPath}/models`;
      await RNFS.mkdir(modelsDir);
      
      const filePath = `${modelsDir}/${filename}`;
      
      const download = RNFS.downloadFile({
        fromUrl: url,
        toFile: filePath,
        progress: onProgress ? (res) => {
          const progress = res.bytesWritten / res.contentLength;
          onProgress(progress);
        } : undefined,
      });

      const result = await download.promise;
      
      if (result.statusCode === 200) {
        return filePath;
      } else {
        throw new Error(`Download failed with status: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('Error downloading model:', error);
      throw error;
    }
  }

  async deleteModel(modelPath: string): Promise<void> {
    try {
      // إلغاء تحميل النموذج إذا كان محملاً
      if (this.currentModel?.path === modelPath) {
        await this.unloadModel();
      }
      
      // حذف الملف
      await RNFS.unlink(modelPath);
      console.log(`Model deleted: ${modelPath}`);
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  }

  // دالة لمحاكاة الذكاء الاصطناعي المحلي في حالة عدم توفر Native Module
  async simulateLocalAI(prompt: string): Promise<InferenceResult> {
    const responses = [
      'أهلاً! أنا نموذج ذكاء اصطناعي محلي يعمل على جهازك. كيف يمكنني مساعدتك؟',
      'هذا نص تم توليده محلياً بدون الحاجة للإنترنت. النموذج المحلي جاهز للاستخدام.',
      'يمكنني مساعدتك في مهام مختلفة مثل الكتابة والترجمة والبرمجة، كل ذلك محلياً على جهازك.',
      'النموذج المحلي يضمن خصوصيتك التامة حيث لا يتم إرسال أي بيانات عبر الإنترنت.',
    ];
    
    // محاكاة وقت المعالجة
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      text: randomResponse,
      tokensGenerated: Math.floor(Math.random() * 100) + 20,
      inferenceTime: 1000 + Math.random() * 2000,
    };
  }
}