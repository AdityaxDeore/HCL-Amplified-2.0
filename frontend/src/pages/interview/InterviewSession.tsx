import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, ArrowLeft, Send, CheckCircle2, AlertTriangle,
  Clock, Zap, Sparkles, Loader2, Award, HelpCircle, MessageSquare
} from 'lucide-react';
import { interviewApi } from '../../api/interviewApi';
import { useLearner } from '../../context/LearnerContext';

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { learner } = useLearner();
  
  const [session, setSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [hasFollowUp, setHasFollowUp] = useState(false);
  const [followUpQuestionText, setFollowUpQuestionText] = useState(null);
  const [nextStep, setNextStep] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initSession() {
      setLoading(true);
      setError(null);
      try {
        const sess = await interviewApi.getSession(sessionId);
        if (sess?.status === 'COMPLETED') {
          navigate(`/interview/results/${sessionId}`);
          return;
        }
        setSession(sess);

        const q = await interviewApi.getCurrentQuestion(sessionId);
        if (q?.isComplete) {
          navigate(`/interview/results/${sessionId}`);
          return;
        }
        setCurrentQ(q);
      } catch (err) {
        console.error('Session load error:', err);
        setError('Could not load interview session.');
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [sessionId]);

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

  async function handleSubmitAnswer() {
    if (!currentAnswer.trim()) {
      setError('Please enter an answer before submitting.');
      return;
    }
    setError(null);
    setIsEvaluating(true);

    try {
      if (hasFollowUp) {
        // Submit follow-up response
        const res = await interviewApi.submitFollowUp(sessionId, currentAnswer);
        setEvaluation(res.evaluation);
        setHasFollowUp(false);
        setFollowUpQuestionText(null);
        setNextStep(res.nextStep);
      } else {
        // Submit main response
        const res = await interviewApi.submitAnswer(sessionId, currentAnswer);
        setEvaluation(res.evaluation);
        setHasFollowUp(res.hasFollowUp);
        setFollowUpQuestionText(res.followUpQuestion);
        setNextStep(res.nextStep);
      }
    } catch (err) {
      console.error('Error evaluating answer:', err);
      setError(err?.response?.data?.message || 'Evaluation temporarily unavailable. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  }

  async function handleAdvance() {
    setError(null);
    setEvaluation(null);
    setCurrentAnswer('');

    if (nextStep === 'complete') {
      try {
        await interviewApi.completeInterview(sessionId);
        navigate(`/interview/results/${sessionId}`);
      } catch (err) {
        navigate(`/interview/results/${sessionId}`);
      }
      return;
    }

    if (hasFollowUp && followUpQuestionText) {
      // Transition to follow-up input
      setCurrentQ(prev => ({
        ...prev,
        question: followUpQuestionText,
        isFollowUp: true,
        parentQuestionText: prev.question
      }));
      setEvaluation(null);
      return;
    }

    // Advance to next question
    setLoading(true);
    try {
      const q = await interviewApi.nextQuestion(sessionId);
      if (q?.overallScore || q?.isComplete) {
        navigate(`/interview/results/${sessionId}`);
      } else {
        const nextQ = await interviewApi.getCurrentQuestion(sessionId);
        setCurrentQ(nextQ);
      }
    } catch (err) {
      console.error('Next question error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa] text-center px-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-[#1A1D21]">Preparing next question...</h2>
      </div>
    );
  }

  const qNum = currentQ?.questionNumber || 1;
  const totalQ = currentQ?.totalQuestions || session?.questionCount || 6;
  const progressPct = ((qNum - 1) / totalQ) * 100;

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa]">
      
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/interview')} className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-bold text-gray-800 uppercase tracking-wider">{session?.targetRole || 'AI Engineer'} Mock Interview</div>
            <div className="text-[10px] text-gray-400 font-medium capitalize">{session?.interviewType || 'mixed'} · {session?.difficulty || 'adaptive'}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}`}>
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={async () => {
              await interviewApi.completeInterview(sessionId);
              navigate(`/interview/results/${sessionId}`);
            }}
            className="text-xs font-semibold text-gray-400 hover:text-rose-600 transition-colors"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
        <div className="max-w-4xl mx-auto flex flex-col h-full space-y-6">
          
          {/* Question Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Question {qNum} of {totalQ}
              </span>
              {currentQ?.isFollowUp && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-md">
                  Targeted Follow-Up
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                {currentQ?.skill || 'Machine Learning'}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                {currentQ?.difficulty || 'Medium'}
              </span>
            </div>
          </div>

          {/* Question Prompt Bubble */}
          <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
            {currentQ?.parentQuestionText && (
              <div className="mb-3 pb-3 border-b border-gray-100 text-xs text-gray-400 italic">
                Context: "{currentQ.parentQuestionText}"
              </div>
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1D21] leading-relaxed">
              {currentQ?.question}
            </h2>
          </div>

          {/* Instant Evaluation Feedback Card (Shown after submit) */}
          {evaluation && (
            <div className="bg-white rounded-3xl border border-indigo-100 p-6 shadow-md space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-[#1A1D21] text-sm">AI Evaluation Breakdown</h3>
                </div>
                <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  <span className="text-xs font-bold text-indigo-900">Score:</span>
                  <span className="text-sm font-extrabold text-indigo-700">{Math.round(evaluation.overallScore)}/100</span>
                </div>
              </div>

              {/* Sub-Dimension Pill Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Technical</span>
                  <strong className="text-gray-800">{Math.round(evaluation.technicalScore)}%</strong>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Conceptual</span>
                  <strong className="text-gray-800">{Math.round(evaluation.conceptualScore)}%</strong>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Completeness</span>
                  <strong className="text-gray-800">{Math.round(evaluation.completenessScore)}%</strong>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Communication</span>
                  <strong className="text-gray-800">{Math.round(evaluation.communicationScore)}%</strong>
                </div>
              </div>

              {/* Strengths & Missing Concepts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-1">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> What You Did Well
                    </span>
                    <ul className="list-disc list-inside text-emerald-950 space-y-0.5">
                      {evaluation.strengths.map((st, i) => <li key={i}>{st}</li>)}
                    </ul>
                  </div>
                )}

                {evaluation.missingConcepts && evaluation.missingConcepts.length > 0 && (
                  <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-1">
                    <span className="font-bold text-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing Concepts
                    </span>
                    <ul className="list-disc list-inside text-rose-950 space-y-0.5">
                      {evaluation.missingConcepts.map((ms, i) => <li key={i}>{ms}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Constructive Paragraph Feedback */}
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                {evaluation.feedback}
              </p>

              {/* Action Button: Continue or Answer Follow-Up */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleAdvance}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  {hasFollowUp && followUpQuestionText ? (
                    <>
                      <span>Proceed to Follow-Up</span>
                      <MessageSquare className="w-3.5 h-3.5" />
                    </>
                  ) : nextStep === 'complete' ? (
                    <>
                      <span>View Final Interview Report</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Next Question</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Answer Text Input Area (Only when not showing feedback) */}
          {!evaluation && (
            <div className="flex-1 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[220px]">
              <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex justify-between items-center text-xs text-gray-500 font-semibold">
                <span>Type your structured technical explanation below:</span>
                <span className="text-[10px] text-gray-400">{currentAnswer.length}/4000</span>
              </div>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Explain the mechanism, tradeoffs, and industry applications clearly..."
                disabled={isEvaluating}
                className="flex-1 w-full p-6 resize-none outline-none text-gray-800 text-sm sm:text-base leading-relaxed custom-scrollbar"
              />

              {error && (
                <div className="px-6 py-2 bg-rose-50 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
                <button 
                  onClick={() => setCurrentAnswer('')}
                  disabled={isEvaluating || !currentAnswer}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-700 disabled:opacity-40 transition-colors"
                >
                  Clear Answer
                </button>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || !currentAnswer.trim()}
                  className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Response...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
