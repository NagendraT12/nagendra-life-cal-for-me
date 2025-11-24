import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, BrainCircuit, AlertTriangle, GripHorizontal, Lightbulb, MessageSquare, Bot, X, Hourglass, Send, History, Scale, ClipboardCheck, Skull, Trophy, Swords, Ghost, MonitorPlay, LayoutGrid, ArrowLeft, HeartPulse } from 'lucide-react';
import { analyzeHabitImpact, askLifeOracle, chatWithFutureSelf, runSimulation, SimulationResult, auditTasks, AuditResult, findRivals, RivalsResult, generateObituary, ObituaryResult } from '../services/geminiService';
import { AIAnalysisResult, UserStatus, LifeOracleResponse } from '../types';

interface AnalysisPanelProps {
  yearsRemaining: number;
  userStatus: UserStatus;
  userName?: string;
  onAnalysisComplete: (result: AIAnalysisResult | null) => void;
}

type PanelView = 'MENU' | 'CALCULATOR' | 'ORACLE' | 'CHRONO' | 'SIMULATION' | 'AUDIT' | 'RIVALS' | 'OBITUARY';

// Typewriter Component - Fixed for Perfect Rendering
const Typewriter = ({ text, speed = 10 }: { text: string, speed?: number }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= text.length) {
        setDisplayText(text.slice(0, i)); // Slice ensures no duplicated characters
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayText}</span>;
};

