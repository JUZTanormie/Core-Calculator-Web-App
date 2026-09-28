import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Calculator, 
  Calendar, 
  ShieldAlert, 
  CheckCircle,
  Clock,
  Crosshair
} from 'lucide-react';

const WEEKS_PASSED = 6;
const WEEKS_REMAINING = 9;
const WEEKS_TOTAL = 15;
const SEMESTER_START = '2026-08-17';
const TODAY = format(new Date(), 'yyyy-MM-dd');
const SEMESTER_END = '2026-11-27';
const SECTION_DATA = {
  "I ECE A": [
    { name: "German", weekly: 3 }, { name: "Philosophy of Engineering", weekly: 3 },
    { name: "Math", weekly: 4 }, { name: "Chemistry", weekly: 6 },
    { name: "PCB Design", weekly: 2 }, { name: "Programming", weekly: 5 },
    { name: "Workshop", weekly: 4 }, { name: "Aptitude", weekly: 2 },
    { name: "NSS", weekly: 2 }, { name: "Biology", weekly: 2 }
  ],
  "I ECE B & EEE": [
    { name: "German", weekly: 3 }, { name: "Philosophy of Engineering", weekly: 3 },
    { name: "Math", weekly: 4 }, { name: "Chemistry", weekly: 6 },
    { name: "PCB / Circuits", weekly: 2 }, { name: "Programming", weekly: 5 },
    { name: "Workshop", weekly: 4 }, { name: "Aptitude", weekly: 2 },
    { name: "NSS", weekly: 2 }, { name: "Biology", weekly: 2 }
  ],
  "I ECE DS": [
    { name: "German", weekly: 3 }, { name: "Philosophy of Engineering", weekly: 3 },
    { name: "Math", weekly: 4 }, { name: "Chemistry", weekly: 6 },
    { name: "PCB Design", weekly: 2 }, { name: "Programming", weekly: 5 },
    { name: "Workshop", weekly: 4 }, { name: "Aptitude", weekly: 2 },
    { name: "NSS", weekly: 2 }, { name: "Biology", weekly: 2 }
  ],
  "I Biotech B & BME": [
    { name: "Japanese", weekly: 3 }, { name: "Philosophy of Engineering", weekly: 3 },
    { name: "Math", weekly: 4 }, { name: "Chemistry", weekly: 6 },
    { name: "Programming", weekly: 5 }, { name: "Cell Bio / Physiology", weekly: 2 },
    { name: "Yoga", weekly: 2 }, { name: "Aptitude", weekly: 2 },
    { name: "Workshop", weekly: 4 }, { name: "Biochemistry", weekly: 3 }
  ],
  "II BME": [
    { name: "Transforms", weekly: 4 }, { name: "Signals", weekly: 3 },
    { name: "Circuits", weekly: 5 }, { name: "Digital Logic", weekly: 4 },
    { name: "Med Physics", weekly: 3 }, { name: "Ethics", weekly: 1 },
    { name: "UHV", weekly: 3 }, { name: "Reasoning", weekly: 2 },
    { name: "Social Eng", weekly: 2 }
  ],
  "II ECE DS A & B": [
    { name: "Transforms", weekly: 4 }, { name: "Comp Org", weekly: 4 },
    { name: "Devices Lab", weekly: 4 }, { name: "Solid State", weekly: 3 },
    { name: "Digital Logic", weekly: 3 }, { name: "EMT", weekly: 3 },
    { name: "UHV", weekly: 3 }, { name: "Reasoning", weekly: 2 },
    { name: "Social Eng", weekly: 2 }, { name: "Ethics", weekly: 1 }
  ],
  "III BME": [
    { name: "Prob & Stat", weekly: 4 }, { name: "Microcontrollers", weekly: 5 },
    { name: "Signal Processing", weekly: 5 }, { name: "Biometrics", weekly: 3 },
    { name: "Wireless", weekly: 3 }, { name: "Med Imaging", weekly: 3 },
    { name: "Analytical", weekly: 2 }, { name: "Community", weekly: 2 },
    { name: "Art", weekly: 1 }
  ],
  "III ECE A & B & DS": [
    { name: "Math", weekly: 4 }, { name: "Microprocessor", weekly: 4 },
    { name: "Lab", weekly: 4 }, { name: "VLSI", weekly: 3 },
    { name: "Machine Learning", weekly: 3 }, { name: "Database / Network on Chip", weekly: 3 },
    { name: "Analytical", weekly: 2 }, { name: "Community", weekly: 2 },
    { name: "Art", weekly: 1 }
  ],
  "IV ECE A & B": [
    { name: "Psychology", weekly: 3 }, { name: "Wireless", weekly: 3 },
    { name: "Memory", weekly: 3 }, { name: "Scripting", weekly: 3 },
    { name: "Machine Learning", weekly: 3 }, { name: "Comp Comm", weekly: 5 }
  ]
};

