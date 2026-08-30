import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Bot, Code2, Database, BrainCircuit, Rocket, ArrowRight, ArrowLeft, Loader2, Target, Clock, Layers } from 'lucide-react'
import { cn } from '../utils/cn'

const goals = [
  { id: 'ai', title: 'AI Engineer', icon: BrainCircuit, desc: 'Build intelligent systems and LLM apps' },
  { id: 'ds', title: 'Data Scientist', icon: Database, desc: 'Analyze data and build predictive models' },
  { id: 'swe', title: 'Software Engineer', icon: Code2, desc: 'Build robust scalable applications' },
]

const levels = [
  { id: 'beginner', title: 'Beginner', desc: 'Starting from scratch' },
  { id: 'intermediate', title: 'Intermediate', desc: 'Some experience, looking to specialize' },
  { id: 'advanced', title: 'Advanced', desc: 'Experienced, seeking mastery' },
]

const times = [
  { id: 'casual', title: 'Casual', desc: '2-5 hours / week' },
  { id: 'steady', title: 'Steady', desc: '5-10 hours / week' },
  { id: 'intensive', title: 'Intensive', desc: '10+ hours / week' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [data, setData] = useState({
    name: 'Aditya',
    goal: '',
    level: '',
    time: ''
  })

  // Simulated AI Roadmap Generation
  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
        navigate('/dashboard')
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [isGenerating, navigate])

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
    else setIsGenerating(true)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  // Common variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center space-y-8 max-w-md w-full">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-0 border-2 border-transparent border-t-primary rounded-3xl"
            />
            <Bot className="h-12 w-12 text-primary" />
          </motion.div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">Generating your AI Learning Path</h2>
            <p className="text-muted-foreground">
              Analyzing your goal, assessing skill gaps, and curating the best resources for {data.goal === 'ai' ? 'AI Engineering' : 'your journey'}...
            </p>
          </div>
          
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.2, ease: "easeInOut" }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header/Progress */}
      <header className="p-6 relative z-10 flex justify-between items-center max-w-4xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">AI</div>
          <span className="text-lg font-bold tracking-tight">LearnPath</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground">Step {step} of 4</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div key="step1" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold tracking-tight">Tell us about yourself</h1>
                  <p className="text-muted-foreground">Let's start with the basics to personalize your experience.</p>
                </div>
                <div className="space-y-4 max-w-sm mx-auto">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">What should we call you?</label>
                    <input 
                      type="text"
                      value={data.name}
                      onChange={(e) => setData({...data, name: e.target.value})}
                      className="flex h-12 w-full rounded-xl border border-border bg-card px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold tracking-tight">What is your goal?</h1>
                  <p className="text-muted-foreground">Select a career path you want to pursue.</p>
                </div>
                <div className="grid gap-4">
                  {goals.map((g) => {
                    const isSelected = data.goal === g.id
                    return (
                      <button
                        key={g.id}
                        onClick={() => setData({...data, goal: g.id})}
                        className={cn(
                          "flex items-center p-4 rounded-2xl border-2 transition-all text-left",
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-border bg-card hover:border-primary/50 hover:bg-accent/5"
                        )}
                      >
                        <div className={cn("p-3 rounded-xl mr-4", isSelected ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                          <g.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{g.title}</h3>
                          <p className="text-sm text-muted-foreground">{g.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold tracking-tight">What is your current level?</h1>
                  <p className="text-muted-foreground">How much experience do you have in this field?</p>
                </div>
                <div className="grid gap-4">
                  {levels.map((l) => {
                    const isSelected = data.level === l.id
                    return (
                      <button
                        key={l.id}
                        onClick={() => setData({...data, level: l.id})}
                        className={cn(
                          "flex items-center p-4 rounded-2xl border-2 transition-all text-left",
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-border bg-card hover:border-primary/50 hover:bg-accent/5"
                        )}
                      >
                        <div className={cn("p-3 rounded-xl mr-4", isSelected ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                          <Layers className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{l.title}</h3>
                          <p className="text-sm text-muted-foreground">{l.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold tracking-tight">How much time can you commit?</h1>
                  <p className="text-muted-foreground">This helps us schedule your learning appropriately.</p>
                </div>
                <div className="grid gap-4">
                  {times.map((t) => {
                    const isSelected = data.time === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setData({...data, time: t.id})}
                        className={cn(
                          "flex items-center p-4 rounded-2xl border-2 transition-all text-left",
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-border bg-card hover:border-primary/50 hover:bg-accent/5"
                        )}
                      >
                        <div className={cn("p-3 rounded-xl mr-4", isSelected ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{t.title}</h3>
                          <p className="text-sm text-muted-foreground">{t.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Footer / Navigation Controls */}
      <footer className="p-6 relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
        {step > 1 ? (
          <Button variant="ghost" onClick={prevStep} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        ) : <div />}
        
        <Button 
          onClick={nextStep} 
          className="gap-2 group bg-primary hover:bg-primary/90 rounded-full px-8 h-12 text-base"
          disabled={(step === 1 && !data.name) || (step === 2 && !data.goal) || (step === 3 && !data.level) || (step === 4 && !data.time)}
        >
          {step === 4 ? 'Generate Roadmap' : 'Continue'} 
          {step === 4 ? <Rocket className="h-4 w-4 ml-1" /> : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </Button>
      </footer>
    </div>
  )
}
