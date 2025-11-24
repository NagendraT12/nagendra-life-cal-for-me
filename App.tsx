import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Login } from './components/Login';
import { LifeGrid } from './components/LifeGrid';
import { DayGrid } from './components/DayGrid';
import { GridHeader } from './components/GridHeader';
import { AnalysisPanel } from './components/AnalysisPanel';
import { CalendarView, AIAnalysisResult, UserStatus, WeeklyGoal, UserProfile, CalendarMode, DayTask } from './types';
import { Layers, CheckCircle2, X, Trash2, Plus, Calendar as CalendarIcon, ExternalLink, Info, Bell, LogOut, User, Clock, Hourglass, Activity, LayoutGrid, Sun, Skull, AlertOctagon, Terminal, Fingerprint } from 'lucide-react';

const STORAGE_KEY_DOB = 'life-calendar-dob';
const STORAGE_KEY_STATUS = 'life-calendar-status';
const STORAGE_KEY_GOALS = 'life-calendar-goals';
const STORAGE_KEY_DAY_TASKS = 'life-calendar-day-tasks';
const STORAGE_KEY_USER = 'life-calendar-user';

const FACTS = [
  "DECAY IS CONSTANT.",
  "YOU ARE DYING.",
  "4,000 WEEKS TOTAL.",
  "SLEEP TAKES 26 YEARS.",
  "SCREENS TAKE 11 YEARS.",
  "NO REFUNDS ON TIME.",
  "MEMENTO MORI.",
  "THE CLOCK NEVER STOPS.",
  "YOUTH IS FINITE.",
  "ENTROPY WINS.",
  "VOID AWAITS.",
  "EXECUTE LIFE."
];

