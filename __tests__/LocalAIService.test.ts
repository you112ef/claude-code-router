import {LocalAIService} from '../src/services/LocalAIService';

describe('LocalAIService', () => {
  let localAIService: LocalAIService;

  beforeEach(() => {
    localAIService = LocalAIService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = LocalAIService.getInstance();
    const instance2 = LocalAIService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize successfully', async () => {
    await expect(localAIService.initialize()).resolves.not.toThrow();
  });

  it('should simulate text generation when no model is loaded', async () => {
    const result = await localAIService.simulateLocalAI('مرحباً');
    
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('tokensGenerated');
    expect(result).toHaveProperty('inferenceTime');
    expect(typeof result.text).toBe('string');
    expect(typeof result.tokensGenerated).toBe('number');
    expect(typeof result.inferenceTime).toBe('number');
    expect(result.text.length).toBeGreaterThan(0);
  });

  it('should return available models', async () => {
    const models = await localAIService.getAvailableModels();
    expect(Array.isArray(models)).toBe(true);
  });

  it('should handle chat completion', async () => {
    const messages = [
      {role: 'user', content: 'مرحباً، كيف حالك؟'},
    ];
    
    const result = await localAIService.chatCompletion(messages);
    
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('tokensGenerated');
    expect(result).toHaveProperty('inferenceTime');
  });

  it('should format messages correctly', async () => {
    const messages = [
      {role: 'system', content: 'أنت مساعد ذكي'},
      {role: 'user', content: 'مرحباً'},
      {role: 'assistant', content: 'أهلاً وسهلاً'},
    ];
    
    const result = await localAIService.chatCompletion(messages);
    expect(typeof result.text).toBe('string');
  });

  it('should get current model info when no model is loaded', () => {
    const model = localAIService.getCurrentModel();
    expect(model).toBeNull();
  });

  it('should check if model is loaded', () => {
    const isLoaded = localAIService.isModelLoaded();
    expect(typeof isLoaded).toBe('boolean');
  });
});