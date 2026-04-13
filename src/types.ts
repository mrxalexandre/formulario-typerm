export type QuestionType = 'short_text' | 'textarea' | 'multiple_choice' | 'boolean';

export interface Question {
  id: number;
  form_id: number;
  title: string;
  type: QuestionType;
  options?: string[]; // For multiple choice
  required: boolean;
  order: number;
}

export interface FormSettings {
  bg_gradient: string;
  font_family: string;
  primary_color: string;
  admin_email: string;
  auto_advance: boolean;
  hide_browser_ui: boolean;
}

export interface Form {
  id: number;
  slug: string;
  title: string;
  settings: FormSettings;
  created_at: string;
  responses_count?: number;
}

export interface Submission {
  id: number;
  form: number;
  created_at: number;
  content: Record<string, any>;
}