export default function App() {
  const [view, setView] = useState<CalendarView>(CalendarView.LOGIN);
  const [mode, setMode] = useState<CalendarMode>('LIFE');
  const [birthDate, setBirthDate] = useState<string>('');
  const [userStatus, setUserStatus] = useState<UserStatus>(UserStatus.CAREER);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [showStages, setShowStages] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<{year: number, week: number} | null>(null);
  
  // Scarcity & Facts State
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [millisecondsRemaining, setMillisecondsRemaining] = useState<number>(0);
  const [lifePercentage, setLifePercentage] = useState<number>(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Goals State
  const [goals, setGoals] = useState<Record<string, WeeklyGoal>>({});
  const [dayTasks, setDayTasks] = useState<Record<string, DayTask>>({});
  const [currentGoalText, setCurrentGoalText] = useState('');

  // Fact Ticker
  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % FACTS.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  // Entropy Counter & Title Update
  useEffect(() => {
    if (!birthDate) return;
    
    const calculateTime = () => {
        const now = new Date();
        
        if (mode === 'DAY') {
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            const diff = Math.max(0, endOfDay.getTime() - now.getTime());
            
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            const totalDay = endOfDay.getTime() - startOfDay.getTime();
            const usedDay = now.getTime() - startOfDay.getTime();
            const percent = (usedDay / totalDay) * 100;
            
            setSecondsRemaining(Math.floor(diff / 1000));
            setMillisecondsRemaining(diff % 1000);
            setLifePercentage(percent);
            
            // Title Update for Scarcity
            document.title = `${Math.floor(diff/1000)}s Left Today | Life Calendar`;
        } else {
            const start = new Date(birthDate);
            const end = new Date(start.getTime() + (90 * 365.25 * 24 * 60 * 60 * 1000));
            const diff = Math.max(0, end.getTime() - now.getTime());
            
            const totalLife = end.getTime() - start.getTime();
            const usedLife = now.getTime() - start.getTime();
            const percent = Math.min(100, Math.max(0, (usedLife / totalLife) * 100));
            
            setSecondsRemaining(Math.floor(diff / 1000));
            setMillisecondsRemaining(diff % 1000);
            setLifePercentage(percent);
            
             // Title Update for Scarcity
            document.title = `${Math.floor(diff/1000).toLocaleString()}s Left | Life Calendar`;
        }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 41);
    return () => clearInterval(timer);
  }, [birthDate, mode]);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedDob = localStorage.getItem(STORAGE_KEY_DOB);
    const savedStatus = localStorage.getItem(STORAGE_KEY_STATUS);
    const savedGoals = localStorage.getItem(STORAGE_KEY_GOALS);
    const savedDayTasks = localStorage.getItem(STORAGE_KEY_DAY_TASKS);

    if (savedUser) {
       setUserProfile(JSON.parse(savedUser));
       if (savedDob) {
         setBirthDate(savedDob);
         if (savedStatus) setUserStatus(savedStatus as UserStatus);
         if (savedGoals) setGoals(JSON.parse(savedGoals));
         if (savedDayTasks) setDayTasks(JSON.parse(savedDayTasks));
         setView(CalendarView.CALENDAR);
       } else {
         setView(CalendarView.ONBOARDING);
       }
    }
  }, []);

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
    if (birthDate) {
        setView(CalendarView.CALENDAR);
    } else {
        setView(CalendarView.ONBOARDING);
    }
  };

  const handleOnboardingComplete = (date: string, status: UserStatus) => {
    setBirthDate(date);
    setUserStatus(status);
    localStorage.setItem(STORAGE_KEY_DOB, date);
    localStorage.setItem(STORAGE_KEY_STATUS, status);
    setView(CalendarView.CALENDAR);
  };

  const handleLogout = () => {
    if (confirm('TERMINATE SESSION? DATA WILL BE PURGED FROM THIS VIEW.')) {
        localStorage.clear();
        setBirthDate('');
        setGoals({});
        setDayTasks({});
        setAiAnalysis(null);
        setUserProfile(null);
        setShowProfileMenu(false);
        setView(CalendarView.LOGIN);
    }
  };

  const calculateYearsRemaining = () => {
    if (!birthDate) return 0;
    const start = new Date(birthDate);
    const now = new Date();
    const ageInMilliseconds = now.getTime() - start.getTime();
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, 90 - ageInYears);
  };

  // FEATURE: Calculate exact age at a specific week
  const calculateAgeAtWeek = (yearIndex: number, weekIndex: number) => {
      const weeksTotal = (yearIndex * 52) + weekIndex;
      const age = weeksTotal / 52;
      return age.toFixed(1);
  };

  const getWeekDateRange = (yearIndex: number, weekIndex: number) => {
    if (!birthDate) return { start: new Date(), end: new Date() };
    const dob = new Date(birthDate);
    const totalWeeks = yearIndex * 52 + (weekIndex - 1);
    const startDate = new Date(dob.getTime() + totalWeeks * 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    return { start: startDate, end: endDate };
  };

  const generateGoogleCalendarLink = (text: string, startDate: Date, endDate: Date) => {
    const formatGCalDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, 8);
    const startStr = formatGCalDate(startDate);
    const endStr = formatGCalDate(new Date(endDate.getTime() + 24 * 60 * 60 * 1000));
    const details = `Goal from Life Calendar AI\n\nStatus: Pending\n\nIMPORTANT: Use the 'Add Notification' feature in Google Calendar to set a reminder for this week!`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Goal: " + text)}&details=${encodeURIComponent(details)}&dates=${startStr}/${endStr}`;
  };

  const handleSaveGoal = () => {
    if (!selectedWeek || !currentGoalText.trim()) return;
    const key = `${selectedWeek.year}-${selectedWeek.week}`;
    const newGoal: WeeklyGoal = {
        id: key,
        text: currentGoalText,
        isCompleted: false
    };
    
    const updatedGoals = { ...goals, [key]: newGoal };
    setGoals(updatedGoals);
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(updatedGoals));
    setCurrentGoalText('');
  };

  const handleDayTaskUpdate = (index: number, task: DayTask | null) => {
      const updatedDayTasks = { ...dayTasks };
      if (task) {
          updatedDayTasks[index.toString()] = task;
      } else {
          delete updatedDayTasks[index.toString()];
      }
      setDayTasks(updatedDayTasks);
      localStorage.setItem(STORAGE_KEY_DAY_TASKS, JSON.stringify(updatedDayTasks));
  };

  const handleToggleGoal = (key: string) => {
    if (!goals[key]) return;
    const updatedGoals = { 
        ...goals, 
        [key]: { ...goals[key], isCompleted: !goals[key].isCompleted } 
    };
    setGoals(updatedGoals);
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(updatedGoals));
  };

  const handleDeleteGoal = (key: string) => {
    const updatedGoals = { ...goals };
    delete updatedGoals[key];
    setGoals(updatedGoals);
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(updatedGoals));
  };

  const getWeekDecay = () => {
      const now = new Date();
      const currentDay = now.getDay(); 
      const currentHour = now.getHours();
      const totalHoursInWeek = 7 * 24;
      const hoursGone = (currentDay * 24) + currentHour;
      return Math.round((hoursGone / totalHoursInWeek) * 100);
  };

  if (view === CalendarView.LOGIN) {
      return <Login onLogin={handleLogin} />;
  }

  if (view === CalendarView.ONBOARDING) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const selectedWeekDateRange = selectedWeek 
    ? getWeekDateRange(selectedWeek.year, selectedWeek.week) 
    : { start: new Date(), end: new Date() };

  return (
    <div className="min-h-screen bg-life-paper flex flex-col items-center pb-48 relative font-sans text-life-ink">
      
      {/* SCARCITY BAR (LIFE PROGRESS) - Fixed Top */}
      <div className="fixed top-0 left-0 w-full z-[60] flex flex-col pointer-events-none">
        <div className="h-2 w-full bg-gray-300">
           <div 
             className="h-full bg-life-ink transition-all duration-100 ease-out shadow-[0_0_15px_rgba(0,0,0,0.8)]" 
             style={{ width: `${lifePercentage}%` }}
           />
        </div>
        <div className="flex justify-between px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-mono font-bold text-red-600 uppercase border-b border-gray-300">
           <span className="flex items-center gap-2"><Clock className="w-3 h-3 animate-pulse" /> TIME IS LEAKING</span>
           <span className="animate-pulse font-black">DEATH IMMINENT</span>
        </div>
      </div>

      {/* HEADER */}
      <header className="w-full max-w-[1400px] px-4 md:px-6 py-8 flex flex-col gap-6 z-20 mt-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-life-ink pb-6 relative">
            <Terminal className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" />
            <div className="flex flex-col">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-life-ink flex items-center gap-3">
                MEMENTO<br className="md:hidden"/>MORI 
                <Skull className="w-8 h-8 md:w-16 md:h-16 animate-pulse text-life-ink" />
              </h1>
              <div className="flex flex-col mt-4 border-l-4 border-life-accent pl-4">
                  <p className="text-xs font-mono uppercase tracking-widest text-life-ink font-bold">
                    Subject: {userProfile?.name}
                  </p>
                  <p className="text-xs font-mono uppercase tracking-widest text-gray-600">
                    Status: {userStatus} • Active • Decaying
                  </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex bg-white border-2 border-life-ink shadow-hard-sm p-1">
                    <button 
                        onClick={() => setMode('LIFE')}
                        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'LIFE' ? 'bg-life-ink text-white' : 'text-gray-400 hover:text-life-ink'}`}
                    >
                        <LayoutGrid className="w-3 h-3" /> Macro
                    </button>
                    <button 
                        onClick={() => setMode('DAY')}
                        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'DAY' ? 'bg-life-ink text-white' : 'text-gray-400 hover:text-life-ink'}`}
                    >
                        <Sun className="w-3 h-3" /> Micro
                    </button>
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="w-10 h-10 border-2 border-life-ink bg-white hover:bg-life-ink hover:text-white transition-colors flex items-center justify-center shadow-hard-sm"
                    >
                        <User className="w-5 h-5" />
                    </button>
                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-life-ink shadow-hard z-50 p-4">
                             <p className="text-xs font-bold uppercase tracking-wider border-b border-gray-200 pb-2 mb-2">Identify</p>
                             <div className="flex items-center gap-3 mb-4">
                                {userProfile?.avatarUrl && <img src={userProfile.avatarUrl} className="w-8 h-8 rounded-full border border-black" />}
                                <div className="overflow-hidden">
                                    <p className="font-bold truncate text-sm">{userProfile?.name}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{userProfile?.email}</p>
                                </div>
                             </div>
                             <button onClick={handleLogout} className="w-full border-2 border-life-accent text-life-accent font-bold py-2 text-xs uppercase hover:bg-life-accent hover:text-white transition-colors flex items-center justify-center gap-2">
                                 <LogOut className="w-3 h-3" /> Terminate
                             </button>
                        </div>
                    )}
                    {showProfileMenu && (
                        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                    )}
                </div>
            </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 font-mono">
            {/* Countdown Box */}
            <div className="md:col-span-1 bg-life-ink text-white p-4 shadow-hard flex flex-col justify-between min-h-[120px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-life-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="text-[9px] uppercase font-bold text-gray-500 flex justify-between items-center z-10">
                    <span>{mode === 'LIFE' ? 'Total Entropy' : 'Daily Entropy'}</span>
                    <Activity className="w-3 h-3 text-life-accent animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="text-4xl lg:text-5xl font-black tracking-tighter tabular-nums leading-none mt-2 animate-glitch relative z-10">
                    {secondsRemaining.toLocaleString()}
                    <span className="text-sm lg:text-lg text-red-500 ml-1 absolute -top-1 opacity-70">.{millisecondsRemaining.toString().padStart(3, '0')}</span>
                </div>
                <div className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest z-10 flex gap-2">
                   Seconds Remaining 
                   <span className="text-life-accent animate-pulse">• LIVE</span>
                </div>
            </div>

            {/* Fact Box */}
            <div className="md:col-span-2 bg-white border-2 border-life-ink p-4 shadow-hard flex flex-col justify-center relative overflow-hidden group min-h-[120px]">
                 <div className="absolute top-0 right-0 p-2 opacity-5">
                    <AlertOctagon className="w-24 h-24" />
                 </div>
                 <div className="text-[9px] uppercase font-bold text-life-accent mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-life-accent rounded-full animate-pulse"></span>
                    Reality Check
                 </div>
                 <div className="text-xl md:text-3xl font-black leading-none font-sans italic uppercase tracking-tight text-life-ink">
                    "{FACTS[currentFactIndex]}"
                 </div>
                 <div className="mt-3 w-full bg-gray-100 h-1 overflow-hidden">
                    <div key={currentFactIndex} className="h-full bg-life-ink w-full origin-left animate-[shimmer_3s_linear]"></div>
                 </div>
            </div>
        </div>
      </header>

      {/* Main Grid Container */}
      <main className="w-full max-w-[1400px] px-2 md:px-6 overflow-x-hidden flex justify-center mt-2 pb-20">
        {mode === 'LIFE' ? (
             <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-x-auto grid-scroll">
                 <div className="min-w-[600px] md:min-w-0">
                    <div className="flex justify-between items-end mb-2 px-2 sticky left-0">
                        <GridHeader />
                        <button 
                            onClick={() => setShowStages(!showStages)}
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 border-2 transition-all ${showStages ? 'bg-life-ink text-white border-life-ink' : 'border-gray-200 text-gray-400 hover:border-life-ink hover:text-life-ink'}`}
                        >
                            {showStages ? 'Hide Stages' : 'Show Stages'}
                        </button>
                    </div>
                    <LifeGrid 
                        birthDate={birthDate} 
                        userStatus={userStatus}
                        aiImpact={aiAnalysis} 
                        showStages={showStages}
                        goals={goals}
                        onWeekClick={(year, week) => {
                            setSelectedWeek({year, week});
                            setCurrentGoalText(''); 
                        }}
                    />
                 </div>
             </div>
        ) : (
            <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-500">
                <DayGrid tasks={dayTasks} onTaskUpdate={handleDayTaskUpdate} />
            </div>
        )}
      </main>

      {/* Footer Credits - Nagendra Attribution */}
      <footer className="w-full py-8 bg-life-ink text-white text-center mt-auto border-t-4 border-life-accent relative overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-20"></div>
          <div className="flex flex-col items-center justify-center gap-2 relative z-10">
             <div className="border-2 border-white px-4 py-2 flex items-center gap-2 hover:bg-white hover:text-life-ink transition-colors cursor-default group">
                <Fingerprint className="w-4 h-4" />
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
                    System Architect: Nagendra
                </p>
             </div>
             <p className="text-[8px] text-gray-500 font-mono">ALL RIGHTS RESERVED • MEMENTO MORI PROTOCOL v2.1</p>
          </div>
      </footer>

      {/* Selected Week Modal (Life Mode Only) */}
      {selectedWeek && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedWeek(null)}>
            <div className="bg-white border-2 border-life-ink shadow-[0_0_50px_rgba(255,0,0,0.2)] p-6 max-w-sm w-full animate-in zoom-in-95 duration-200 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-life-paper -mr-10 -mt-10 rotate-45 border-b-2 border-life-ink"></div>
                
                <div className="flex justify-between items-start mb-6 border-b-4 border-life-ink pb-4">
                    <div>
                        <h3 className="text-4xl font-black font-sans tracking-tighter">WEEK {selectedWeek.week}</h3>
                        <div className="flex flex-col gap-1 mt-1">
                            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Year {selectedWeek.year} • {calculateYearsRemaining() > 0 ? 'Remaining' : 'Void'}</p>
                            {/* FEATURE: Future Age Projection */}
                            <p className="text-xs font-mono font-bold text-life-ink uppercase tracking-widest bg-gray-100 px-1 w-fit">
                                Projected Age: {calculateAgeAtWeek(selectedWeek.year, selectedWeek.week)} Yrs
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedWeek(null)} className="z-10 p-2 hover:bg-life-ink hover:text-white transition-colors border-2 border-transparent hover:border-life-ink">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-6 bg-gray-100 p-4 border-l-4 border-life-ink">
                   <div className="flex justify-between items-center text-[9px] font-bold uppercase text-gray-500 mb-2">
                      <span>Entropy Level</span>
                      <span className="text-life-accent">{getWeekDecay()}% Gone</span>
                   </div>
                   <div className="w-full h-3 bg-gray-300 border border-gray-400">
                       <div className="h-full bg-life-ink" style={{ width: `${getWeekDecay()}%` }}></div>
                   </div>
                </div>
                
                {goals[`${selectedWeek.year}-${selectedWeek.week}`] ? (
                    <div className="bg-white p-4 border-2 border-life-ink mb-4 relative group shadow-hard-sm">
                        <div className="flex items-start gap-4">
                            <button 
                                onClick={() => handleToggleGoal(`${selectedWeek.year}-${selectedWeek.week}`)}
                                className={`mt-1 w-6 h-6 border-2 flex items-center justify-center transition-all ${goals[`${selectedWeek.year}-${selectedWeek.week}`].isCompleted ? 'bg-life-ink border-life-ink text-white' : 'border-life-ink hover:bg-gray-100'}`}
                            >
                                {goals[`${selectedWeek.year}-${selectedWeek.week}`].isCompleted && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <div className="flex-1">
                                <p className={`text-lg font-bold leading-tight ${goals[`${selectedWeek.year}-${selectedWeek.week}`].isCompleted ? 'line-through text-gray-300' : 'text-life-ink'}`}>
                                    {goals[`${selectedWeek.year}-${selectedWeek.week}`].text}
                                </p>
                            </div>
                            <button 
                                onClick={() => handleDeleteGoal(`${selectedWeek.year}-${selectedWeek.week}`)}
                                className="text-gray-300 hover:text-life-accent transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <a 
                            href={generateGoogleCalendarLink(goals[`${selectedWeek.year}-${selectedWeek.week}`].text, selectedWeekDateRange.start, selectedWeekDateRange.end)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:border-black transition-all"
                        >
                            <Bell className="w-3.5 h-3.5" />
                            Sync Protocol
                        </a>
                    </div>
                ) : (
                    <div className="mb-4">
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Define Mission Objective
                        </label>
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={currentGoalText}
                                    maxLength={60}
                                    onChange={(e) => setCurrentGoalText(e.target.value)}
                                    placeholder="Enter directive..."
                                    className="w-full p-4 border-2 border-life-ink focus:ring-2 focus:ring-life-accent focus:outline-none text-base font-bold bg-white font-mono"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                                />
                            </div>
                            
                            <button 
                                onClick={handleSaveGoal}
                                disabled={!currentGoalText.trim()}
                                className="w-full bg-life-ink text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-life-accent transition-colors disabled:opacity-50 border-2 border-transparent hover:border-black"
                            >
                                Commit to Database
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* AI Panel */}
      <AnalysisPanel 
        yearsRemaining={calculateYearsRemaining()} 
        userStatus={userStatus}
        userName={userProfile?.name}
        onAnalysisComplete={setAiAnalysis}
      />
    </div>
  );
}