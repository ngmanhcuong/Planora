import { AiProvider } from './ai.types';

export class MockDeterministicAiProvider implements AiProvider {
  isConfigured(): boolean {
    return true;
  }

  getProviderName(): string {
    return 'planora-test-mock';
  }

  getModelName(): string {
    return 'rule-engine-v1';
  }

  async generateStructured<T>(
    _systemPrompt: string,
    _userPrompt: string,
    fallbackValue: T
  ): Promise<T> {
    return fallbackValue;
  }

  async chat(
    _systemPrompt: string,
    userMessage: string
  ): Promise<string> {
    return `[Trợ lý Planora Test] Bạn vừa hỏi: "${userMessage}". Lựa chọn của bạn đã được ghi nhận.`;
  }
}

export class ExternalAiProvider implements AiProvider {
  private apiKey: string;
  private providerName: string;
  private modelName: string;
  private isTestEnvironment: boolean;
  private testMockProvider: MockDeterministicAiProvider;

  constructor(overrideMode?: 'test' | 'prod') {
    this.apiKey = process.env.AI_API_KEY || '';
    this.providerName = process.env.AI_PROVIDER || 'none';
    this.modelName = process.env.AI_MODEL || 'none';
    this.isTestEnvironment = overrideMode === 'test' || process.env.NODE_ENV === 'test';
    this.testMockProvider = new MockDeterministicAiProvider();
  }

  isConfigured(): boolean {
    if (this.isTestEnvironment) return true;
    return !!this.apiKey && this.apiKey.trim().length > 0 && this.providerName !== 'none';
  }

  getProviderName(): string {
    if (this.isTestEnvironment) return this.testMockProvider.getProviderName();
    return this.isConfigured() ? this.providerName : 'none';
  }

  getModelName(): string {
    if (this.isTestEnvironment) return this.testMockProvider.getModelName();
    return this.isConfigured() ? this.modelName : 'none';
  }

  async generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    fallbackValue: T
  ): Promise<T> {
    if (this.isTestEnvironment) {
      return this.testMockProvider.generateStructured(systemPrompt, userPrompt, fallbackValue);
    }

    if (!this.isConfigured()) {
      const err: any = new Error('Tính năng AI hiện không khả dụng. Vui lòng thử lại sau.');
      err.statusCode = 503;
      throw err;
    }

    try {
      // In production, invoke real LLM endpoint (e.g. OpenAI/Gemini)
      return fallbackValue;
    } catch {
      const err: any = new Error('Tính năng AI hiện không khả dụng. Vui lòng thử lại sau.');
      err.statusCode = 503;
      throw err;
    }
  }

  async chat(systemPrompt: string, userMessage: string): Promise<string> {
    if (this.isTestEnvironment) {
      return this.testMockProvider.chat(systemPrompt, userMessage);
    }

    if (!this.isConfigured()) {
      const err: any = new Error('Tính năng AI hiện không khả dụng. Vui lòng thử lại sau.');
      err.statusCode = 503;
      throw err;
    }

    try {
      return `[Planora AI] ${userMessage}`;
    } catch {
      const err: any = new Error('Tính năng AI hiện không khả dụng. Vui lòng thử lại sau.');
      err.statusCode = 503;
      throw err;
    }
  }
}

export const defaultAiProvider: AiProvider = new ExternalAiProvider();
