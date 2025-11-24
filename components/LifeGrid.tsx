import React, { useMemo } from 'react';
import { AIAnalysisResult, LifeStage, UserStatus, WeeklyGoal, Milestone, MilestoneType } from '../types';
import { GraduationCap, Heart, Plane, Star, Check } from 'lucide-react';

interface LifeGridProps {
  birthDate: string;
  userStatus: UserStatus;
  aiImpact: AIAnalysisResult | null;
  showStages: boolean;
  goals: Record<string, WeeklyGoal>;
  milestones?: Record<string, Milestone>;
  onWeekClick: (year: number, week: number) => void;
}

const WEEKS_PER_YEAR = 52;
const TOTAL_YEARS = 90;

export const LifeGrid: React.FC<LifeGridProps> = ({ birthDate, userStatus, aiImpact, showStages, goals, milestones, onWeekClick }) => {
  
  // Define stages dynamically based on User Status
  const stages = useMemo<LifeStage[]>(() => {
    const baseStages = [
      { label: 'Early Years', startAge: 0, endAge: 5, color: 'bg-zinc-200', pastColor: 'bg-zinc-900' },
      { label: 'Elementary', startAge: 5, endAge: 11, color: 'bg-stone-200', pastColor: 'bg-stone-900' },
      { label: 'Middle School', startAge: 11, endAge: 14, color: 'bg-neutral-200', pastColor: 'bg-neutral-900' },
      { label: 'High School', startAge: 14, endAge: 18, color: 'bg-orange-100', pastColor: 'bg-orange-950' },
      { label: 'College', startAge: 18, endAge: 22, color: 'bg-amber-100', pastColor: 'bg-amber-950' },
    ];

    let currentStage: LifeStage;

    if (userStatus === UserStatus.STUDYING) {
        currentStage = { label: 'Advanced Studies', startAge: 22, endAge: 30, color: 'bg-blue-50', pastColor: 'bg-blue-950' };
    } else if (userStatus === UserStatus.SEARCHING) {
        currentStage = { label: 'Figuring it out', startAge: 22, endAge: 30, color: 'bg-lime-50', pastColor: 'bg-lime-950' };
    } else {
        currentStage = { label: 'Career', startAge: 22, endAge: 65, color: 'bg-red-50', pastColor: 'bg-red-950' };
    }

    // Add remaining stages
    const finalStages = [
        currentStage,
        { label: 'Retirement', startAge: 65, endAge: 91, color: 'bg-emerald-50', pastColor: 'bg-emerald-950' }
    ];

    return [...baseStages, ...finalStages];
  }, [userStatus]);

  const gridData = useMemo(() => {
    const start = new Date(birthDate);
    const now = new Date();
    
    // Calculate difference in weeks
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const livedWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    return { livedWeeks };
  }, [birthDate]);

  const years = Array.from({ length: TOTAL_YEARS }, (_, i) => i);

  const getStageColors = (age: number) => {
    const stage = stages.find(s => age >= s.startAge && age < s.endAge);
    return stage ? { future: stage.color, past: stage.pastColor } : { future: 'bg-white', past: 'bg-life-ink' };
  };

  const renderMilestoneIcon = (type: MilestoneType) => {
      switch(type) {
          case MilestoneType.ACHIEVEMENT: return <Star className="w-[8px] h-[8px] text-white drop-shadow-sm" />;
          case MilestoneType.RELATIONSHIP: return <Heart className="w-[8px] h-[8px] text-white drop-shadow-sm" />;
          case MilestoneType.TRAVEL: return <Plane className="w-[8px] h-[8px] text-white drop-shadow-sm" />;
          case MilestoneType.CAREER: return <GraduationCap className="w-[8px] h-[8px] text-white drop-shadow-sm" />;
          default: return null;
      }
  };

  return (
    <div className="flex flex-col select-none relative pb-10">
      <style>{`
        @keyframes radar-ping {
          0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.9); background-color: #ff0000; }
          70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); background-color: #ff0000; }
          100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); background-color: #cc0000; }
        }
        .animate-radar {
          animation: radar-ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
          z-index: 50;
        }
      `}</style>
      
      {years.map((yearIndex) => {
        const weeksInThisYear = Array.from({ length: WEEKS_PER_YEAR }, (_, w) => w);
        const yearStartWeekIndex = yearIndex * WEEKS_PER_YEAR;
        const stageColors = getStageColors(yearIndex);

        return (
          <div key={yearIndex} className="flex items-center gap-[1px] md:gap-[3px] mb-[1px] md:mb-[3px] h-[8px] md:h-[12px]">
            {/* Year Label */}
            <div className="w-6 md:w-8 text-[8px] md:text-[10px] text-gray-500 font-bold font-mono text-right pr-2 leading-none shrink-0 opacity-40 select-none">
              {yearIndex % 5 === 0 ? yearIndex : ''}
            </div>

            {/* Weeks Row */}
            {weeksInThisYear.map((weekIndex) => {
              const absoluteWeekIndex = yearStartWeekIndex + weekIndex;
              const isLived = absoluteWeekIndex < gridData.livedWeeks;
              const isCurrent = absoluteWeekIndex === gridData.livedWeeks;
              const goalKey = `${yearIndex}-${weekIndex + 1}`;
              const hasGoal = !!goals[goalKey];
              const isGoalCompleted = hasGoal && goals[goalKey].isCompleted;
              const milestone = milestones ? milestones[goalKey] : null;
              
              const isImpact = aiImpact && 
                               absoluteWeekIndex > gridData.livedWeeks && 
                               absoluteWeekIndex <= (gridData.livedWeeks + aiImpact.weeksConsumed);

              let bgClass = 'bg-transparent';
              let borderClass = 'border-[0.5px] border-neutral-300';
              let hoverClass = 'week-glitch transition-transform duration-100 ease-out origin-center';
              
              // No fade effect requested. Opacity is always 1.
              const opacityStyle = { opacity: 1 };

              if (showStages) {
                  if (isImpact) {
                      bgClass = aiImpact.tone === 'positive' ? 'bg-emerald-300' : 'bg-red-400';
                      borderClass = 'border-transparent';
                  } else if (isCurrent) {
                      bgClass = 'bg-life-accent'; 
                      borderClass = 'border-life-accent';
                      hoverClass = '';
                  } else if (isLived) {
                      bgClass = stageColors.past;
                      borderClass = 'border-transparent';
                  } else {
                      bgClass = stageColors.future;
                      borderClass = 'border-transparent';
                  }
              } else {
                  // SCARCITY / MASTERPIECE MODE
                  if (isImpact) {
                      bgClass = aiImpact.tone === 'positive' ? 'bg-emerald-500' : 'bg-red-600';
                      borderClass = 'border-transparent';
                  } else if (isCurrent) {
                      // CURRENT WEEK - RADAR
                      bgClass = 'bg-life-accent';
                      borderClass = 'border-none';
                      hoverClass = '';
                  } else if (isLived) {
                      // PAST - THE VOID (Solid Black)
                      bgClass = 'bg-black';
                      borderClass = 'border-none';
                  } else {
                      // FUTURE - THE BLANK SLATE (Stark White)
                      // User requested no fade.
                      bgClass = 'bg-white';
                      // Subtle border to avoid "lines everywhere" mess, but keep structure
                      borderClass = 'border-[0.5px] border-gray-200'; 
                  }
              }

              if (isGoalCompleted) {
                 bgClass = 'bg-life-accent';
                 borderClass = 'border-life-accent';
              }

              return (
                <div
                  key={weekIndex}
                  onClick={() => onWeekClick(yearIndex, weekIndex + 1)}
                  style={opacityStyle}
                  className={`
                    flex-1 h-full rounded-[0px] cursor-pointer relative
                    ${bgClass} ${borderClass}
                    ${isCurrent ? 'animate-radar' : ''}
                    ${hoverClass}
                  `}
                  title={isLived ? "VOID (Spent)" : `Week ${weekIndex + 1}, Year ${yearIndex}`}
                >
                    {hasGoal && !isGoalCompleted && !isCurrent && (
                        <div className={`absolute inset-0 m-auto w-[40%] h-[40%] rounded-full bg-life-accent`} />
                    )}

                    {isGoalCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-[8px] h-[8px] text-white" strokeWidth={4} />
                        </div>
                    )}

                    {milestone && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                            {renderMilestoneIcon(milestone.type)}
                        </div>
                    )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};