export default function App() {
  const [section, setSection] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [isCalculated, setIsCalculated] = useState(false);

  const handleAttendanceChange = (subjectName, value) => {
    let val = parseFloat(value);
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    setAttendance(prev => ({ 
      ...prev, 
      [subjectName]: isNaN(val) ? '' : val 
    }));
  };

  const handleSectionChange = (e) => {
    setSection(e.target.value);
    setAttendance({});
    setIsCalculated(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#020205] text-cyan-50 selection:bg-cyan-500/30 selection:text-cyan-200">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        
        body { font-family: 'Rajdhani', sans-serif; background-color: #020205; }
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        
        .neon-box {
          background: rgba(4, 15, 30, 0.7);
          border: 1px solid rgba(0, 240, 255, 0.2);
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.05), inset 0 0 20px rgba(0, 240, 255, 0.02);
          backdrop-filter: blur(10px);
        }
        
        .neon-input {
          background: rgba(2, 6, 12, 0.9);
          border: 1px solid rgba(0, 240, 255, 0.3);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
        }
        .neon-input:focus {
          border-color: #00f0ff;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.8);
          outline: none;
        }

        .neon-text-glow { text-shadow: 0 0 8px rgba(0, 240, 255, 0.6); }
        .danger-text-glow { text-shadow: 0 0 8px rgba(255, 0, 85, 0.8); }
        
        @keyframes alert-strobe {
          0%, 100% { opacity: 1; border-color: #ff0055; box-shadow: 0 0 30px rgba(255,0,85,0.4), inset 0 0 30px rgba(255,0,85,0.2); }
          50% { opacity: 0.8; border-color: #aa0033; box-shadow: 0 0 10px rgba(255,0,85,0.2), inset 0 0 10px rgba(255,0,85,0.1); }
        }
        .detention-mode {
          animation: alert-strobe 1.5s infinite;
          background: linear-gradient(135deg, rgba(30,2,5,0.9) 0%, rgba(10,0,2,0.95) 100%);
        }
        
        .scanline {
          width: 100%; height: 2px;
          background: rgba(0, 240, 255, 0.1);
          position: absolute; top: 0; left: 0;
          animation: scan 4s linear infinite;
          pointer-events: none; z-index: 50;
        }
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
      `}} />

      <div className="max-w-7xl mx-auto relative">
        <header className="mb-10 text-center relative z-10">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#00f0ff] to-blue-600 tracking-[0.2em] uppercase mb-2 neon-text-glow">
            CORE CALCULATOR
          </h1>
          <p className="text-cyan-500/80 font-bold tracking-[0.3em] uppercase text-sm md:text-md flex items-center justify-center gap-2">
            <Crosshair className="w-4 h-4" /> Advanced Projection Matrix <Crosshair className="w-4 h-4" />
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="neon-box rounded-xl p-6 relative overflow-hidden">
              <div className="scanline"></div>
              <h2 className="font-orbitron text-xl font-bold text-[#00f0ff] mb-6 flex items-center gap-3 border-b border-cyan-900/50 pb-3">
                <Clock className="w-5 h-5 text-cyan-400" /> TEMPORAL CALIBRATION
              </h2>
              
              <div className="space-y-5">
                <div className="bg-[#02050a] p-3 rounded border border-cyan-950">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest">System Date</span>
                    <span className="text-[10px] bg-cyan-900/40 text-cyan-400 px-2 py-0.5 rounded font-orbitron border border-cyan-800">WK {WEEKS_PASSED}/{WEEKS_TOTAL}</span>
                  </div>
                  <div className="font-orbitron text-lg text-cyan-100">{TODAY}</div>
                  <div className="flex justify-between mt-2 text-[10px] text-cyan-700 font-bold uppercase tracking-wider">
                    <span>Start: {SEMESTER_START}</span>
                    <span>End: {SEMESTER_END}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-cyan-500 uppercase tracking-widest mb-2 font-bold">Target Horizon (Optional)</label>
                  <input 
                    type="date" 
                    className="w-full neon-input text-cyan-200 p-3 rounded font-orbitron text-sm transition-all"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    min={TODAY} max={SEMESTER_END}
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-cyan-500 uppercase tracking-widest mb-2 font-bold">Select Cohort</label>
                  <select 
                    className="w-full neon-input text-cyan-200 p-3 rounded font-bold tracking-wider cursor-pointer transition-all"
                    value={section}
                    onChange={handleSectionChange}
                  >
                    <option value="" disabled>-- INITIALIZE --</option>
                    {Object.keys(SECTION_DATA).map(sec => (
                      <option key={sec} value={sec} className="bg-slate-900">{sec}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {section && (
              <div className="neon-box rounded-xl p-6">
                <h2 className="font-orbitron text-xl font-bold text-[#00f0ff] mb-6 flex items-center gap-3 border-b border-cyan-900/50 pb-3">
                  <Calculator className="w-5 h-5" /> PARAMETERS
                </h2>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {SECTION_DATA[section].map((subj, idx) => (
                    <div key={idx} className="bg-[#02050a] p-3 rounded border border-cyan-950 flex justify-between items-center group hover:border-cyan-800 transition-colors">
                      <div className="w-2/3">
                        <label className="text-sm font-semibold text-cyan-100 leading-tight block truncate pr-2">
                          {subj.name}
                        </label>
                        <span className="text-[10px] text-cyan-700 font-orbitron uppercase tracking-widest">
                          {subj.weekly} hrs/wk
                        </span>
                      </div>
                      <div className="flex items-center gap-2 w-1/3 justify-end">
                        <input 
                          type="number" placeholder="0.0" min="0" max="100" step="0.1"
                          className="w-[70px] neon-input text-[#00f0ff] p-2 rounded text-right font-orbitron text-sm transition-all"
                          value={attendance[subj.name] !== undefined ? attendance[subj.name] : ''}
                          onChange={(e) => handleAttendanceChange(subj.name, e.target.value)}
                        />
                        <span className="text-xs text-cyan-700 group-hover:text-cyan-400 font-orbitron">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setIsCalculated(true)}
                  className="w-full mt-6 bg-cyan-950 hover:bg-cyan-900 text-[#00f0ff] border border-[#00f0ff] font-orbitron font-bold text-lg py-3 rounded uppercase tracking-[0.2em] transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  Execute
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            {isCalculated ? (
              <div className="grid md:grid-cols-2 gap-4">
                {SECTION_DATA[section].map((subj, idx) => {
                  
                  // Math Engine
                  const currentPercent = attendance[subj.name] || 0;
                  const totalClassesInSem = subj.weekly * WEEKS_TOTAL;
                  const classesHappened = subj.weekly * WEEKS_PASSED;
                  const classesRemainingInSem = subj.weekly * WEEKS_REMAINING;
                  
                  // Calculate classes attended so far (rounded to nearest whole integer)
                  const attendedSoFar = Math.round((currentPercent / 100) * classesHappened);
                  
                  // Thresholds
                  const requiredFor75 = Math.ceil(0.75 * totalClassesInSem);
                  const neededToReach75 = requiredFor75 - attendedSoFar;
                  
                  const requiredFor90 = Math.ceil(0.90 * totalClassesInSem);
                  const neededToReach90 = requiredFor90 - attendedSoFar;
                  
                  const isDetention = neededToReach75 > classesRemainingInSem;

                  // Target Date Math
                  let targetDiffText = "";
                  if (targetDate) {
                    const diffTime = new Date(targetDate) - new Date(TODAY);
                    const targetWeeksDiff = Math.max(0, Math.min(Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)), WEEKS_REMAINING));
                    targetDiffText = `${subj.weekly * targetWeeksDiff}`;
                  }

                  return (
                    <div 
                      key={idx} 
                      className={`relative overflow-hidden rounded-xl p-[1px] transition-all ${
                        isDetention 
                          ? 'detention-mode' 
                          : 'neon-box hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                      }`}
                    >
                      <div className="h-full bg-[#02050a]/90 backdrop-blur-md rounded-[10px] p-5 relative z-10">
                        
                        {isDetention && (
                          <div className="absolute inset-0 bg-[#0a0002]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center">
                             <ShieldAlert className="w-12 h-12 text-[#ff0055] mb-2 danger-text-glow" />
                             <h3 className="font-orbitron text-xl font-black text-[#ff0055] tracking-[0.2em] uppercase leading-tight danger-text-glow">
                               IRREVERSIBLE<br/>DETENTION
                             </h3>
                             <div className="mt-3 bg-red-950/50 px-3 py-2 rounded border border-[#ff0055]/30">
                               <p className="text-[#ff0055]/80 font-bold text-[10px] tracking-widest uppercase mb-1">Deficit Exceeds Remaining</p>
                               <p className="text-red-100 font-orbitron text-sm">Need {neededToReach75} / {classesRemainingInSem} left</p>
                             </div>
                          </div>
                        )}

                        <div className={isDetention ? 'opacity-10 pointer-events-none filter blur-sm' : ''}>
                          <div className="flex justify-between items-start mb-5">
                            <h3 className="text-lg font-bold text-cyan-50 pr-4 leading-tight">{subj.name}</h3>
                            <span className="font-orbitron text-xl font-bold text-[#00f0ff] neon-text-glow bg-cyan-950/40 px-2 py-1 rounded border border-cyan-900/50">
                              {Number(currentPercent).toFixed(1)}%
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-[#040a12] p-2 rounded border border-cyan-900/30">
                              <p className="text-[9px] text-cyan-600 font-bold uppercase tracking-widest mb-1">Classes Left</p>
                              <p className="font-orbitron text-lg text-cyan-100">{classesRemainingInSem}</p>
                            </div>
                            <div className="bg-[#040a12] p-2 rounded border border-cyan-900/30">
                              <p className="text-[9px] text-cyan-600 font-bold uppercase tracking-widest mb-1">Current Attendance</p>
                              <p className="font-orbitron text-lg text-cyan-100">{attendedSoFar} <span className="text-xs text-cyan-700">/ {classesHappened}</span></p>
                            </div>
                            {targetDate && (
                              <div className="col-span-2 bg-blue-950/20 p-2 rounded border border-blue-900/30">
                                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mb-1">Left to Horizon Date</p>
                                <p className="font-orbitron text-lg text-blue-200">{targetDiffText}</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 pt-3 border-t border-cyan-900/30">
                            <div className="flex items-center justify-between bg-[#040a12] p-2 rounded border-l-2 border-l-amber-500">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500/80">75% Protocol</span>
                              </div>
                              <div className="text-right font-orbitron text-xs font-bold">
                                {neededToReach75 <= 0 ? (
                                  <span className="text-[#00ff88]">SECURED</span>
                                ) : (
                                  <span className="text-amber-400">Attend {neededToReach75}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between bg-[#040a12] p-2 rounded border-l-2 border-l-[#00f0ff]">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-[#00f0ff]" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-500/80">90% Protocol</span>
                              </div>
                              <div className="text-right font-orbitron text-xs font-bold">
                                {neededToReach90 <= 0 ? (
                                   <span className="text-[#00ff88]">SECURED</span>
                                ) : neededToReach90 > classesRemainingInSem ? (
                                   <span className="text-cyan-800 line-through">IMPOSSIBLE</span>
                                ) : (
                                   <span className="text-[#00f0ff]">Attend {neededToReach90}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full min-h-[500px] neon-box rounded-xl flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                 <div className="scanline" style={{animationDuration: '3s'}}></div>
                 <Calculator className="w-20 h-20 mb-6 text-cyan-900 drop-shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
                 <h3 className="font-orbitron text-2xl font-black mb-3 uppercase tracking-[0.3em] text-cyan-800">System Standby</h3>
                 <p className="text-sm font-semibold max-w-sm text-cyan-700/60 uppercase tracking-widest leading-relaxed">
                   Awaiting cohort selection and parameter input to initiate projection sequence.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
