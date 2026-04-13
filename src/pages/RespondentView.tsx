import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Form, Question } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';

export default function RespondentView() {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (formId: string) => {
    try {
      const formData = await api.getForm(formId);
      const questionsData = await api.getQuestions(formData.id);
      setForm(formData);
      setQuestions(questionsData);
    } catch (e) {
      console.error(e);
      alert('Form not found or failed to load from Xano.');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    try {
      await api.submitForm({
        form_id: form.id,
        answers
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert('Failed to submit');
    }
  };

  const handleAnswer = (questionId: number, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  if (!form || questions.length === 0) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      y: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  if (submitted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6"
        style={{ 
          ...(form.settings.bg_gradient.includes('url(') || form.settings.bg_gradient.includes('gradient(')
            ? {
                backgroundImage: form.settings.bg_gradient,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }
            : {
                backgroundColor: form.settings.bg_gradient
              }
          ),
          fontFamily: form.settings.font_family,
          color: '#fff'
        }}
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Thank you!</h1>
          <p className="text-lg opacity-80">Your response has been recorded.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ 
        ...(form.settings.bg_gradient.includes('url(') || form.settings.bg_gradient.includes('gradient(')
          ? {
              backgroundImage: form.settings.bg_gradient,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }
          : {
              backgroundColor: form.settings.bg_gradient
            }
        ),
        fontFamily: form.settings.font_family,
        color: '#fff'
      }}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-black/10">
        <div 
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%`, backgroundColor: form.settings.primary_color }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <div className="text-xl md:text-3xl font-medium mb-8 leading-tight">
              <span className="text-white/50 text-lg md:text-xl mr-4">{currentIndex + 1} &rarr;</span>
              {currentQ.title}
              {currentQ.required && <span className="text-red-400 ml-2">*</span>}
            </div>

            <div className="mt-8">
              {currentQ.type === 'short_text' && (
                <input 
                  type="text"
                  value={answers[currentQ.id] || ''}
                  onChange={e => handleAnswer(currentQ.id, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  className="w-full text-2xl md:text-4xl bg-transparent border-0 border-b-2 border-white/30 focus:border-white focus:ring-0 p-0 pb-2 placeholder-white/20 transition-colors outline-none"
                  placeholder="Type your answer here..."
                  autoFocus
                />
              )}

              {currentQ.type === 'textarea' && (
                <textarea 
                  value={answers[currentQ.id] || ''}
                  onChange={e => handleAnswer(currentQ.id, e.target.value)}
                  className="w-full text-xl md:text-2xl bg-transparent border-0 border-b-2 border-white/30 focus:border-white focus:ring-0 p-0 pb-2 placeholder-white/20 transition-colors min-h-[100px] resize-none outline-none"
                  placeholder="Type your answer here..."
                  autoFocus
                />
              )}

              {currentQ.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {(currentQ.options || []).map((opt, idx) => {
                    const isSelected = answers[currentQ.id] === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          handleAnswer(currentQ.id, opt);
                          if (form.settings.auto_advance) {
                            setTimeout(handleNext, 400);
                          }
                        }}
                        className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all flex items-center gap-4 text-lg md:text-xl
                          ${isSelected 
                            ? 'bg-white/20 border-white' 
                            : 'bg-black/10 border-transparent hover:bg-black/20 hover:border-white/30'}`}
                      >
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center border text-sm font-bold
                          ${isSelected ? 'bg-white text-black border-white' : 'border-white/50'}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === 'boolean' && (
                <div className="flex gap-4">
                  {['Yes', 'No'].map((opt, idx) => {
                    const isSelected = answers[currentQ.id] === (opt === 'Yes');
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          handleAnswer(currentQ.id, opt === 'Yes');
                          if (form.settings.auto_advance) {
                            setTimeout(handleNext, 400);
                          }
                        }}
                        className={`flex-1 px-6 py-8 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-4 text-2xl
                          ${isSelected 
                            ? 'bg-white/20 border-white' 
                            : 'bg-black/10 border-transparent hover:bg-black/20 hover:border-white/30'}`}
                      >
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center border text-lg font-bold
                          ${isSelected ? 'bg-white text-black border-white' : 'border-white/50'}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-12 flex items-center gap-4">
              <button
                onClick={handleNext}
                disabled={currentQ.required && (answers[currentQ.id] === undefined || answers[currentQ.id] === '')}
                className="px-8 py-3 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: form.settings.primary_color, color: '#fff' }}
              >
                {currentIndex === questions.length - 1 ? 'Submit' : 'OK'}
              </button>
              <span className="text-sm opacity-50 hidden md:inline-block">
                press <strong>Enter ↵</strong>
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center backdrop-blur-sm transition-colors disabled:opacity-30"
        >
          <ChevronUp size={24} />
        </button>
        <button 
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center backdrop-blur-sm transition-colors disabled:opacity-30"
        >
          <ChevronDown size={24} />
        </button>
      </div>
    </div>
  );
}
