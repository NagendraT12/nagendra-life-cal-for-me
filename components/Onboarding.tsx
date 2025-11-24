import React, { useState } from 'react';
import { Calendar, ArrowRight, Briefcase, GraduationCap, HelpCircle, Fingerprint } from 'lucide-react';
import { UserStatus } from '../types';

interface OnboardingProps {
  onComplete: (date: string, status: UserStatus) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<UserStatus | null>(null);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && date) {
      setStep(2);
    } else if (step === 2 && status) {
      onComplete(date, status);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-life-paper p-4 font-sans text-life-ink">
      <div className="max-w-xl w-full bg-white border-4 border-life-ink shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 relative overflow-hidden">
        
        {/* Decorative Tape */}
        <div className="absolute top-4 right-[-30px] rotate-45 w-[100px] h-[30px] bg-yellow-300 opacity-60 border border-black flex items-center justify-center text-[8px] font-bold uppercase tracking-widest">
            CONFIDENTIAL
        </div>

        <div className="flex justify-between items-start mb-10 border-b-4 border-life-ink pb-6">
            <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Manifest</h1>
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.2em]">Initialization Protocol v2.0</p>
            </div>
            <Fingerprint className="w-16 h-16 text-gray-200 absolute top-8 right-8 pointer-events-none" />
        </div>

        <form onSubmit={handleNext} className="space-y-8 relative z-10">
          {step === 1 ? (
            <div className="animate-in slide-in-from-right duration-500">
              <label htmlFor="birthdate" className="block text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="bg-life-ink text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">1</span> 
                Origin Date
              </label>
              <input
                type="date"
                id="birthdate"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-6 text-2xl font-mono border-2 border-life-ink focus:bg-gray-50 focus:outline-none bg-white transition-colors shadow-sm focus:shadow-hard-sm"
              />
              <p className="mt-4 text-[10px] font-mono text-gray-400 border-l-2 border-gray-200 pl-2 uppercase">
                * CAUTION: Your biological countdown began on this date. Accuracy required.
              </p>
            </div>
          ) : (
             <div className="animate-in slide-in-from-right duration-500 space-y-4">
               <label className="block text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="bg-life-ink text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">2</span>
                 Current Objective
               </label>
               
               <button
                 type="button"
                 onClick={() => setStatus(UserStatus.CAREER)}
                 className={`w-full p-5 text-left border-2 flex items-center gap-4 transition-all group ${status === UserStatus.CAREER ? 'border-life-ink bg-life-ink text-white shadow-hard-sm' : 'border-gray-200 hover:border-black hover:bg-gray-50'}`}
               >
                 <Briefcase className="w-6 h-6" />
                 <div>
                    <div className="font-bold text-lg uppercase tracking-wide">Career</div>
                    <div className={`text-[10px] font-mono uppercase ${status === UserStatus.CAREER ? 'text-gray-400' : 'text-gray-500'}`}>Labor / Business / Grind</div>
                 </div>
               </button>

               <button
                 type="button"
                 onClick={() => setStatus(UserStatus.STUDYING)}
                 className={`w-full p-5 text-left border-2 flex items-center gap-4 transition-all group ${status === UserStatus.STUDYING ? 'border-life-ink bg-life-ink text-white shadow-hard-sm' : 'border-gray-200 hover:border-black hover:bg-gray-50'}`}
               >
                 <GraduationCap className="w-6 h-6" />
                 <div>
                    <div className="font-bold text-lg uppercase tracking-wide">Academics</div>
                    <div className={`text-[10px] font-mono uppercase ${status === UserStatus.STUDYING ? 'text-gray-400' : 'text-gray-500'}`}>Acquiring Knowledge</div>
                 </div>
               </button>

               <button
                 type="button"
                 onClick={() => setStatus(UserStatus.SEARCHING)}
                 className={`w-full p-5 text-left border-2 flex items-center gap-4 transition-all group ${status === UserStatus.SEARCHING ? 'border-life-ink bg-life-ink text-white shadow-hard-sm' : 'border-gray-200 hover:border-black hover:bg-gray-50'}`}
               >
                 <HelpCircle className="w-6 h-6" />
                 <div>
                    <div className="font-bold text-lg uppercase tracking-wide">Discovery</div>
                    <div className={`text-[10px] font-mono uppercase ${status === UserStatus.SEARCHING ? 'text-gray-400' : 'text-gray-500'}`}>Navigation / Gap Year / Void</div>
                 </div>
               </button>
             </div>
          )}

          <button
            type="submit"
            disabled={step === 1 ? !date : !status}
            className="w-full bg-life-ink text-white py-6 font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-life-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed group mt-8 border-2 border-transparent hover:border-black"
          >
            {step === 1 ? 'Confirm Origin' : 'Initialize Timeline'}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};