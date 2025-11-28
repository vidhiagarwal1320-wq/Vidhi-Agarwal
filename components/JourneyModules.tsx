

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Program, ApplicationSetItem, UserProfile, AppRoute, Tier, Task } from '../types';
import { generateShortlistRecommendation, generateEssayOutline, analyzeFinanceROI } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, Circle, Clock, FileText, Banknote, PenTool, LayoutList, ChevronRight, ArrowLeft, Calendar, Loader2, Sparkles, BookOpen, ShieldCheck, Target, Award, PieChart, TrendingUp, Users } from 'lucide-react';

/* --- Shortlist Component --- */
interface ShortlistProps {
  items: Program[];
  moveToAppSet: (program: Program, tier: Tier) => void;
  appSet: ApplicationSetItem[];
  profile: UserProfile;
}

export const Shortlist: React.FC<ShortlistProps> = ({ items, moveToAppSet, appSet, profile }) => {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Ensure top scroll on mount
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (items.length > 0 && !recommendation) {
      setLoading(true);
      generateShortlistRecommendation(profile).then(res => {
        setRecommendation(res);
        setLoading(false);
      });
    }
  }, [items, profile, recommendation]);

  // Temporary local state for categorization before committing to App Set
  const [selectedTiers, setSelectedTiers] = useState<Record<string, Tier>>({});

  const handleTierChange = (id: string, tier: Tier) => {
      setSelectedTiers(prev => ({...prev, [id]: tier}));
  }

  const isInAppSet = (id: string) => appSet.some(a => a.id === id);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Your Shortlist</h1>
        {appSet.length > 0 && (
             <button onClick={() => navigate(AppRoute.MY_JOURNEY)} className="bg-[#111827] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition flex items-center text-sm">
                Go to My Journey <ChevronRight className="w-4 h-4 ml-2"/>
            </button>
        )}
      </div>

      <div className="bg-gradient-to-r from-[#3B5AFF] to-[#00C2A8] p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 text-white/20 w-24 h-24" />
        <h2 className="text-2xl font-bold mb-3">AI Advisor Analysis</h2>
        {loading ? (
          <div className="flex items-center"><Loader2 className="animate-spin mr-2"/> Analyzing your profile...</div>
        ) : (
          <p className="text-lg opacity-95 max-w-3xl leading-relaxed">{recommendation}</p>
        )}
      </div>

      <div className="grid gap-6">
        {items.map(program => {
            const added = isInAppSet(program.id);
            const currentTier = selectedTiers[program.id] || 'Reach'; // Default
            
            return (
                <div key={program.id} onClick={() => navigate(`/program/${program.id}`)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between lg:items-center gap-6 cursor-pointer hover:border-[#3B5AFF] transition">
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-xl font-bold text-slate-900">{program.university}</h3>
                             {added && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">In App Set</span>}
                        </div>
                        <p className="text-slate-600 font-medium">{program.programName}</p>
                        <div className="flex gap-4 mt-2 text-sm text-slate-500">
                             <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {program.duration}</span>
                             <span className="flex items-center"><Award className="w-3 h-3 mr-1"/> #{program.qsRanking} QS</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center" onClick={e => e.stopPropagation()}>
                        {!added && (
                            <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                                {(['Dream Shot', 'Reach', 'Achievable', 'Safe'] as Tier[]).map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => handleTierChange(program.id, t)}
                                        className={`px-3 py-2 rounded-md text-xs font-bold transition ${
                                            currentTier === t 
                                            ? 'bg-white text-[#3B5AFF] shadow-sm ring-1 ring-black/5' 
                                            : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        {t.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        )}

                        {added ? (
                            <div className="text-slate-400 font-medium flex items-center px-4">
                                <CheckCircle2 className="w-5 h-5 mr-2 text-green-500"/>
                                Added
                            </div>
                        ) : (
                            <div className="flex flex-col items-end">
                                <button 
                                    onClick={() => moveToAppSet(program, currentTier)}
                                    className="w-full sm:w-auto px-6 py-3 bg-[#3B5AFF] text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md whitespace-nowrap mb-2"
                                >
                                    Confirm & Add
                                </button>
                                <span className="text-xs text-[#3B5AFF] font-medium flex items-center">
                                    <Banknote className="w-3 h-3 mr-1"/> Unlock Finance Planning
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
        {items.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 mb-6 text-lg">Your shortlist is currently empty.</p>
                <button onClick={() => navigate(AppRoute.COLLEGE_FINDER)} className="bg-[#3B5AFF] text-white px-8 py-3 rounded-xl font-bold shadow-md">Browse Programs</button>
            </div>
        )}
      </div>
      
      {appSet.length > 0 && items.length > 0 && (
           <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
               <div>
                   <h3 className="font-bold text-slate-900">Ready to start your applications?</h3>
                   <p className="text-slate-500 text-sm">You have {appSet.length} programs in your Application Set.</p>
               </div>
               <button onClick={() => navigate(AppRoute.MY_JOURNEY)} className="bg-[#111827] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition flex items-center">
                   Activate My Journey <ChevronRight className="w-5 h-5 ml-2"/>
               </button>
           </div>
      )}
    </div>
  );
};

/* --- My Journey Component --- */
interface MyJourneyProps {
  appSet: ApplicationSetItem[];
  profile: UserProfile;
}

export const MyJourney: React.FC<MyJourneyProps> = ({ appSet, profile }) => {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (appSet.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-slate-50 p-6 rounded-full mb-6">
            <Target className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Activate Your Journey</h2>
        <p className="text-slate-600 mb-8 max-w-md">You need to confirm your target programs in the Shortlist before we can build your roadmap.</p>
        <button onClick={() => navigate(AppRoute.SHORTLIST)} className="bg-[#3B5AFF] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">
          Go to Shortlist
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">My Journey</h1>
            <p className="text-slate-500 mt-2 text-lg">You are applying to {appSet.length} universities.</p>
        </div>
        <div className="hidden md:block">
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">
                Overall Progress: 15%
            </div>
        </div>
      </div>

      {/* This Week Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-[#3B5AFF]"/> This Week's Priorities
              </h2>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                  {[
                      { title: "Draft SOP for Stanford", due: "Tomorrow", type: "Essay", priority: "High" },
                      { title: "Request LOR from Prof. Smith", due: "Friday", type: "LOR", priority: "Medium" },
                      { title: "Review Financial Docs", due: "Next Mon", type: "Finance", priority: "Medium" },
                  ].map((task, i) => (
                      <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group">
                          <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                              <div>
                                  <h4 className="font-bold text-slate-900 group-hover:text-[#3B5AFF]">{task.title}</h4>
                                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">{task.type} • Due {task.due}</p>
                              </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#3B5AFF]"/>
                      </div>
                  ))}
                  <div className="p-4 text-center">
                      <button className="text-sm font-bold text-[#3B5AFF] hover:underline">View Full Timeline</button>
                  </div>
              </div>
          </div>

          <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Program Workspaces</h2>
              <div className="space-y-4">
                  {appSet.map(app => (
                      <div key={app.id} onClick={() => navigate(`/workspace/${app.id}`)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#3B5AFF] hover:shadow-md transition cursor-pointer group">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-slate-500 uppercase">{app.tier}</span>
                              <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">{app.status}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 group-hover:text-[#3B5AFF] transition truncate">{app.university}</h4>
                          <p className="text-xs text-slate-500 truncate">{app.programName}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Status Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Application Status Tracker</h2>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      <tr>
                          <th className="px-6 py-4">Program</th>
                          <th className="px-6 py-4">Deadline</th>
                          <th className="px-6 py-4">Essays</th>
                          <th className="px-6 py-4">LORs</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {appSet.map(app => (
                          <tr key={app.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-4 font-bold text-slate-900">{app.university}</td>
                              <td className="px-6 py-4 text-sm text-red-500 font-bold">{app.deadline || 'TBA'}</td>
                              <td className="px-6 py-4"><span className="w-3 h-3 bg-amber-400 rounded-full inline-block" title="In Progress"></span></td>
                              <td className="px-6 py-4"><span className="w-3 h-3 bg-slate-200 rounded-full inline-block" title="Not Started"></span></td>
                              <td className="px-6 py-4">
                                  <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600">{app.status}</span>
                              </td>
                              <td className="px-6 py-4">
                                  <button onClick={() => navigate(`/workspace/${app.id}`)} className="text-[#3B5AFF] font-bold text-sm hover:underline">Open Workspace</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

/* --- Program Workspace Component --- */
interface ProgramWorkspaceProps {
  appSet: ApplicationSetItem[];
  profile: UserProfile;
}

export const ProgramWorkspace: React.FC<ProgramWorkspaceProps> = ({ appSet, profile }) => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'essays' | 'resume' | 'checklist'>('overview');
  const [essayOutline, setEssayOutline] = useState<string>('');
  const [roiAnalysis, setRoiAnalysis] = useState<string>('');
  
  // Ref for content scrolling
  const contentRef = useRef<HTMLDivElement>(null);

  // Force scroll to top when Workspace loads
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [programId]);

  // Scroll content to top when activeTab changes
  useEffect(() => {
    if (contentRef.current) {
        contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);
  
  const program = appSet.find(p => p.id === programId);

  useEffect(() => {
    if (program && activeTab === 'essays' && !essayOutline) {
        generateEssayOutline(program, profile).then(setEssayOutline);
    }
    if (program && activeTab === 'finance' && !roiAnalysis) {
        analyzeFinanceROI(program).then(setRoiAnalysis);
    }
  }, [program, activeTab, profile, essayOutline, roiAnalysis]);

  if (!program) return <div className="p-8 text-center">Program not found in your application set.</div>;

  const tabs = [
      { id: 'overview', label: 'Overview', icon: LayoutList },
      { id: 'finance', label: 'Finance', icon: Banknote },
      { id: 'essays', label: 'Essays', icon: PenTool },
      { id: 'resume', label: 'Resume', icon: FileText },
      { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
                <button onClick={() => navigate(AppRoute.MY_JOURNEY)} className="mr-4 p-2 hover:bg-slate-200 rounded-full transition bg-white border border-slate-200 shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-slate-600"/>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                        {program.university}
                        <span className={`ml-3 px-2 py-0.5 text-xs font-bold uppercase rounded border ${
                            program.tier === 'Dream Shot' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            program.tier === 'Reach' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>{program.tier}</span>
                    </h1>
                    <p className="text-slate-500 font-medium">{program.programName}</p>
                </div>
            </div>
            <div className="hidden md:flex flex-col items-end">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Application Deadline</div>
                 <div className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-lg border border-red-100 flex items-center">
                     <Clock className="w-4 h-4 mr-1"/> {program.deadline || 'Jan 15, 2025'}
                 </div>
            </div>
        </div>

        {/* Workspace Container */}
        <div className="flex-grow flex flex-col md:flex-row bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition ${
                            activeTab === tab.id 
                            ? 'bg-white text-[#3B5AFF] shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
                        }`}
                    >
                        <tab.icon className={`w-4 h-4 mr-3 ${activeTab === tab.id ? 'text-[#3B5AFF]' : 'text-slate-400'}`}/>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div ref={contentRef} className="flex-grow p-8 overflow-y-auto bg-white">
                {activeTab === 'overview' && (
                    <div className="max-w-4xl space-y-8">
                        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Program Snapshot</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">Global Rank</div>
                                <div className="text-2xl font-bold text-slate-900">#{program.qsRanking}</div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">Duration</div>
                                <div className="text-2xl font-bold text-slate-900">{program.duration}</div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">Tuition</div>
                                <div className="text-2xl font-bold text-slate-900">${(program.tuition/1000).toFixed(0)}k</div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">Acceptance</div>
                                <div className="text-2xl font-bold text-slate-900">{program.acceptanceRate}</div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-bold mb-3">About the Program</h3>
                            <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">{program.description}</p>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={() => setActiveTab('checklist')} className="bg-[#3B5AFF] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
                                View Application Checklist
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'finance' && (
                    <div className="max-w-4xl space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Financial Planning</h2>
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    program.tuition < 40000 ? 'bg-green-100 text-green-700' : 
                                    program.tuition < 60000 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    Affordability: {program.tuition < 40000 ? 'High' : program.tuition < 60000 ? 'Medium' : 'Low'}
                                </span>
                            </div>
                        </div>
                        
                         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                             <h3 className="font-bold text-blue-900 mb-2 flex items-center"><Sparkles className="w-4 h-4 mr-2"/> AI ROI Analysis</h3>
                             {roiAnalysis ? (
                                 <p className="text-blue-800 text-sm leading-relaxed">{roiAnalysis}</p>
                             ) : (
                                 <div className="flex items-center text-blue-800 text-sm"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Calculating return on investment...</div>
                             )}
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="h-64 w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Cost Breakdown (USD)</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'Tuition', amount: program.tuition },
                                        { name: 'Living', amount: program.fees.living },
                                        { name: 'Accom.', amount: program.fees.accommodation },
                                        { name: 'Misc', amount: program.fees.misc },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                                        <YAxis hide />
                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Bar dataKey="amount" fill="#3B5AFF" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                             
                             <div className="space-y-4">
                                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                     <div className="flex justify-between items-center mb-1">
                                        <span className="text-slate-600 font-medium">Total Estimated Cost</span>
                                        <span className="text-xl font-bold text-slate-900">${(program.tuition + program.fees.living + program.fees.accommodation + program.fees.misc).toLocaleString()}</span>
                                     </div>
                                     <div className="text-xs text-slate-500 text-right">per year</div>
                                 </div>

                                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                     <h4 className="font-bold text-slate-900 mb-3 text-sm">Scholarship Opportunities</h4>
                                     <div className="space-y-2">
                                         {program.scholarships.map((s, i) => (
                                             <div key={i} className="flex justify-between text-sm">
                                                 <span className="text-slate-600">{s.name}</span>
                                                 <div className="flex items-center gap-2">
                                                     <span className="font-bold text-green-600">{s.amount}</span>
                                                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${s.probability === 'High' ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'}`}>{s.probability} Chance</span>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                                  <button onClick={() => navigate(AppRoute.MENTORS)} className="w-full py-3 border-2 border-[#3B5AFF] text-[#3B5AFF] rounded-xl font-bold hover:bg-blue-50 transition">
                                     Find Finance Mentor
                                 </button>
                             </div>
                         </div>
                    </div>
                )}

                {activeTab === 'essays' && (
                    <div className="max-w-4xl h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Statement of Purpose</h2>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 transition">Regenerate Outline</button>
                                <button onClick={() => navigate(AppRoute.MENTORS)} className="px-4 py-2 bg-[#3B5AFF] text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition">Find Essay Mentor</button>
                            </div>
                        </div>
                        
                        <div className="flex-grow flex gap-6 overflow-hidden">
                             {/* Outline Panel */}
                             <div className="w-1/3 bg-slate-50 rounded-2xl border border-slate-200 p-6 overflow-y-auto">
                                <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Suggested Structure</h3>
                                {essayOutline ? (
                                    <div className="prose prose-sm prose-slate max-w-none">
                                         <div className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed">{essayOutline}</div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2"/>
                                        <span className="text-xs">Generating AI Outline...</span>
                                    </div>
                                )}
                             </div>

                             {/* Editor Panel */}
                             <div className="w-2/3 flex flex-col">
                                <textarea 
                                    className="flex-grow w-full p-6 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#3B5AFF] outline-none resize-none text-slate-700 leading-relaxed shadow-sm font-sans"
                                    placeholder="Start drafting your story here. The AI outline on the left is your guide..."
                                ></textarea>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-slate-400 font-medium">Last saved: Just now</span>
                                    <button className="bg-[#111827] text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-slate-800 transition">Save Draft</button>
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                 {activeTab === 'resume' && (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
                        <div className="bg-slate-50 p-8 rounded-full mb-6">
                            <FileText className="w-16 h-16 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Resume Optimization</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Upload your resume to get specific tailoring advice for {program.university}. 
                            We'll highlight keywords and structure improvements based on {program.programName} requirements.
                        </p>
                        
                        <div className="w-full p-10 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 transition cursor-pointer group">
                             <div className="text-[#3B5AFF] font-bold text-lg mb-2 group-hover:underline">Click to upload PDF</div>
                             <div className="text-slate-400 text-sm">or drag and drop here</div>
                        </div>
                        
                        <div className="mt-8 flex gap-4">
                             <button onClick={() => navigate(AppRoute.MENTORS)} className="px-6 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition text-slate-700">Find Resume Mentor</button>
                             <button className="text-[#3B5AFF] font-bold text-sm hover:underline px-4">Use Resume Builder instead</button>
                        </div>
                    </div>
                )}

                {activeTab === 'checklist' && (
                    <div className="max-w-3xl space-y-6">
                        <div className="flex justify-between items-center">
                             <h2 className="text-xl font-bold text-slate-900">Application Checklist</h2>
                             <span className="text-sm font-bold text-slate-500">0/6 Completed</span>
                        </div>
                        
                        <div className="space-y-3">
                            {[
                                { title: 'Submit GRE/GMAT Scores', desc: 'Send official report code to university.' },
                                { title: 'Request Transcripts', desc: 'From all previous institutions.' },
                                { title: 'Draft Statement of Purpose', desc: 'Tailored to program goals.' },
                                { title: 'Update Resume', desc: 'Highlighting relevant experience.' },
                                { title: 'Secure 3 Letters of Recommendation', desc: 'Academic and professional.' },
                                { title: 'Pay Application Fee', desc: 'Usually around $100-$150.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center p-5 bg-white rounded-xl border border-slate-200 hover:border-[#3B5AFF] transition cursor-pointer group shadow-sm">
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 mr-5 flex items-center justify-center group-hover:border-[#3B5AFF] transition">
                                        {/* Checkbox logic */}
                                    </div>
                                    <div>
                                        <h4 className="text-slate-900 font-bold group-hover:text-[#3B5AFF] transition">{item.title}</h4>
                                        <p className="text-slate-500 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};