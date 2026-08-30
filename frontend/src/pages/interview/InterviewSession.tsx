import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Send, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { mockInterviewQuestions } from '../../data/mockInterview';
import { useLearner } from '../../context/LearnerContext';

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { learner } = useLearner();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins
  const [isFinishing, setIsFinishing] = useState(false);

  const question = mockInterviewQuestions[currentIndex];
  const totalQuestions = mockInterviewQuestions.length;
  const progress = ((currentIndex) / totalQuestions) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  function handleNext() {
    setAnswers(prev => ({ ...prev, [question.id]: currentAnswer }));
    
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer(answers[mockInterviewQuestions[currentIndex + 1]?.id] || '');
    } else {
      handleFinish();
    }
  }

  function handleFinish() {
    setIsFinishing(true);
    // Simulate AI evaluation time
    setTimeout(() => {
      navigate(`/interview/results/${sessionId}`);
    }, 2000);
  }

  if (isFinishing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa] text-center px-4">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 relative">
          <Zap className="w-10 h-10 text-indigo-600 animate-pulse" />
          <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#4F46E5" strokeWidth="4" strokeDasharray="60 140" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1D21] mb-2">Analyzing your responses...</h1>
        <p className="text-gray-500 max-w-md">Our AI is evaluating your technical accuracy, communication style, and problem-solving approach.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa]">
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/interview')} className="text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="font-bold text-gray-800 hidden sm:block">Technical Interview</div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-bold font-mono ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={handleFinish}
            className="text-sm font-semibold text-gray-500 hover:text-rose-600 transition-colors"
          >
            End Early
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
        <div className="max-w-4xl mx-auto flex flex-col h-full">
          
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Question {currentIndex + 1} of {totalQuestions}</span>
            <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">{question.category}</span>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm mb-6 flex-shrink-0">
            <h2 className="text-2xl font-bold text-[#1A1D21] leading-relaxed">{question.text}</h2>
          </div>

          <div className="flex-1 min-h-[200px] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">Your Response</span>
            </div>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="flex-1 w-full p-6 resize-none outline-none text-gray-800 text-lg custom-scrollbar"
            />
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 flex-shrink-0">
            <button 
              onClick={() => setCurrentAnswer('')}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2"
            >
              Clear
            </button>
            <div className="flex gap-4">
              <button 
                onClick={handleNext}
                className="h-12 px-6 sm:px-10 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                {currentIndex === totalQuestions - 1 ? (
                  <>Submit Interview <CheckCircle2 className="w-5 h-5" /></>
                ) : (
                  <>Next Question <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
