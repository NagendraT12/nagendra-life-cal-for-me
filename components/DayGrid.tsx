import React, { useState, useEffect } from 'react';
import { DayTask } from '../types';
import { Clock, Check, Plus, Trash2, Bell, CheckCircle2, X } from 'lucide-react';

interface DayGridProps {
  tasks: Record<string, DayTask>;
  onTaskUpdate: (index: number, task: DayTask | null) => void;
}

// 144 blocks = 24 hours * 6 blocks/hour (10 mins each)
const TOTAL_BLOCKS = 144;
const MINUTES_PER_BLOCK = 10;

export const DayGrid: React.FC<DayGridProps> = ({ tasks, onTaskUpdate }) => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [taskInput, setTaskInput] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
      const block = Math.floor(minutesSinceMidnight / MINUTES_PER_BLOCK);
      setCurrentBlockIndex(block);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getBlockTimeRange = (index: number) => {
    const startMinutes = index * MINUTES_PER_BLOCK;
    const endMinutes = startMinutes + MINUTES_PER_BLOCK;
    
    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return {
      label: `${formatTime(startMinutes)} - ${formatTime(endMinutes)}`,
      start: startMinutes,
      end: endMinutes
    };
  };

  const handleSaveTask = () => {
    if (selectedBlock === null || !taskInput.trim()) return;
    
    const timeInfo = getBlockTimeRange(selectedBlock);
    
    const newTask: DayTask = {
      id: selectedBlock.toString(),
      text: taskInput,
      isCompleted: false,
      timeRange: timeInfo.label
    };

    onTaskUpdate(selectedBlock, newTask);
    setTaskInput('');
    setSelectedBlock(null);
  };

  const handleDeleteTask = () => {
    if (selectedBlock === null) return;
    onTaskUpdate(selectedBlock, null);
    setSelectedBlock(null);
  };

  const handleToggleComplete = () => {
    if (selectedBlock === null) return;
    const task = tasks[selectedBlock.toString()];
    if (task) {
      onTaskUpdate(selectedBlock, { ...task, isCompleted: !task.isCompleted });
    }
  };

  const generateGCalLink = (blockIndex: number, text: string) => {
    const now = new Date();
    const startMinutes = blockIndex * MINUTES_PER_BLOCK;
    
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, startMinutes, 0);
    const endDate = new Date(startDate.getTime() + MINUTES_PER_BLOCK * 60000);

    const formatLocal = (d: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    };

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${formatLocal(startDate)}/${formatLocal(endDate)}&details=${encodeURIComponent("Task from Life Calendar Day Grid")}&sf=true&output=xml`;
  };

  const selectedTask = selectedBlock !== null ? tasks[selectedBlock.toString()] : null;
  const timeInfo = selectedBlock !== null ? getBlockTimeRange(selectedBlock) : null;

  return (
    <div className="w-full flex flex-col items-center">
        <div className="mb-6 text-center border-b-4 border-life-ink pb-4 w-full max-w-md">
             <h2 className="text-3xl font-black uppercase tracking-tight">Daily Ration</h2>
             <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">144 Units • 10 Mins Each • Non-Refundable</p>
        </div>

        {/* Grid Container */}
        <div className="w-full max-w-[400px] aspect-square relative border-2 border-life-ink bg-white p-2 shadow-hard">
            <div className="grid grid-cols-12 grid-rows-12 gap-[1px] w-full h-full bg-life-ink">
                {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => {
                    const isPassed = i < currentBlockIndex;
                    const isCurrent = i === currentBlockIndex;
                    const hasTask = !!tasks[i.toString()];
                    const isCompleted = hasTask && tasks[i.toString()].isCompleted;

                    let bgClass = 'bg-white';
                    // STYLING LOGIC FOR DAY GRID
                    if (isCompleted) bgClass = 'bg-life-accent';
                    else if (hasTask) bgClass = 'bg-gray-400';
                    else if (isCurrent) bgClass = 'bg-life-accent animate-pulse';
                    else if (isPassed) bgClass = 'bg-black'; // THE VOID - Time spent
                    else bgClass = 'bg-white'; // Future - WHITE (Empty), not transparent (black)

                    return (
                        <div 
                            key={i}
                            onClick={() => {
                                setSelectedBlock(i);
                                setTaskInput(tasks[i.toString()]?.text || '');
                            }}
                            className={`relative cursor-pointer transition-transform duration-75 ${bgClass} hover:z-20 hover:scale-150 hover:shadow-hard`}
                            title={getBlockTimeRange(i).label}
                        >
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-[9px] font-bold uppercase tracking-wider text-gray-500 w-full max-w-[400px]">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-gray-300"></div> Unused</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-black"></div> Spent (Void)</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-life-accent animate-pulse"></div> Current</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-life-accent"></div> Completed</div>
        </div>

        {/* Task Modal */}
        {selectedBlock !== null && timeInfo && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBlock(null)}>
                <div className="bg-white border-2 border-life-ink shadow-[0_0_20px_rgba(255,255,255,0.2)] p-6 max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-6 border-b-4 border-life-ink pb-4">
                        <div>
                            <h3 className="text-4xl font-black font-sans tracking-tight flex items-center gap-2">
                                {timeInfo.label}
                            </h3>
                            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">10 Minute Unit</p>
                        </div>
                        <button onClick={() => setSelectedBlock(null)} className="p-2 hover:bg-life-ink hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {selectedTask ? (
                        <div className="bg-gray-50 p-4 border-2 border-life-ink mb-4 relative shadow-sm">
                            <div className="flex items-start gap-4">
                                <button 
                                    onClick={handleToggleComplete}
                                    className={`mt-1 w-6 h-6 border-2 flex items-center justify-center transition-colors ${selectedTask.isCompleted ? 'bg-life-accent border-life-accent text-white' : 'bg-white border-black'}`}
                                >
                                    {selectedTask.isCompleted && <Check className="w-4 h-4" />}
                                </button>
                                <div className="flex-1">
                                    <p className={`text-base font-bold ${selectedTask.isCompleted ? 'line-through text-gray-400' : 'text-life-ink'}`}>
                                        {selectedTask.text}
                                    </p>
                                </div>
                                <button onClick={handleDeleteTask} className="text-gray-300 hover:text-life-accent">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                             <a 
                                href={generateGCalLink(selectedBlock, selectedTask.text)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:border-black transition-all"
                            >
                                <Bell className="w-3 h-3" />
                                Sync
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <input 
                                type="text"
                                value={taskInput}
                                onChange={(e) => setTaskInput(e.target.value)}
                                placeholder="Assign task..."
                                className="w-full p-4 border-2 border-life-ink focus:outline-none text-base font-bold bg-white font-mono"
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
                                autoFocus
                            />
                            <button 
                                onClick={handleSaveTask}
                                disabled={!taskInput.trim()}
                                className="w-full bg-life-ink text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-life-accent disabled:opacity-50 transition-colors border-2 border-transparent hover:border-black"
                            >
                                Allocate Time
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};