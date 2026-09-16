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
    return !!this.apiKey.trim() && this.providerName === 'gemini' && this.modelName !== 'none';
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
      // Gemini explains the deterministic plan; IDs, ranks and time slots stay authoritative.
      const response = await this.requestGemini(
        `${systemPrompt}\nReturn JSON matching the supplied plan. Only improve reason strings; preserve all other fields.`,
        `${userPrompt}\nPlan: ${JSON.stringify(fallbackValue)}`,
        true
      );
      const parsed = JSON.parse(response);
      const plan = fallbackValue as Record<string, unknown>;
      const result = { ...plan };
      for (const key of ['recommendations', 'suggestions']) {
        const rows = plan[key];
        if (!Array.isArray(rows)) continue;
        const explanations = parsed?.[key];
        if (!Array.isArray(explanations)) return fallbackValue;
        result[key] = rows.map((row) => {
          const explanation = explanations.find((item: any) => item?.taskId === row.taskId);
          return { ...row, reason: typeof explanation?.reason === 'string' && explanation.reason.length <= 2000 ? explanation.reason : row.reason };
        });
      }
      return result as T;
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
      return await this.requestGemini(systemPrompt, userMessage);
    } catch {
      const err: any = new Error('Tính năng AI hiện không khả dụng. Vui lòng thử lại sau.');
      err.statusCode = 503;
      throw err;
    }
  }
  private async requestGemini(systemPrompt: string, message: string, json = false): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.modelName)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { maxOutputTokens: 4096, ...(json ? { responseMimeType: 'application/json' } : {}) },
        }),
      }
    );
    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
    const data = await response.json() as {
      candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[];
    };
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.filter(part => !part.thought).map(part => part.text || '').join('').trim();
    if (!text || candidate?.finishReason !== 'STOP') throw new Error('Gemini response incomplete');
    return text;
  }
}

export const defaultAiProvider: AiProvider = new ExternalAiProvider();
