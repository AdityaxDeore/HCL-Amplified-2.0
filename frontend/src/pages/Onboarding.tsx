import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles, Brain, Clock, Target, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchApi } from '../services/api'

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'experience', title: 'Experience', icon: Brain },
  { id: 'goals', title: 'Goals', icon: Target },
  { id: 'preferences', title: 'Preferences', icon: BookOpen },
  { id: 'availability', title: 'Availability', icon: Clock },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    experience_level: '',
    interests: [] as string[],
    skills: [] as any[],
    goals: [{ goal_text: '', target_role: '', goal_type: 'career' }],
    learning_preferences: { preferred_formats: [] as string[], pace: 'balanced' },
    availability: { hours_per_week: 5, preferred_days: [] as string[] }
  })

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1)
    } else {
      submitOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1)
    }
  }

  const submitOnboarding = async () => {
    setIsSubmitting(true)
    setError('')
    try {
      await fetchApi('/profile/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      // Navigate to dashboard and refresh the page to trigger MainLayoutWrapper profile check
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Welcome to LearnPath!</h3>
            <p className="text-muted-foreground">
              We'll personalize your AI learning journey. Answer a few quick questions to help us tailor the perfect roadmap for you.
            </p>
          </div>
        )
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">What is your current experience level?</h3>
            <div className="grid gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => updateFormData('experience_level', level)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.experience_level === level
                      ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <div className="font-semibold text-lg">{level}</div>
                  <div className="text-sm text-muted-foreground">
                    {level === 'Beginner' && 'Just starting out or learning basics'}
                    {level === 'Intermediate' && 'Have some practical experience'}
                    {level === 'Advanced' && 'Looking to master complex concepts'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">What is your primary goal?</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Role (e.g. Frontend Developer)</label>
                <input
                  type="text"
                  value={formData.goals[0].target_role}
                  onChange={e => {
                    const newGoals = [...formData.goals]
                    newGoals[0].target_role = e.target.value
                    updateFormData('goals', newGoals)
                  }}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2"
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Describe your goal</label>
                <textarea
                  value={formData.goals[0].goal_text}
                  onChange={e => {
                    const newGoals = [...formData.goals]
                    newGoals[0].goal_text = e.target.value
                    updateFormData('goals', newGoals)
                  }}
                  className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2"
                  placeholder="I want to transition into full-stack development and get a job in 6 months."
                />
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">How do you prefer to learn?</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Videos', 'Interactive Labs', 'Reading', 'Projects'].map(format => (
                <button
                  key={format}
                  onClick={() => {
                    const current = formData.learning_preferences.preferred_formats
                    const updated = current.includes(format)
                      ? current.filter(f => f !== format)
                      : [...current, format]
                    updateFormData('learning_preferences', { ...formData.learning_preferences, preferred_formats: updated })
                  }}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    formData.learning_preferences.preferred_formats.includes(format)
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <div className="font-medium">{format}</div>
                </button>
              ))}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">How much time can you commit?</h3>
            <div className="space-y-4 text-center">
              <div className="text-4xl font-bold text-primary">
                {formData.availability.hours_per_week} <span className="text-xl text-muted-foreground font-normal">hrs/week</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="40" 
                value={formData.availability.hours_per_week}
                onChange={e => updateFormData('availability', { ...formData.availability, hours_per_week: parseInt(e.target.value) })}
                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 hr</span>
                <span>40 hrs</span>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const isNextDisabled = () => {
    if (currentStep === 1 && !formData.experience_level) return true
    if (currentStep === 2 && !formData.goals[0].target_role) return true
    if (currentStep === 3 && formData.learning_preferences.preferred_formats.length === 0) return true
    return false
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-2xl z-10">
        {/* Progress bar */}
        <div className="mb-8 px-4 flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = currentStep > index
            const isCurrent = currentStep === index
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : isCurrent 
                        ? 'bg-background border-2 border-primary text-primary shadow-lg scale-110' 
                        : 'bg-background border-2 border-border text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className={`absolute top-12 text-xs font-medium whitespace-nowrap ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.title}
                </div>
              </div>
            )
          })}
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl mt-12">
          <CardContent className="pt-10 min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {error && (
                  <div className="mb-6 p-4 rounded-md bg-red-50 text-red-600 text-sm font-medium border border-red-200">
                    {error}
                  </div>
                )}
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-between items-center py-6 border-t border-border/50 bg-secondary/20">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
              className={`transition-opacity ${currentStep === 0 ? 'opacity-0' : 'opacity-100'}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            <Button 
              onClick={handleNext} 
              disabled={isNextDisabled() || isSubmitting}
              className="min-w-[120px] group bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : currentStep === steps.length - 1 ? (
                <>Complete <Check className="w-4 h-4 ml-2" /></>
              ) : (
                <>Next <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
