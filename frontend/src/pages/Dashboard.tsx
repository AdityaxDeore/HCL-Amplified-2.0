import Header from '../components/layout/Header'
import { ArrowUpRight, Star, Settings as Gear, BookOpen, Scale, Contact2 } from 'lucide-react'

// --- Sub-components for the Dashboard ---

function ActivityCard({ title, rating, bubbleCount, bgColor, avatars }) {
  return (
    <div className={`rounded-[24px] p-5 ${bgColor} flex flex-col justify-between min-h-[160px]`}>
      <div className="flex justify-end">
        <div className="bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-[#1A1D21]">{rating}</span>
        </div>
      </div>
      <div className="flex-1 mt-4 flex items-center">
        <div className="flex -space-x-2">
          {avatars.map((url, i) => (
            <img key={i} src={url} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white/50 object-cover" />
          ))}
          <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold text-[#1A1D21] border-2 border-white/50 z-10">
            +{bubbleCount}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <h3 className="font-semibold text-lg text-[#1A1D21]">{title}</h3>
        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
          <ArrowUpRight className="w-4 h-4 text-[#1A1D21]" />
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value, bgColor }) {
  return (
    <div className={`rounded-[20px] p-4 ${bgColor} flex flex-col justify-between h-[120px]`}>
      <span className="text-[15px] font-medium text-[#1A1D21]">{label}</span>
      <div className="flex items-end justify-between">
        <span className="text-[32px] font-bold text-[#1A1D21] leading-none">{value}</span>
        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
          <ArrowUpRight className="w-4 h-4 text-[#1A1D21]" />
        </button>
      </div>
    </div>
  )
}

function CourseProgressCard() {
  return (
    <div className="rounded-[24px] p-6 bg-[#FCEABB] mt-4 shadow-sm border border-[#F5E2B2]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gear className="w-4 h-4 text-[#1A1D21]" />
          <span className="text-sm font-semibold text-[#1A1D21]">IT & Software</span>
        </div>
        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
          <ArrowUpRight className="w-4 h-4 text-[#1A1D21]" />
        </button>
      </div>
      
      <div className="mt-6 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[#1A1D21]" />
        <span className="text-sm font-medium text-[#1A1D21]/80">11/24 Lessons</span>
      </div>
      
      <h3 className="font-bold text-xl text-[#1A1D21] mt-1">Motion Design</h3>
      
      <div className="mt-4 h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#1A1D21] rounded-full" style={{ width: '45%' }} />
      </div>
    </div>
  )
}

function CalendarWidget() {
  const days = ['MON', 'THU', 'WED', 'TUE', 'FRI', 'SAT', 'SUN'] // Matching the image's weird ordering intentionally if requested, but normally it's MON TUE WED. The image actually shows MON THU WED TUE FRI SAT SUN which is strange, but I'll stick to a standard MON TUE WED THU FRI SAT SUN.
  const standardDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  
  // Generating a grid for July 2024 (starts on Monday)
  // 1-31.
  const dates = Array.from({length: 35}, (_, i) => {
    const dateNum = i + 1
    if (dateNum > 31) return (dateNum - 31).toString()
    return dateNum.toString()
  })

  // Pre-shift array to match July 2024 where 1st is Monday
  
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-[#1A1D21]">July 2024</h3>
        <div className="flex gap-2">
          <button className="text-gray-400 hover:text-[#1A1D21]">&lt;</button>
          <button className="text-gray-400 hover:text-[#1A1D21]">&gt;</button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-y-4 gap-x-2">
        {standardDays.map(day => (
          <div key={day} className="text-[10px] font-bold text-gray-400 text-center">{day}</div>
        ))}
        
        {/* Row 1: 1-7 */}
        <div className="text-sm text-center py-1">1</div>
        <div className="text-sm text-center py-1">2</div>
        <div className="text-sm text-center py-1 border border-dashed border-gray-300 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-gray-500">3</div>
        <div className="text-sm text-center py-1">4</div>
        <div className="text-sm text-center py-1">5</div>
        <div className="text-sm text-center py-1">6</div>
        <div className="text-sm text-center py-1">7</div>
        
        {/* Row 2: 8-14 */}
        <div className="text-sm text-center py-1">8</div>
        <div className="text-sm text-center py-1 bg-[#D3EAE8] rounded-full w-8 h-8 flex items-center justify-center mx-auto text-[#1A1D21] font-bold">9</div>
        <div className="text-sm text-center py-1">10</div>
        <div className="text-sm text-center py-1">11</div>
        <div className="text-sm text-center py-1 bg-[#D3EAE8] rounded-full w-8 h-8 flex items-center justify-center mx-auto text-[#1A1D21] font-bold">12</div>
        <div className="text-sm text-center py-1">13</div>
        <div className="text-sm text-center py-1">14</div>
        
        {/* Row 3: 15-21 */}
        <div className="text-sm text-center py-1">15</div>
        <div className="text-sm text-center py-1 bg-[#1A1D21] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto font-bold">16</div>
        <div className="text-sm text-center py-1 bg-[#1A1D21] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto font-bold">17</div>
        <div className="text-sm text-center py-1">18</div>
        <div className="text-sm text-center py-1">19</div>
        <div className="text-sm text-center py-1">20</div>
        <div className="text-sm text-center py-1">21</div>

        {/* Row 4: 22-28 */}
        <div className="text-sm text-center py-1">22</div>
        <div className="text-sm text-center py-1">23</div>
        <div className="text-sm text-center py-1">24</div>
        <div className="text-sm text-center py-1">25</div>
        <div className="text-sm text-center py-1">26</div>
        <div className="text-sm text-center py-1">27</div>
        <div className="text-sm text-center py-1">28</div>

        {/* Row 5: 29-31, 1-4 */}
        <div className="text-sm text-center py-1 bg-[#D3EAE8] rounded-full w-8 h-8 flex items-center justify-center mx-auto text-[#1A1D21] font-bold">29</div>
        <div className="text-sm text-center py-1 bg-[#D3EAE8] rounded-full w-8 h-8 flex items-center justify-center mx-auto text-[#1A1D21] font-bold relative">
          30
          <div className="absolute inset-[-4px] border border-dashed border-gray-400 rounded-full" />
        </div>
        <div className="text-sm text-center py-1 bg-[#D3EAE8] rounded-full w-8 h-8 flex items-center justify-center mx-auto text-[#1A1D21] font-bold">31</div>
        <div className="text-sm text-center py-1 text-gray-300">1</div>
        <div className="text-sm text-center py-1 text-gray-300">2</div>
        <div className="text-sm text-center py-1 text-gray-300">3</div>
        <div className="text-sm text-center py-1 text-gray-300">4</div>
      </div>
    </div>
  )
}

function ScheduleItem({ icon: Icon, text }) {
  return (
    <div className="bg-[#D3EAE8] rounded-[16px] p-3 flex items-center gap-4 hover:bg-[#c2dedc] transition-colors cursor-pointer">
      <div className="bg-white rounded-[10px] w-12 h-12 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
      <p className="text-sm font-semibold text-[#1A1D21] leading-tight line-clamp-2 pr-2">
        {text}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const avatars1 = [
    "https://i.pravatar.cc/150?u=1",
    "https://i.pravatar.cc/150?u=2",
    "https://i.pravatar.cc/150?u=3"
  ]
  const avatars2 = [
    "https://i.pravatar.cc/150?u=4",
    "https://i.pravatar.cc/150?u=5",
    "https://i.pravatar.cc/150?u=6"
  ]

  return (
    <div className="flex flex-col h-full relative">
      <Header />
      
      <div className="px-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 mt-4">
          
          {/* Left Column: Activities & Progress */}
          <div className="flex flex-col">
            
            {/* Activities Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-[22px] font-semibold text-[#1A1D21]">Your activites today</h2>
                <span className="text-[20px] text-[#9CA3AF]">(8)</span>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <ActivityCard 
                  title="UX/UI Design"
                  rating="4.8"
                  bubbleCount="8"
                  bgColor="bg-[#D3EAE8]"
                  avatars={avatars1}
                />
                <ActivityCard 
                  title="Motion Design"
                  rating="4.4"
                  bubbleCount="6"
                  bgColor="bg-[#FBDDE7]"
                  avatars={avatars2}
                />
              </div>
            </section>

            {/* Progress Section */}
            <section className="mt-8">
              <h2 className="text-[22px] font-semibold text-[#1A1D21] mb-4">Learning progress</h2>
              
              <div className="grid grid-cols-3 gap-5">
                <StatCard label="Completed" value="18" bgColor="bg-[#D3EAE8]" />
                <StatCard label="Your score" value="72" bgColor="bg-[#FCEABB]" />
                <StatCard label="Active" value="14" bgColor="bg-[#DFD4EB]" />
              </div>

              <CourseProgressCard />
              
              {/* Peek card at the bottom mimicking the design */}
              <div className="rounded-t-[24px] p-6 bg-[#FBDDE7] mt-4 shadow-sm h-[60px] overflow-hidden opacity-50 flex items-center justify-center">
                 <div className="w-8 h-1 rounded-full bg-black/10" />
              </div>
            </section>
            
          </div>

          {/* Right Column: Schedule */}
          <div className="flex flex-col pl-4 border-l border-gray-100/50">
            <h2 className="text-[22px] font-semibold text-[#1A1D21] mb-4">Lesson schedule</h2>
            
            <CalendarWidget />

            <div className="mt-6 flex flex-col gap-3">
              <ScheduleItem 
                icon={Contact2} 
                text="Real World UX | Learn User Experience & Start Your Career" 
              />
              <ScheduleItem 
                icon={Scale} 
                text="User Experience (UX): The Ultimate Guide to Usability and UX" 
              />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