// Menu Button extracted for performance and stability
const MenuButton = ({ id, label, icon: Icon, desc, onClick }: { id: PanelView, label: string, icon: any, desc: string, onClick: (id: PanelView) => void }) => (
  <button 
      type="button"
      onClick={() => onClick(id)}
      className="flex flex-col items-start justify-start p-3 bg-white border-2 border-gray-200 hover:border-life-ink hover:bg-gray-50 hover:shadow-hard-sm transition-all h-full text-left group active:scale-95 active:bg-gray-100 cursor-pointer w-full"
  >
      <div className="flex items-center gap-2 mb-1 w-full border-b border-transparent group-hover:border-gray-200 pb-1 pointer-events-none">
          <Icon className="w-4 h-4 text-life-ink" />
          <span className="font-black text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-[9px] text-gray-500 font-mono leading-tight pointer-events-none">{desc}</p>
  </button>
);

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ yearsRemaining, userStatus, userName, onAnalysisComplete }) => {
  const [currentView, setCurrentView] = useState<PanelView>('MENU');
  const [isOpen, setIsOpen] = useState(true); 
  
  // Calculator State
  const [activity, setActivity] = useState('');
  const [hours, setHours] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  // Oracle State
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleResponse, setOracleResponse] = useState<LifeOracleResponse | null>(null);

  // Chrono-Link (Chat) State
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [targetAge, setTargetAge] = useState<number>(90);

  // Simulation State
  const [simScenario, setSimScenario] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  // Audit State
  const [auditTasksInput, setAuditTasksInput] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Rivals State
  const [rivalsLoading, setRivalsLoading] = useState(false);
  const [rivalsResult, setRivalsResult] = useState<RivalsResult | null>(null);

  // Obituary State
  const [obitLoading, setObitLoading] = useState(false);
  const [obitResult, setObitResult] = useState<ObituaryResult | null>(null);

  // Dragging State
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 600 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     const initialX = window.innerWidth > 768 ? window.innerWidth - 420 : 16;
     const initialY = window.innerHeight > 650 ? window.innerHeight - 650 : 80;
     setPosition({ x: initialX, y: initialY });
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, currentView]);

  // Mouse Start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  // Touch Start
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = Math.min(Math.max(0, dragRef.current.initialX + dx), window.innerWidth - 300);
      const newY = Math.min(Math.max(0, dragRef.current.initialY + dy), window.innerHeight - 100);
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault(); 
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      const newX = Math.min(Math.max(0, dragRef.current.initialX + dx), window.innerWidth - 300);
      const newY = Math.min(Math.max(0, dragRef.current.initialY + dy), window.innerHeight - 100);
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || yearsRemaining <= 0) return;
    setLoading(true);
    onAnalysisComplete(null); 
    setResult(null);
    try {
      const analysis = await analyzeHabitImpact(activity, hours, yearsRemaining, userStatus, userName);
      setResult(analysis);
      onAnalysisComplete(analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOracleAsk = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!oracleQuery.trim()) return;
      setOracleLoading(true);
      setOracleResponse(null);
      try {
          const context = `User has ${yearsRemaining.toFixed(1)} years remaining. Status: ${userStatus}.`;
          const response = await askLifeOracle(oracleQuery, context, userName);
          setOracleResponse(response);
      } catch (err) {
          console.error(err);
      } finally {
          setOracleLoading(false);
      }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      
      const newMessage = chatInput;
      setChatInput('');
      setChatHistory(prev => [...prev, { role: 'user', text: newMessage }]);
      setChatLoading(true);

      try {
          const responseText = await chatWithFutureSelf(
              chatHistory,
              newMessage,
              targetAge,
              userName || 'User',
              yearsRemaining,
              userStatus
          );
          setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
      } catch (err) {
          console.error(err);
      } finally {
          setChatLoading(false);
      }
  };

  const handleSimulation = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!simScenario.trim()) return;
      setSimLoading(true);
      setSimResult(null);
      try {
          const res = await runSimulation(simScenario, yearsRemaining, userStatus);
          setSimResult(res);
      } catch (err) {
          console.error(err);
      } finally {
          setSimLoading(false);
      }
  };

  const handleAudit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auditTasksInput.trim()) return;
      setAuditLoading(true);
      setAuditResult(null);
      try {
          const res = await auditTasks(auditTasksInput, yearsRemaining);
          setAuditResult(res);
      } catch (err) {
          console.error(err);
      } finally {
          setAuditLoading(false);
      }
  };

  const handleFetchRivals = async () => {
      setRivalsLoading(true);
      setRivalsResult(null);
      try {
          const currentAge = 90 - yearsRemaining;
          const res = await findRivals(currentAge);
          setRivalsResult(res);
      } catch (err) {
          console.error(err);
      } finally {
          setRivalsLoading(false);
      }
  };

  const handleGenerateObituary = async () => {
      setObitLoading(true);
      setObitResult(null);
      try {
          const res = await generateObituary(userName || 'Traveler', userStatus, yearsRemaining);
          setObitResult(res);
      } catch (err) {
          console.error(err);
      } finally {
          setObitLoading(false);
      }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[70] bg-life-ink text-white p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(255,0,0,1)] border-2 border-white animate-bounce active:scale-90 transition-transform"
      >
        <BrainCircuit className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div 
        ref={panelRef}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed w-[95vw] max-w-[400px] z-[70]"
    >
      <div className="bg-white border-2 border-life-ink shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[80vh] transition-shadow duration-300 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Header / Drag Handle */}
        <div 
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="bg-life-ink text-white p-3 cursor-move active:cursor-grabbing flex justify-between items-center select-none shrink-0 border-b-2 border-white relative overflow-hidden"
        >
            {/* Animated Background for Header */}
            <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-2 text-sm font-bold pl-2 uppercase tracking-wider z-10">
                <BrainCircuit className="w-4 h-4 text-life-accent" />
                AI Cortex <span className="text-gray-400 text-[9px] ml-1 font-mono">v9.2</span>
            </div>
            <div className="flex items-center gap-4 z-10">
                {currentView !== 'MENU' && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setCurrentView('MENU'); }} 
                        className="text-gray-400 hover:text-white flex items-center gap-1 text-[9px] font-bold uppercase cursor-pointer active:text-life-accent"
                        onTouchEnd={(e) => { e.stopPropagation(); setCurrentView('MENU'); }}
                    >
                        <ArrowLeft className="w-4 h-4" /> Menu
                    </button>
                )}
                <GripHorizontal className="w-5 h-5 text-gray-400 hidden md:block" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                  className="text-gray-400 hover:text-white cursor-pointer active:scale-90 transition-transform"
                  onTouchEnd={(e) => { e.stopPropagation(); setIsOpen(false); }}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-4 overflow-y-auto custom-scrollbar bg-life-paper min-h-[400px] touch-auto" onTouchStart={(e) => e.stopPropagation()}>
            
            {currentView === 'MENU' && (
                <div className="animate-in fade-in slide-in-from-left duration-300">
                    <div className="mb-4 border-l-2 border-life-ink pl-3">
                        <p className="text-[10px] font-mono font-bold uppercase text-gray-400">Select Module</p>
                        <h3 className="text-lg font-black text-life-ink leading-none">SYSTEM READY</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <MenuButton onClick={setCurrentView} id="CALCULATOR" label="Entropy" icon={Hourglass} desc="Calculate habit impact on lifespan." />
                        <MenuButton onClick={setCurrentView} id="CHRONO" label="Chrono-Link" icon={Ghost} desc="Chat with your future self." />
                        <MenuButton onClick={setCurrentView} id="SIMULATION" label="Multiverse" icon={MonitorPlay} desc="Simulate alternate reality timelines." />
                        <MenuButton onClick={setCurrentView} id="RIVALS" label="Rivals" icon={Swords} desc="Compare against historical titans." />
                        <MenuButton onClick={setCurrentView} id="AUDIT" label="Audit" icon={Scale} desc="Ruthless to-do list prioritization." />
                        <MenuButton onClick={setCurrentView} id="OBITUARY" label="Legacy" icon={Skull} desc="Generate your projected obituary." />
                        <div className="col-span-2">
                            <MenuButton onClick={setCurrentView} id="ORACLE" label="The Oracle" icon={Bot} desc="Philosophical guidance system." />
                        </div>
                    </div>
                </div>
            )}

            {currentView === 'CALCULATOR' && (
                <div className="animate-in zoom-in-95 duration-200">
                    {!result ? (
                    <form onSubmit={handleAnalyze} className="space-y-4">
                        <p className="text-xs font-mono text-gray-600 leading-relaxed border-l-2 border-life-ink pl-2 mb-4">
                            INPUT ACTIVITY TO CALCULATE LIFE CONSUMPTION.
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-life-ink mb-1">Activity</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Doomscrolling"
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
                                    className="w-full p-3 border-2 border-life-ink focus:ring-2 focus:ring-life-accent focus:outline-none font-mono text-sm bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-life-ink mb-1">Hours / Day</label>
                                <input
                                    type="number"
                                    min="0.1"
                                    max="24"
                                    step="0.5"
                                    value={hours}
                                    onChange={(e) => setHours(parseFloat(e.target.value))}
                                    className="w-full p-3 border-2 border-life-ink focus:ring-2 focus:ring-life-accent focus:outline-none font-mono text-sm bg-white"
                                />
                            </div>
                        </div>
                        <button
                        type="submit"
                        disabled={loading || !activity}
                        className="w-full bg-life-ink text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-life-accent transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 border-2 border-transparent hover:border-black cursor-pointer"
                        >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Visualize Impact
                        </button>
                    </form>
                    ) : (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 mb-4 bg-white p-3 border-2 border-life-ink shadow-sm">
                            <div className={`p-2 shrink-0 ${result.tone === 'warning' ? 'text-red-600' : 'text-green-600'}`}>
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-black text-2xl font-mono">{result.weeksConsumed} WEEKS</h4>
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wide">
                                    Total Future Deduction
                                </p>
                            </div>
                        </div>
                        <div className={`p-4 border-l-4 mb-4 ${result.tone === 'warning' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                            <p className="text-sm font-bold font-mono leading-relaxed">
                                <Typewriter text={`"${result.impactDescription}"`} />
                            </p>
                        </div>
                        
                        <div className="bg-white p-3 border-2 border-life-ink mb-3">
                            <div className="flex items-center justify-between mb-2 border-b border-gray-200 pb-1">
                                <div className="flex items-center gap-2 text-life-ink">
                                    <HeartPulse className="w-4 h-4" />
                                    <h5 className="text-[10px] font-black uppercase">Psycho-Analysis</h5>
                                </div>
                                <div className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                                    result.stressLevel === 'high' ? 'bg-red-600 text-white' :
                                    result.stressLevel === 'medium' ? 'bg-orange-400 text-white' :
                                    'bg-green-600 text-white'
                                }`}>
                                    Stress: {result.stressLevel}
                                </div>
                            </div>
                            <p className="text-xs font-mono text-gray-700 leading-relaxed">
                                <span className="font-bold text-gray-400 text-[10px] uppercase block mb-1">Burnout Risk Assessment:</span>
                                <Typewriter text={result.burnoutRisk} speed={10} />
                            </p>
                        </div>

                        <div className="mb-3 bg-white p-3 border-2 border-life-ink">
                            <div className="flex items-center gap-2 mb-2 text-life-ink">
                                <Lightbulb className="w-4 h-4" />
                                <h5 className="text-[10px] font-black uppercase">Protocol</h5>
                            </div>
                            <p className="text-xs font-mono text-gray-700 leading-relaxed"><Typewriter text={result.advice} speed={5} /></p>
                        </div>
                        <button onClick={() => { setResult(null); onAnalysisComplete(null); }} className="w-full text-center text-xs font-bold underline text-gray-400 hover:text-life-ink mt-2 cursor-pointer">
                            Reset System
                        </button>
                    </div>
                    )}
                </div>
            )}

            {currentView === 'CHRONO' && (
                <div className="flex flex-col h-[400px]">
                    {/* Chat Header/Selector */}
                    <div className="border-b border-gray-200 pb-2 mb-2 bg-white p-2 border-2 border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                                <Ghost className="w-4 h-4 text-life-ink" />
                                <span className="text-xs font-bold uppercase">Target Age</span>
                             </div>
                             <span className="text-[10px] font-mono bg-life-ink text-white px-2 py-1">Age: {targetAge}</span>
                        </div>
                        <input 
                            type="range" 
                            min="25" 
                            max="90" 
                            step="5"
                            value={targetAge}
                            onChange={(e) => { setTargetAge(parseInt(e.target.value)); setChatHistory([]); }}
                            className="w-full h-1 bg-gray-200 appearance-none cursor-pointer accent-life-ink"
                        />
                        <div className="flex justify-between text-[8px] text-gray-400 font-mono uppercase mt-1">
                            <span>Younger</span>
                            <span>Future</span>
                            <span>Death</span>
                        </div>
                    </div>

                    {/* Chat History */}
                    <div ref={chatScrollRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 mb-2 p-2 border-2 border-gray-200 bg-white">
                        {chatHistory.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <Hourglass className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-[10px] uppercase tracking-widest">Connection Established</p>
                                <p className="text-[9px] font-mono mt-1">Subject: You (Age {targetAge})</p>
                            </div>
                        )}
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 text-xs font-mono border-2 shadow-sm ${msg.role === 'user' ? 'bg-life-ink text-white border-life-ink' : 'bg-gray-50 text-black border-gray-200'}`}>
                                    {msg.role === 'model' ? <Typewriter text={msg.text} speed={10} /> : msg.text}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border-2 border-gray-200 p-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Send message across time..."
                            className="flex-1 p-3 border-2 border-life-ink focus:outline-none text-xs font-mono bg-white"
                        />
                        <button 
                            type="submit" 
                            disabled={chatLoading || !chatInput}
                            className="bg-life-ink text-white p-3 border-2 border-life-ink hover:bg-gray-800 cursor-pointer active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {currentView === 'SIMULATION' && (
                <div className="flex flex-col min-h-[300px]">
                    {!simResult ? (
                        <>
                            <div className="mb-4">
                                <h3 className="text-sm font-black uppercase mb-1 flex items-center gap-2">
                                    <MonitorPlay className="w-4 h-4" /> Multiverse Engine
                                </h3>
                                <p className="text-xs font-mono text-gray-500">
                                    Enter a "What if" scenario. AI will simulate your alternate reality.
                                </p>
                            </div>
                            <form onSubmit={handleSimulation} className="flex-1 flex flex-col gap-3">
                                <textarea 
                                    value={simScenario}
                                    onChange={(e) => setSimScenario(e.target.value)}
                                    placeholder="e.g., What if I started coding 5 years ago?&#10;What if I invested in Bitcoin?"
                                    className="w-full flex-1 p-3 border-2 border-life-ink focus:outline-none text-sm resize-none bg-white font-mono placeholder:text-gray-300 min-h-[100px]"
                                />
                                <button 
                                    type="submit"
                                    disabled={simLoading || !simScenario}
                                    className="w-full bg-life-ink text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-life-accent flex items-center justify-center gap-2 transition-all border-2 border-transparent hover:border-black cursor-pointer active:scale-98"
                                >
                                    {simLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    Run Simulation
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="animate-in zoom-in-95 duration-500 space-y-4">
                             <div className="bg-black text-white p-4 border-2 border-life-accent relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-2 opacity-20">
                                     <MonitorPlay className="w-16 h-16" />
                                 </div>
                                 <span className="text-[9px] font-bold uppercase text-life-accent block mb-2 animate-pulse">Simulation Output</span>
                                 <p className="font-mono text-sm leading-relaxed relative z-10">
                                     <Typewriter text={simResult.timelineDescription} speed={20} />
                                 </p>
                             </div>

                             <div className="grid grid-cols-2 gap-2">
                                 <div className="bg-white border-2 border-gray-200 p-2 text-center shadow-sm">
                                     <p className="text-[9px] font-bold uppercase text-gray-400">Net Worth Delta</p>
                                     <p className={`font-black text-lg ${simResult.netWorthDelta.includes('-') ? 'text-red-500' : 'text-green-500'}`}>
                                         {simResult.netWorthDelta}
                                     </p>
                                 </div>
                                 <div className="bg-white border-2 border-gray-200 p-2 text-center shadow-sm">
                                     <p className="text-[9px] font-bold uppercase text-gray-400">Happiness</p>
                                     <p className="font-black text-lg text-life-ink">{simResult.happinessScore}/100</p>
                                 </div>
                             </div>

                             <div className="bg-gray-100 p-2 text-center border-2 border-gray-200">
                                 <p className="text-[9px] font-bold uppercase text-gray-400">Location</p>
                                 <p className="font-bold font-mono text-xs uppercase">{simResult.location}</p>
                             </div>

                             <button 
                                onClick={() => { setSimResult(null); setSimScenario(''); }}
                                className="w-full text-center text-xs font-bold underline text-gray-400 hover:text-life-ink mt-2 cursor-pointer"
                             >
                                Try Another Timeline
                             </button>
                        </div>
                    )}
                </div>
            )}

            {currentView === 'RIVALS' && (
                <div className="flex flex-col min-h-[300px]">
                     {!rivalsResult ? (
                         <>
                            <div className="mb-4">
                                <h3 className="text-sm font-black uppercase mb-1 flex items-center gap-2">
                                    <Swords className="w-4 h-4" /> Peer Pressure Protocol
                                </h3>
                                <p className="text-xs font-mono text-gray-500">
                                    See what titans of history achieved at your EXACT age. Warning: Causes extreme insufficiency.
                                </p>
                            </div>
                            <button 
                                onClick={handleFetchRivals}
                                disabled={rivalsLoading}
                                className="mt-4 w-full bg-life-ink text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-life-accent flex items-center justify-center gap-2 transition-all border-2 border-transparent hover:border-black cursor-pointer active:scale-98"
                            >
                                {rivalsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                                Compare Me
                            </button>
                         </>
                     ) : (
                        <div className="animate-in slide-in-from-right duration-300 space-y-3">
                            <p className="text-[10px] font-bold uppercase text-life-accent text-center mb-2">At Age {(90 - yearsRemaining).toFixed(1)}...</p>
                            
                            {[rivalsResult.person1, rivalsResult.person2, rivalsResult.person3].map((person, i) => (
                                <div key={i} className="bg-white border-2 border-life-ink p-3 shadow-hard-sm">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-black uppercase">{person.name}</span>
                                        <span className="text-[10px] text-gray-400 font-mono">AGE {(90-yearsRemaining).toFixed(0)}</span>
                                    </div>
                                    <p className="text-xs font-mono text-gray-700 mt-1 leading-tight"><Typewriter text={person.achievement} speed={10} /></p>
                                </div>
                            ))}

                            <div className="bg-black text-white p-3 mt-4 border-2 border-red-600">
                                <p className="text-xs font-mono font-bold uppercase text-red-500 mb-1">Verdict</p>
                                <p className="text-sm font-bold leading-tight">"<Typewriter text={rivalsResult.summary} speed={20} />"</p>
                            </div>

                            <button 
                                onClick={() => setRivalsResult(null)}
                                className="w-full text-center text-xs font-bold underline text-gray-400 hover:text-life-ink mt-4 cursor-pointer"
                             >
                                Retake Comparison
                             </button>
                        </div>
                     )}
                </div>
            )}

            {currentView === 'OBITUARY' && (
                 <div className="flex flex-col min-h-[300px]">
                     {!obitResult ? (
                         <>
                            <div className="mb-4">
                                <h3 className="text-sm font-black uppercase mb-1 flex items-center gap-2">
                                    <Skull className="w-4 h-4" /> Legacy Engine
                                </h3>
                                <p className="text-xs font-mono text-gray-500">
                                    Generate your obituary if you died today vs. if you fulfilled your potential.
                                </p>
                            </div>
                            <button 
                                onClick={handleGenerateObituary}
                                disabled={obitLoading}
                                className="mt-4 w-full bg-life-ink text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-life-accent flex items-center justify-center gap-2 transition-all border-2 border-transparent hover:border-black cursor-pointer active:scale-98"
                            >
                                {obitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Skull className="w-4 h-4" />}
                                Generate Obituary
                            </button>
                         </>
                     ) : (
                        <div className="animate-in zoom-in-95 duration-500 space-y-4">
                            <div className="bg-gray-100 border-2 border-gray-300 p-4 grayscale opacity-70">
                                <div className="flex items-center gap-2 mb-2 border-b border-gray-300 pb-1">
                                    <Skull className="w-3 h-3 text-gray-500" />
                                    <span className="text-[10px] font-bold uppercase text-gray-500">If you died today</span>
                                </div>
                                <p className="text-xs font-serif italic text-gray-600 leading-relaxed">
                                    "<Typewriter text={obitResult.currentObituary} speed={5} />"
                                </p>
                            </div>

                            <div className="bg-white border-2 border-life-accent p-4 shadow-glow">
                                <div className="flex items-center gap-2 mb-2 border-b border-life-accent pb-1">
                                    <Trophy className="w-3 h-3 text-life-accent" />
                                    <span className="text-[10px] font-bold uppercase text-life-accent">Potential Future</span>
                                </div>
                                <p className="text-xs font-serif font-bold text-life-ink leading-relaxed">
                                    "<Typewriter text={obitResult.potentialObituary} speed={5} />"
                                </p>
                            </div>

                            <div className="text-center px-4">
                                <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-1">GAP ANALYSIS</p>
                                <p className="text-xs font-mono font-bold">"{obitResult.gapAnalysis}"</p>
                            </div>

                            <button 
                                onClick={() => setObitResult(null)}
                                className="w-full text-center text-xs font-bold underline text-gray-400 hover:text-life-ink mt-4 cursor-pointer"
                             >
                                Accept Reality
                             </button>
                        </div>
                     )}
                 </div>
            )}

            {currentView === 'AUDIT' && (
                <div className="flex flex-col min-h-[300px]">
                    {!auditResult ? (
                        <>
                            <div className="mb-4">
                                <h3 className="text-sm font-black uppercase mb-1 flex items-center gap-2">
                                    <Scale className="w-4 h-4" /> Entropy Audit
                                </h3>
                                <p className="text-xs font-mono text-gray-500">
                                    Paste your task list. AI will ruthlessly identify what matters vs. what is killing your time.
                                </p>
                            </div>
                            <form onSubmit={handleAudit} className="flex-1 flex flex-col gap-3">
                                <textarea 
                                    value={auditTasksInput}
                                    onChange={(e) => setAuditTasksInput(e.target.value)}
                                    placeholder="- Gym&#10;- Write code&#10;- Scroll tiktok&#10;- Email boss"
                                    className="w-full flex-1 p-3 border-2 border-life-ink focus:outline-none text-sm resize-none bg-white font-mono placeholder:text-gray-300 min-h-[150px]"
                                />
                                <button 
                                    type="submit"
                                    disabled={auditLoading || !auditTasksInput}
                                    className="w-full bg-life-ink text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-life-accent flex items-center justify-center gap-2 transition-all border-2 border-transparent hover:border-black cursor-pointer active:scale-98"
                                >
                                    {auditLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                                    Execute Audit
                                </button>
                            </form>
                        </>
                    ) : (
                         <div className="animate-in slide-in-from-right duration-300 space-y-4">
                             <div className="bg-white border-l-4 border-green-500 p-4 shadow-sm border-2 border-t-0 border-r-0 border-b-0 border-gray-100">
                                 <span className="text-[10px] font-bold uppercase text-green-600 block mb-1">Critical Mission</span>
                                 <p className="font-black text-lg font-mono">{auditResult.criticalTask}</p>
                             </div>

                             <div className="bg-white border-l-4 border-red-500 p-4 shadow-sm border-2 border-t-0 border-r-0 border-b-0 border-gray-100">
                                 <span className="text-[10px] font-bold uppercase text-red-600 block mb-1">Lethal Distraction</span>
                                 <p className="font-black text-lg font-mono line-through text-gray-400">{auditResult.discardTask}</p>
                                 <p className="text-xs font-mono text-red-500 mt-2 italic">"<Typewriter text={auditResult.reasoning} speed={10} />"</p>
                             </div>

                             <button 
                                onClick={() => { setAuditResult(null); setAuditTasksInput(''); }}
                                className="w-full text-center text-xs font-bold underline text-gray-400 hover:text-life-ink mt-4 cursor-pointer"
                             >
                                Run New Audit
                             </button>
                         </div>
                    )}
                </div>
            )}

            {currentView === 'ORACLE' && (
                <div className="flex flex-col h-[300px]">
                    {!oracleResponse ? (
                         <>
                            <p className="text-xs font-mono text-gray-600 mb-4 border-l-2 border-life-ink pl-2">
                                Query the system. Ask about regret, direction, or time.
                            </p>
                            <form onSubmit={handleOracleAsk} className="flex-1 flex flex-col gap-2">
                                <textarea
                                    value={oracleQuery}
                                    onChange={(e) => setOracleQuery(e.target.value)}
                                    placeholder="e.g., Am I wasting my potential?"
                                    className="w-full flex-1 p-3 border-2 border-life-ink focus:outline-none text-sm resize-none bg-white font-mono placeholder:text-gray-300"
                                />
                                <button
                                    type="submit"
                                    disabled={oracleLoading || !oracleQuery}
                                    className="w-full bg-life-ink text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-life-accent transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 border-2 border-transparent hover:border-black cursor-pointer"
                                >
                                    {oracleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                                    Consult
                                </button>
                            </form>
                         </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right duration-300 flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto mb-4 pr-1">
                                <div className="flex gap-3 mb-4">
                                    <div className="w-8 h-8 bg-life-ink text-white flex items-center justify-center shrink-0 border-2 border-black">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="bg-white p-4 border-2 border-life-ink text-sm text-life-ink leading-relaxed shadow-sm">
                                        <p className="font-bold mb-4 font-mono"><Typewriter text={oracleResponse.answer} speed={20} /></p>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider border-t border-gray-200 pt-2">
                                            "<Typewriter text={oracleResponse.philosophicalQuote} />"
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setOracleResponse(null); setOracleQuery(''); }}
                                className="text-xs text-center text-gray-400 hover:text-life-ink underline uppercase tracking-widest cursor-pointer"
                            >
                                New Query
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};