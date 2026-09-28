import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Calculator, Calendar, ShieldAlert, CheckCircle, MessageSquare, X, Send, Activity, BarChart2 } from 'lucide-react';
import { differenceInWeeks, parseISO, format } from 'date-fns';

const SECTION_DATA = {
  "I ECE A": [
    { name: "German", credits: "2-1-0-3", weekly: 3 },
    { name: "Philosophy of Engineering", credits: "1-0-2-2", weekly: 3 },
    { name: "Advanced Calculus and Complex Analysis", credits: "3-1-0-4", weekly: 4 },
    { name: "Chemistry", credits: "3-1-2-5", weekly: 6 },
    { name: "Electronic System and PCB Design", credits: "2-0-0-2", weekly: 2 },
    { name: "Programming for Problem Solving", credits: "3-0-2-4", weekly: 5 },
    { name: "Basic Civil and Mechanical Workshop", credits: "0-0-4-2", weekly: 4 },
    { name: "General Aptitude", credits: "0-0-2-0", weekly: 2 },
    { name: "NSS", credits: "0-0-2-0", weekly: 2 },
    { name: "Biology", credits: "2-0-0-2", weekly: 2 }
  ],
  "I ECE B & EEE": [
    { name: "German", credits: "2-1-0-3", weekly: 3 },
    { name: "Philosophy of Engineering", credits: "1-0-2-2", weekly: 3 },
    { name: "Advanced Calculus and Complex Analysis", credits: "3-1-0-4", weekly: 4 },
    { name: "Chemistry", credits: "3-1-2-5", weekly: 6 },
    { name: "PCB Design / Electrical Circuits", credits: "2-0-0-2", weekly: 2 },
    { name: "Programming for Problem Solving", credits: "3-0-2-4", weekly: 5 },
    { name: "Basic Civil and Mechanical Workshop", credits: "0-0-4-2", weekly: 4 },
    { name: "General Aptitude", credits: "0-0-2-0", weekly: 2 },
    { name: "NSS", credits: "0-0-2-0", weekly: 2 },
    { name: "Biology", credits: "2-0-0-2", weekly: 2 }
  ],
  "II BME": [
    { name: "Transforms and Boundary Value Problems", credits: "3-1-0-4", weekly: 4 },
    { name: "Biomedical Signals and Systems", credits: "3-0-0-3", weekly: 3 },
    { name: "Electric and Electronic Circuits", credits: "3-0-2-4", weekly: 5 },
    { name: "Digital Logic for Medical Systems", credits: "2-0-2-3", weekly: 4 },
    { name: "Medical Physics", credits: "3-0-0-3", weekly: 3 },
    { name: "Professional Ethics", credits: "1-0-0-0", weekly: 1 },
    { name: "Universal Human Values-II", credits: "2-1-0-3", weekly: 3 },
    { name: "Verbal Reasoning", credits: "0-0-2-0", weekly: 2 },
    { name: "Social Engineering", credits: "2-0-0-2", weekly: 2 }
  ],
  "IV ECE B": [
    { name: "Behavioural Psychology", credits: "2-1-0-3", weekly: 3 },
    { name: "Wireless Comm & Antenna Systems", credits: "3-0-0-3", weekly: 3 },
    { name: "Computer Comm & Network Security", credits: "2-1-0-3", weekly: 5 },
    { name: "Semiconductor Memory Design", credits: "3-0-0-3", weekly: 3 },
    { name: "Scripting Language for EDA", credits: "3-0-0-3", weekly: 3 },
    { name: "Machine learning for all", credits: "3-0-0-3", weekly: 3 }
  ]
};

const SEMESTER_START = '2026-08-17';
const TODAY = format(new Date(), 'yyyy-MM-dd');
const SEMESTER_END = '2026-11-27';

