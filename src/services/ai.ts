import { GoogleGenAI, Type } from "@google/genai";
import { Form, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateFormFromPrompt(prompt: string): Promise<{ form: Partial<Form>, questions: Partial<Question>[] }> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Create a form based on the following request: "${prompt}". 
    Provide a title for the form, a short description, and a list of questions. 
    For each question, specify the title, type, options (if multiple choice), and whether it is required.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "The title of the form.",
          },
          description: {
            type: Type.STRING,
            description: "A short description of the form.",
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "The question text.",
                },
                type: {
                  type: Type.STRING,
                  description: "The type of the question. Must be one of: 'short_text', 'textarea', 'multiple_choice', 'boolean'",
                },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                  description: "The options for the question, only if type is 'multiple_choice'.",
                },
                required: {
                  type: Type.BOOLEAN,
                  description: "Whether the question is required.",
                },
              },
              required: ["title", "type", "required"],
            },
            description: "The list of questions for the form.",
          },
        },
        required: ["title", "description", "questions"],
      },
    },
  });

  const jsonStr = response.text?.trim() || "{}";
  const data = JSON.parse(jsonStr);

  const form: Partial<Form> = {
    title: data.title,
    slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    settings: {
      bg_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      font_family: 'Inter',
      primary_color: '#667eea',
      admin_email: '',
      auto_advance: true,
      hide_browser_ui: false,
    },
    is_active: false
  };

  const questions: Partial<Question>[] = (data.questions || []).map((q: any, index: number) => ({
    title: q.title,
    type: q.type,
    options: q.options || [],
    required: q.required || false,
    order: index,
  }));

  return { form, questions };
}
