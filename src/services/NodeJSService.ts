import {Platform} from 'react-native';
import nodejs from 'nodejs-mobile-react-native';

export interface ServiceStatus {
  isRunning: boolean;
  port: number;
  error?: string;
}

export class NodeJSService {
  private static instance: NodeJSService;
  private isInitialized = false;
  private serviceStatus: ServiceStatus = {
    isRunning: false,
    port: 3456,
  };

  private listeners: Array<(status: ServiceStatus) => void> = [];

  static getInstance(): NodeJSService {
    if (!NodeJSService.instance) {
      NodeJSService.instance = new NodeJSService();
    }
    return NodeJSService.instance;
  }

  static async initialize(): Promise<void> {
    const instance = NodeJSService.getInstance();
    await instance.init();
  }

  private async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // تهيئة Node.js mobile
      nodejs.start('main.js');

      // الاستماع للرسائل من Node.js
      nodejs.channel.addListener(
        'message',
        (msg: any) => {
          console.log('رسالة من Node.js:', msg);
          this.handleNodeMessage(msg);
        },
        this,
      );

      this.isInitialized = true;
      console.log('تم تهيئة خدمة Node.js بنجاح');
    } catch (error) {
      console.error('فشل في تهيئة خدمة Node.js:', error);
      throw error;
    }
  }

  private handleNodeMessage(msg: any): void {
    if (msg.type === 'status') {
      this.serviceStatus = {
        ...this.serviceStatus,
        ...msg.data,
      };
      this.notifyListeners();
    } else if (msg.type === 'error') {
      this.serviceStatus = {
        ...this.serviceStatus,
        error: msg.error,
        isRunning: false,
      };
      this.notifyListeners();
    } else if (msg.type === 'localai_request') {
      // إعادة توجيه طلب النموذج المحلي
      this.handleLocalAIRequest(msg);
    }
  }
  
  private async handleLocalAIRequest(msg: any): Promise<void> {
    try {
      // استيراد LocalAIService واستخدامه
      const {LocalAIService} = require('./LocalAIService');
      const localAI = LocalAIService.getInstance();
      
      if (!localAI.isModelLoaded()) {
        nodejs.channel.send({
          type: 'localai_response',
          requestId: msg.requestId,
          error: 'لا يوجد نموذج محلي محمل'
        });
        return;
      }
      
      const result = await localAI.generateText(msg.prompt, msg.options);
      
      nodejs.channel.send({
        type: 'localai_response',
        requestId: msg.requestId,
        result
      });
      
    } catch (error) {
      nodejs.channel.send({
        type: 'localai_response',
        requestId: msg.requestId,
        error: (error as Error).message
      });
    }
  }

  async startService(): Promise<void> {
    try {
      nodejs.channel.send({
        type: 'start',
        port: this.serviceStatus.port,
      });
    } catch (error) {
      console.error('فشل في بدء الخدمة:', error);
      throw error;
    }
  }

  async stopService(): Promise<void> {
    try {
      nodejs.channel.send({
        type: 'stop',
      });
    } catch (error) {
      console.error('فشل في إيقاف الخدمة:', error);
      throw error;
    }
  }

  async updateConfig(config: any): Promise<void> {
    try {
      nodejs.channel.send({
        type: 'updateConfig',
        config,
      });
    } catch (error) {
      console.error('فشل في تحديث الإعدادات:', error);
      throw error;
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    return new Promise((resolve) => {
      nodejs.channel.send({type: 'getStatus'});
      
      const timeout = setTimeout(() => {
        resolve(this.serviceStatus);
      }, 1000);

      const listener = (msg: any) => {
        if (msg.type === 'status') {
          clearTimeout(timeout);
          nodejs.channel.removeListener('message', listener);
          resolve(msg.data);
        }
      };

      nodejs.channel.addListener('message', listener);
    });
  }

  onStatusChange(callback: (status: ServiceStatus) => void): () => void {
    this.listeners.push(callback);
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.serviceStatus));
  }

  getCurrentStatus(): ServiceStatus {
    return this.serviceStatus;
  }
  
  async loadLocalModel(modelPath: string): Promise<boolean> {
    try {
      const {LocalAIService} = require('./LocalAIService');
      const localAI = LocalAIService.getInstance();
      const success = await localAI.loadModel(modelPath);
      
      if (success) {
        nodejs.channel.send({
          type: 'localai_model_loaded',
          modelInfo: localAI.getCurrentModel()
        });
      }
      
      return success;
    } catch (error) {
      console.error('فشل في تحميل النموذج المحلي:', error);
      return false;
    }
  }
  
  async unloadLocalModel(): Promise<void> {
    try {
      const {LocalAIService} = require('./LocalAIService');
      const localAI = LocalAIService.getInstance();
      await localAI.unloadModel();
      
      nodejs.channel.send({
        type: 'localai_model_unloaded'
      });
    } catch (error) {
      console.error('فشل في إلغاء تحميل النموذج المحلي:', error);
      throw error;
    }
  }
}