const App = () => {
  // Core State
  const [section, setSection] = useState("");
  const [targetDate, setTargetDate] = useState(SEMESTER_END);
  const [attendance, setAttendance] = useState({});
  const [isCalculated, setIsCalculated] = useState(false);

  // Simulator State
  const [leaveDays, setLeaveDays] = useState(0);
  const [leaveType, setLeaveType] = useState('sick'); // 'sick' (absent) or 'od' (present)

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Terminal active. Ask me about your attendance projections. (e.g., "If I take a 3-day sick leave, will my Chemistry attendance drop below 75%?")' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  // Handlers
  const handleAttendanceChange = (subjectName, value) => {
    let val = parseFloat(value);
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    setAttendance(prev => ({ ...prev, [subjectName]: isNaN(val) ? '' : val }));
  };

  // Math Engine
  const weeksTotal = differenceInWeeks(parseISO(SEMESTER_END), parseISO(SEMESTER_START));
  const weeksPassed = Math.max(0, differenceInWeeks(parseISO(TODAY), parseISO(SEMESTER_START)));
  const targetWeeksDifference = targetDate ? differenceInWeeks(parseISO(targetDate), parseISO(TODAY)) : (weeksTotal - weeksPassed);
  const activeWeeksRemaining = Math.max(0, Math.min(targetWeeksDifference, weeksTotal - weeksPassed));
  const weeksRemainingInSem = Math.max(0, weeksTotal - weeksPassed);

  // Overall Health Data
  const getOverallHealth = () => {
    if (!section || !isCalculated) return 0;
    let totalHappened = 0;
    let totalAttended = 0;
    
    SECTION_DATA[section].forEach(subj => {
      const happened = subj.weekly * weeksPassed;
      const percent = attendance[subj.name] || 0;
      totalHappened += happened;
      totalAttended += Math.round((percent / 100) * happened);
    });
    
    return totalHappened === 0 ? 0 : ((totalAttended / totalHappened) * 100).toFixed(1);
  };

  // Chatbot Logic
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput("");

    setTimeout(() => {
      let reply = "";
      if (!section || !isCalculated) {
        reply = "Please initialize a cohort and execute the analysis on the dashboard first so I can access your parameters.";
      } else {
        // Natural Language Parsing Engine
        const daysMatch = userText.match(/(\d+)\s*-?\s*day/i);
        const days = daysMatch ? parseInt(daysMatch[1]) : 0;
        
        let matchedSubject = null;
        SECTION_DATA[section].forEach(s => {
          const firstWord = s.name.split(' ')[0].toLowerCase();
          if (userText.toLowerCase().includes(s.name.toLowerCase()) || userText.toLowerCase().includes(firstWord)) {
            matchedSubject = s;
          }
        });

        const isOD = userText.toLowerCase().includes('od') || userText.toLowerCase().includes('on duty') || userText.toLowerCase().includes('on-duty');
        
        if (days > 0 && matchedSubject) {
          const classesAffected = Math.ceil(days * (matchedSubject.weekly / 5));
          const happened = matchedSubject.weekly * weeksPassed;
          const currentlyAttended = Math.round(((attendance[matchedSubject.name] || 0) / 100) * happened);
          
          let projectedPercent;
          if (isOD) {
            projectedPercent = ((currentlyAttended + classesAffected) / (happened + classesAffected)) * 100;
            reply = `Processing ${days}-day OD request. You will gain approx ${classesAffected} classes for ${matchedSubject.name}. Your attendance will shift to ${projectedPercent.toFixed(1)}%.`;
          } else {
            projectedPercent = ((currentlyAttended) / (happened + classesAffected)) * 100;
            reply = `Analyzing ${days}-day sick/absent leave. You will miss approx ${classesAffected} classes of ${matchedSubject.name}. Your attendance will drop from ${attendance[matchedSubject.name]||0}% to ${projectedPercent.toFixed(1)}%. `;
            reply += projectedPercent < 75 ? "WARNING: This drops you into the Danger Zone (<75%). Access denied." : "Clearance granted: You remain above the 75% threshold.";
          }
        } else if (days > 0 && !matchedSubject) {
          reply = `I detected a ${days}-day leave request, but couldn't identify the specific subject. Please mention a subject name like "${SECTION_DATA[section][0].name.split(' ')[0]}".`;
        } else {
          reply = "Query not recognized. Ask me about specific leave impacts, e.g., 'If I take 2 days OD, how does it affect Chemistry?'";
        }
      }
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    }, 600);
  };

  const overallHealth = getOverallHealth();

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans bg-black text-gray-200">
      <header className="mb-10 text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase mb-2 drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
          THE CORE CALCULATOR
        </h1>
        <p className="text-xl text-cyan-300/70 font-semibold tracking-widest">ADVANCED ATTENDANCE PROJECTION MATRIX</p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Input & Simulator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-slate-900/80 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.1)] backdrop-blur-md">
            <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Temporal Calibration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-cyan-200/60 uppercase tracking-wider mb-1">System Date</label>
                <div className="w-full bg-slate-800 text-cyan-100 p-2.5 rounded-lg border border-cyan-500/30 font-mono text-sm flex justify-between">
                   <span>{format(parseISO(TODAY), 'MMM dd, yyyy')}</span>
                   <span className="text-cyan-500/50">WK {weeksPassed}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-cyan-200/60 uppercase tracking-wider mb-1">Cohort Selection</label>
                <select 
                  className="w-full bg-slate-950 text-cyan-300 p-2.5 rounded-lg border border-cyan-500/50 focus:border-cyan-400 focus:outline-none transition-all text-sm"
                  value={section}
                  onChange={(e) => {
                    setSection(e.target.value);
                    setAttendance({});
                    setIsCalculated(false);
                  }}
                >
                  <option value="">-- INITIALIZE --</option>
                  {Object.keys(SECTION_DATA).map(sec => <option key={sec} value={sec}>{sec}</option>)}
                </select>
              </div>
            </div>
          </div>

          {section && (
            <div className="p-6 bg-slate-900/80 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.1)] backdrop-blur-md transition-all duration-500">
              <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" /> Metrics Input
              </h2>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {SECTION_DATA[section].map((subj, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-2 rounded border border-slate-700">
                    <label className="text-xs font-semibold text-gray-300 truncate w-3/5" title={subj.name}>
                      {subj.name}
                    </label>
                    <div className="flex items-center gap-1 w-2/5 justify-end">
                      <input 
                        type="number"
                        placeholder="0"
                        className="w-16 bg-slate-950 text-cyan-300 p-1.5 rounded border border-slate-600 focus:border-cyan-400 focus:outline-none text-right font-mono text-sm"
                        value={attendance[subj.name] !== undefined ? attendance[subj.name] : ''}
                        onChange={(e) => handleAttendanceChange(subj.name, e.target.value)}
                      />
                      <span className="text-sm text-cyan-500/50">%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* The OD Simulator Panel */}
              <div className="mt-6 pt-4 border-t border-slate-700/50">
                <h3 className="text-sm font-bold text-fuchsia-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Activity className="w-4 h-4" /> Leave Simulator
                </h3>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Planned Days Off</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full bg-slate-950 text-fuchsia-300 p-2 rounded border border-fuchsia-500/30 focus:border-fuchsia-400 focus:outline-none font-mono"
                      value={leaveDays}
                      onChange={(e) => setLeaveDays(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Leave Type</label>
                    <select 
                      className="w-full bg-slate-950 text-fuchsia-300 p-2 rounded border border-fuchsia-500/30 focus:border-fuchsia-400 focus:outline-none text-sm"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                    >
                      <option value="sick">Sick / Absent</option>
                      <option value="od">Official Duty (OD)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsCalculated(true)}
                className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-lg py-3 rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all"
              >
                Execute Analysis
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Results Dashboard */}
        <div className="lg:col-span-8">
          {isCalculated ? (
            <div className="space-y-6">
              
              {/* Visual Health Overview */}
              <div className="bg-slate-900/80 p-6 rounded-xl border border-cyan-500/30 flex items-center justify-between shadow-[0_0_20px_rgba(0,255,255,0.05)]">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-6 h-6 text-cyan-400" /> Overall System Health
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Aggregated structural integrity across all modules.</p>
                </div>
                <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-slate-800" style={{ background: `conic-gradient(${overallHealth >= 75 ? '#06b6d4' : '#ef4444'} ${overallHealth}%, #1e293b ${overallHealth}%)` }}>
                  <div className="absolute w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center">
                    <span className={`text-2xl font-black font-mono ${overallHealth >= 75 ? 'text-cyan-400' : 'text-red-500'}`}>{overallHealth}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTION_DATA[section].map((subj, idx) => {
                  const basePercent = attendance[subj.name] || 0;
                  const classesHappened = subj.weekly * weeksPassed;
                  const attendedSoFar = Math.round((basePercent / 100) * classesHappened);
                  const totalClassesInSem = subj.weekly * weeksTotal;
                  
                  // Leave Simulator Math
                  const simulatedClassesAffected = Math.ceil(leaveDays * (subj.weekly / 5));
                  let finalAttended = attendedSoFar;
                  let finalHappened = classesHappened;

                  if (leaveDays > 0) {
                    if (leaveType === 'od') {
                      finalAttended += simulatedClassesAffected;
                      finalHappened += simulatedClassesAffected;
                    } else {
                      finalHappened += simulatedClassesAffected;
                    }
                  }

                  const currentPercent = finalHappened === 0 ? 0 : ((finalAttended / finalHappened) * 100);
                  
                  // Projections
                  const classesRemainingInSem = (subj.weekly * weeksRemainingInSem) - simulatedClassesAffected;
                  const requiredFor75 = Math.ceil(0.75 * totalClassesInSem);
                  const neededToReach75 = requiredFor75 - finalAttended;
                  const isIrreversibleDetention = neededToReach75 > Math.max(0, classesRemainingInSem);

                  return (
                    <div key={idx} className={`p-4 rounded-xl relative overflow-hidden transition-all duration-500 ${isIrreversibleDetention ? 'bg-red-950/40 border border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.2)]' : 'bg-slate-900/60 border border-slate-700 hover:border-cyan-500/50'}`}>
                      
                      {isIrreversibleDetention && (
                        <div className="absolute inset-0 bg-red-950/90 z-10 flex flex-col items-center justify-center animate-pulse">
                           <ShieldAlert className="w-10 h-10 text-red-500 mb-1" />
                           <h3 className="text-xl font-black text-red-500 tracking-widest uppercase">Detention</h3>
                        </div>
                      )}

                      <div className={isIrreversibleDetention ? 'opacity-10' : ''}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-bold text-gray-100 w-3/4 truncate" title={subj.name}>{subj.name}</h3>
                          <span className={`text-lg font-black font-mono ${currentPercent < 75 ? 'text-amber-400' : 'text-cyan-400'}`}>
                            {currentPercent.toFixed(1)}%
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-slate-800 h-2 rounded-full mb-4 overflow-hidden">
                          <div className={`h-full rounded-full ${currentPercent >= 90 ? 'bg-emerald-400' : currentPercent >= 75 ? 'bg-cyan-400' : 'bg-amber-400'}`} style={{ width: `${Math.min(currentPercent, 100)}%` }}></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-slate-800/50 p-2 rounded text-center border border-slate-700/50">
                            <p className="text-[10px] text-slate-400 uppercase">Need (75%)</p>
                            <p className="text-sm font-mono text-white">{Math.max(0, neededToReach75)}</p>
                          </div>
                          <div className="bg-slate-800/50 p-2 rounded text-center border border-slate-700/50">
                            <p className="text-[10px] text-slate-400 uppercase">Buffer Left</p>
                            <p className="text-sm font-mono text-white">{Math.max(0, classesRemainingInSem - Math.max(0, neededToReach75))}</p>
                          </div>
                        </div>
                        
                        {leaveDays > 0 && (
                          <div className="text-[10px] text-fuchsia-400 bg-fuchsia-950/30 p-1.5 rounded text-center border border-fuchsia-500/20">
                            Simulated Impact: {leaveType === 'od' ? '+' : '-'}{simulatedClassesAffected} classes
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border border-cyan-900/30 bg-slate-900/30 rounded-xl flex flex-col items-center justify-center text-cyan-600/30 p-10 text-center">
               <Activity className="w-20 h-20 mb-4 opacity-50" />
               <h3 className="text-2xl font-bold mb-2 uppercase">Awaiting Calibration</h3>
               <p className="text-sm max-w-md">Select your cohort and input attendance metrics to map structural limits and simulate temporal anomalies.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Chatbot Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:scale-110 transition-transform z-50 text-slate-900"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chatbot Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-slate-900 border border-cyan-500/50 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="bg-slate-950 p-4 border-b border-cyan-900/50 flex items-center gap-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Attendance Advisor</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-cyan-600 text-slate-950 rounded-br-none font-medium' : 'bg-slate-800 text-cyan-100 border border-cyan-900/50 rounded-bl-none font-mono leading-relaxed'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-cyan-900/50 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask about leave impact..."
              className="flex-1 bg-slate-900 text-cyan-100 p-2.5 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none text-sm"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="bg-cyan-600 text-slate-900 p-2.5 rounded-lg hover:bg-cyan-500 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
