import { Question, Form } from '../types';

const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private maxTokens: number;
  private refillRate: number; // tokens per ms
  private queue: (() => void)[] = [];

  constructor(maxTokens: number, refillRateMs: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
    this.refillRate = maxTokens / refillRateMs;
  }

  async acquire(): Promise<void> {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  private processQueue() {
    if (this.queue.length === 0) return;
    
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      const resolve = this.queue.shift();
      if (resolve) resolve();
      if (this.queue.length > 0) {
        this.processQueue();
      }
    } else {
      const timeToWait = (1 - this.tokens) / this.refillRate;
      setTimeout(() => this.processQueue(), timeToWait);
    }
  }
}

// Xano free plan limit: 10 requests per 20 seconds
const apiRateLimiter = new RateLimiter(10, 20000);

async function fetchWithRetry(url: string, options?: RequestInit, retries = 5, backoff = 3000): Promise<Response> {
  await apiRateLimiter.acquire();
  
  try {
    const res = await fetch(url, options);
    if (res.status === 429 && retries > 0) {
      console.warn(`Rate limited (429). Retrying in ${backoff}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 1.5);
    }
    return res;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Network error. Retrying in ${backoff}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 1.5);
    }
    throw error;
  }
}

export const api = {
  getForms: async (): Promise<Form[]> => {
    const res = await fetchWithRetry(`${BASE_URL}/form`);
    if (!res.ok) throw new Error(`Failed to fetch forms: ${res.status} ${await res.text()}`);
    return res.json();
  },
  
  getForm: async (idOrSlug: string): Promise<Form> => {
    const res = await fetchWithRetry(`${BASE_URL}/form/${idOrSlug}`);
    if (!res.ok) throw new Error(`Failed to fetch form: ${res.status} ${await res.text()}`);
    return res.json();
  },
  
  createForm: async (data: Partial<Form>): Promise<Form> => {
    const { id, ...payload } = data;
    const safePayload = { ...payload, name: payload.title };
    const res = await fetchWithRetry(`${BASE_URL}/form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safePayload),
    });
    if (!res.ok) throw new Error(`Failed to create form: ${await res.text()}`);
    return res.json();
  },
  
  updateForm: async (id: number, data: Partial<Form>): Promise<Form> => {
    const { id: _, ...payload } = data;
    const safePayload = { ...payload, name: payload.title };
    const res = await fetchWithRetry(`${BASE_URL}/form/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safePayload),
    });
    if (!res.ok) throw new Error(`Failed to update form: ${await res.text()}`);
    return res.json();
  },

  deleteForm: async (id: number): Promise<void> => {
    const res = await fetchWithRetry(`${BASE_URL}/form/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete form: ${res.status} ${await res.text()}`);
  },

  getQuestions: async (formId: number): Promise<Question[]> => {
    const res = await fetchWithRetry(`${BASE_URL}/question?form_id=${formId}`);
    if (!res.ok) throw new Error(`Failed to fetch questions: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data
      .filter((q: any) => q.form === formId || q.form_id === formId)
      .map((q: any) => {
      // Map Xano format to frontend format
      let type = q.type;
      if (type === 'single_choice') type = 'multiple_choice';
      if (type === 'text_short') type = 'short_text';
      if (type === 'text_long') type = 'textarea';
      
      let options: string[] = [];
      if (q.options?.choices && Array.isArray(q.options.choices)) {
        options = q.options.choices.map((c: any) => c.label || c);
      } else if (Array.isArray(q.options)) {
        options = q.options;
      }

      return {
        id: q.id,
        form_id: q.form || q.form_id,
        title: q.label || q.title || q.question || '',
        type: type,
        options: options,
        required: q.is_required ?? q.required ?? false,
        order: q.order || 0
      };
    }).sort((a: Question, b: Question) => a.order - b.order);
  },
  
  createQuestion: async (data: Partial<Question>): Promise<Question> => {
    const { id, ...payload } = data;
    
    let xanoType = payload.type;
    if (xanoType === 'multiple_choice') xanoType = 'single_choice' as any;
    if (xanoType === 'short_text') xanoType = 'text_short' as any;
    if (xanoType === 'textarea') xanoType = 'text_long' as any;

    const safePayload = { 
      form: payload.form_id,
      form_id: payload.form_id,
      label: payload.title,
      title: payload.title,
      type: xanoType,
      is_required: payload.required,
      required: payload.required,
      order: payload.order,
      options: payload.options ? { choices: payload.options.map((opt, i) => ({ id: `o_${Date.now()}_${i}`, label: opt })) } : {}
    };

    const res = await fetchWithRetry(`${BASE_URL}/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safePayload),
    });
    if (!res.ok) throw new Error(`Failed to create question: ${await res.text()}`);
    const q = await res.json();
    
    // Map back to frontend format
    return {
      id: q.id,
      form_id: q.form || q.form_id,
      title: q.label || q.title || '',
      type: payload.type as any,
      options: payload.options,
      required: q.is_required ?? q.required ?? false,
      order: q.order || 0
    };
  },
  
  updateQuestion: async (id: number, data: Partial<Question>): Promise<Question> => {
    const { id: _, ...payload } = data;
    
    let xanoType = payload.type;
    if (xanoType === 'multiple_choice') xanoType = 'single_choice' as any;
    if (xanoType === 'short_text') xanoType = 'text_short' as any;
    if (xanoType === 'textarea') xanoType = 'text_long' as any;

    const safePayload = { 
      form: payload.form_id,
      form_id: payload.form_id,
      label: payload.title,
      title: payload.title,
      type: xanoType,
      is_required: payload.required,
      required: payload.required,
      order: payload.order,
      options: payload.options ? { choices: payload.options.map((opt, i) => ({ id: `o_${Date.now()}_${i}`, label: opt })) } : {}
    };

    const res = await fetchWithRetry(`${BASE_URL}/question/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safePayload),
    });
    if (!res.ok) throw new Error(`Failed to update question: ${await res.text()}`);
    const q = await res.json();
    
    return {
      id: q.id,
      form_id: q.form || q.form_id,
      title: q.label || q.title || '',
      type: payload.type as any,
      options: payload.options,
      required: q.is_required ?? q.required ?? false,
      order: q.order || 0
    };
  },
  
  deleteQuestion: async (id: number): Promise<void> => {
    const res = await fetchWithRetry(`${BASE_URL}/question/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete question: ${res.status} ${await res.text()}`);
  },

  submitForm: async (data: any): Promise<any> => {
    const safePayload = {
      form: data.form_id,
      content: data.answers
    };
    const res = await fetchWithRetry(`${BASE_URL}/submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safePayload),
    });
    if (!res.ok) throw new Error(`Failed to submit form: ${await res.text()}`);
    return res.json();
  },

  getSubmissions: async (formId: number): Promise<any[]> => {
    const res = await fetchWithRetry(`${BASE_URL}/submission`);
    if (!res.ok) throw new Error(`Failed to fetch submissions: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.filter((s: any) => s.form === formId);
  }
};
