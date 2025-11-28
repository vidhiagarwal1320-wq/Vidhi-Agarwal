
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserProfile, Mentor, AppRoute } from '../types';
import { MOCK_MENTORS } from '../constants';
import { User, Mail, Book, Award, Briefcase, DollarSign, Star, Calendar, CheckCircle2, Zap, ArrowRight, Layout, Lock, GraduationCap, FileText, Heart, Globe, MessageSquare, Loader2 } from 'lucide-react';

/* --- Login Component --- */
interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if(email && password) {
        setLoading(true);
        try {
            await onLogin(email, password);
            navigate(AppRoute.HOME);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Sign in to manage your applications</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B5AFF] outline-none transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <button type="button" className="text-sm text-[#3B5AFF] font-semibold hover:underline">Forgot?</button>
            </div>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B5AFF] outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-[#3B5AFF] text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg text-lg flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Log In'}
          </button>
        </form>
        <div className="text-center mt-6">
            <p className="text-sm text-slate-500">
                Don't have an account? {' '}
                <button onClick={() => navigate(AppRoute.REGISTER)} className="text-[#3B5AFF] font-bold hover:underline">
                    Create Account
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

/* --- Create Account Component --- */
interface CreateAccountProps {
    onRegister: (name: string, email: string, password: string) => Promise<void>;
}

export const CreateAccount: React.FC<CreateAccountProps> = ({ onRegister }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (name && email && password) {
            setLoading(true);
            try {
                await onRegister(name, email, password);
                navigate(AppRoute.HOME);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to create account.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
                    <p className="text-slate-500 mt-2">Start your journey to a top university</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B5AFF] outline-none" 
                            placeholder="e.g. Vidhi Agarwal"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B5AFF] outline-none" 
                            placeholder="jane@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B5AFF] outline-none" 
                            placeholder="Create a strong password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-start gap-3 mt-4">
                        <input type="checkbox" required className="mt-1 w-4 h-4 text-[#3B5AFF] rounded border-slate-300 focus:ring-[#3B5AFF]" />
                        <span className="text-sm text-slate-500">I agree to the Terms of Service and Privacy Policy.</span>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-[#3B5AFF] text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg text-lg mt-4 flex justify-center items-center">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account'}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <p className="text-sm text-slate-500">
                        Already have an account? {' '}
                        <button onClick={() => navigate(AppRoute.LOGIN)} className="text-[#3B5AFF] font-bold hover:underline">
                            Log In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

/* --- Profile Builder Component --- */
interface ProfileBuilderProps {
  profile: UserProfile;
}

export const ProfileBuilder: React.FC<ProfileBuilderProps> = ({ profile }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: 'academics', title: 'Academic Strength', icon: GraduationCap, score: 'Strong', desc: 'GPA, Class Rank, Rigor', action: 'Update Grades' },
    { id: 'tests', title: 'Test Scores', icon: Award, score: 'Excellent', desc: 'GRE, GMAT, TOEFL, IELTS', action: 'Add Score' },
    { id: 'experience', title: 'Work Experience', icon: Briefcase, score: 'Average', desc: 'Internships, Full-time Roles', action: 'Add Role' },
    { id: 'projects', title: 'Projects & Research', icon: Layout, score: 'Weak', desc: 'Capstones, Papers, Labs', action: 'Add Project' },
    { id: 'leadership', title: 'Leadership & ECs', icon: Star, score: 'Good', desc: 'Clubs, Volunteering, Sports', action: 'Add Activity' },
    { id: 'skills', title: 'Skills & Certs', icon: Zap, score: 'Pending', desc: 'Technical, Languages, Courses', action: 'Add Skill' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900">
                {profile.name ? `Build ${profile.name}'s Profile` : 'Build Your Profile'}
            </h1>
            <p className="text-slate-500 mt-2">Track and improve your candidacy for top-tier programs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Scorecard */}
             <div className="md:col-span-1 bg-gradient-to-br from-[#3B5AFF] to-[#00C2A8] rounded-3xl p-8 text-white text-center shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                 <h3 className="text-xl font-bold mb-6 relative z-10">Overall Profile Strength</h3>
                 <div className="w-32 h-32 mx-auto border-8 border-white/30 rounded-full flex items-center justify-center mb-6 relative z-10">
                     <span className="text-5xl font-bold">78</span>
                 </div>
                 <p className="mb-6 opacity-90 relative z-10">You are in the top 15% of candidates for Reach schools.</p>
                 <button className="bg-white text-[#3B5AFF] px-6 py-3 rounded-xl font-bold w-full shadow-md hover:bg-slate-50 transition relative z-10">
                     View Full Analysis
                 </button>
             </div>

             {/* Sections Grid */}
             <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {sections.map(section => (
                     <div 
                        key={section.id} 
                        onClick={() => setActiveSection(section.id)}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#3B5AFF] transition cursor-pointer group"
                     >
                         <div className="flex justify-between items-start mb-4">
                             <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition">
                                 <section.icon className="w-6 h-6 text-slate-700 group-hover:text-[#3B5AFF]" />
                             </div>
                             <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                 section.score === 'Excellent' || section.score === 'Strong' ? 'bg-green-100 text-green-700' :
                                 section.score === 'Pending' || section.score === 'Weak' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                             }`}>
                                 {section.score}
                             </span>
                         </div>
                         <h3 className="font-bold text-lg text-slate-900 mb-1">{section.title}</h3>
                         <p className="text-sm text-slate-500 mb-4">{section.desc}</p>
                         <div className="flex items-center text-[#3B5AFF] font-bold text-sm">
                             {section.action} <ArrowRight className="w-4 h-4 ml-1" />
                         </div>
                     </div>
                 ))}
             </div>
        </div>

        {/* Tools Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
                    <FileText className="w-8 h-8 text-[#3B5AFF] mb-4"/>
                    <h3 className="font-bold text-slate-900 mb-2">SOP Zero Draft</h3>
                    <p className="text-sm text-slate-500 mb-4">Generate a base structure for your Statement of Purpose using AI.</p>
                    <button className="text-[#3B5AFF] font-bold text-sm hover:underline">Start Generator</button>
                </div>
                <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
                    <Heart className="w-8 h-8 text-pink-500 mb-4"/>
                    <h3 className="font-bold text-slate-900 mb-2">Social Impact Ideas</h3>
                    <p className="text-sm text-slate-500 mb-4">Find volunteering opportunities that align with your major.</p>
                    <button className="text-[#3B5AFF] font-bold text-sm hover:underline">Explore Ideas</button>
                </div>
                <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
                    <Globe className="w-8 h-8 text-emerald-500 mb-4"/>
                    <h3 className="font-bold text-slate-900 mb-2">Internship Finder</h3>
                    <p className="text-sm text-slate-500 mb-4">Discover internships that boost your specific profile gaps.</p>
                    <button className="text-[#3B5AFF] font-bold text-sm hover:underline">Search Roles</button>
                </div>
            </div>
        </div>
        
        {/* Simple Modal for "Active Section" (Mock) */}
        {activeSection && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setActiveSection(null)}>
                <div className="bg-white rounded-2xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                    <h3 className="text-2xl font-bold mb-4 capitalize">{activeSection} Details</h3>
                    <p className="text-slate-600 mb-6">This is a detailed view for {activeSection}. In a full implementation, you would edit your {activeSection} data here.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setActiveSection(null)} className="px-5 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                        <button onClick={() => setActiveSection(null)} className="px-5 py-2 rounded-xl font-bold bg-[#3B5AFF] text-white">Save Changes</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

// ... (Mentors, MentorDetail, Account components remain unchanged) ...
export const Mentors: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();
    const categories = ['All', 'Study Abroad', 'Essay', 'Resume', 'Test Prep'];
    const filteredMentors = filter === 'All' ? MOCK_MENTORS : MOCK_MENTORS.filter(m => m.category === filter || (filter === 'Resume' && m.category === 'Study Abroad'));

    return (
        <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto pt-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Find Your Mentor</h1>
                <p className="text-lg text-slate-600">Connect with experts who have been in your shoes.</p>
            </div>

            <div className="flex justify-center gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                            filter === cat 
                            ? 'bg-[#3B5AFF] text-white shadow-md' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map(mentor => (
                    <div 
                        key={mentor.id} 
                        onClick={() => navigate(`/mentor/${mentor.id}`)}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden flex flex-col h-full cursor-pointer group"
                    >
                        <div className="p-6 flex-grow">
                            <div className="flex items-start gap-4 mb-4">
                                <img src={mentor.imageUrl} alt={mentor.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-[#3B5AFF] transition">{mentor.name}</h3>
                                    <p className="text-sm text-[#3B5AFF] font-bold mt-1">{mentor.title}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-semibold">{mentor.category} Mentor</span>
                                    {mentor.specialties.slice(0,2).map(s => (
                                        <span key={s} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-semibold">{s}</span>
                                    ))}
                                </div>
                                <p className="text-slate-500 text-sm line-clamp-3">
                                    {mentor.bio}
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center text-sm font-bold text-slate-900">
                                {mentor.rate}
                                <span className="text-slate-400 font-normal ml-1">/ session</span>
                            </div>
                            <span className="text-sm font-bold text-[#3B5AFF] flex items-center">
                                View Profile <ArrowRight className="w-4 h-4 ml-1"/>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MentorDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const mentor = MOCK_MENTORS.find(m => m.id === id);

    if (!mentor) return <div>Mentor not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 font-medium">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180"/> Back to Mentors
            </button>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
                    <img src={mentor.imageUrl} alt={mentor.name} className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-md" />
                    <div className="flex-grow">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{mentor.name}</h1>
                                <p className="text-lg text-[#3B5AFF] font-semibold mt-1">{mentor.title}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-900">{mentor.rate}</div>
                                <div className="text-slate-500 text-sm">per session</div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {mentor.specialties.map(s => (
                                <span key={s} className="px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-full text-sm">{s}</span>
                            ))}
                        </div>

                        <h3 className="font-bold text-slate-900 mb-2">About</h3>
                        <p className="text-slate-600 leading-relaxed mb-6">{mentor.bio}</p>

                        <div className="flex gap-4">
                            <button className="flex-grow bg-[#111827] text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg">
                                Book a Session
                            </button>
                            <button className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50">
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-[#3B5AFF]"/> Available Slots
                    </h3>
                    <div className="space-y-3">
                        {mentor.availability.map((slot, i) => (
                            <div key={i} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-[#3B5AFF] hover:bg-blue-50 transition cursor-pointer group">
                                <span className="font-bold text-slate-700 group-hover:text-blue-700">{slot}</span>
                                <span className="text-sm font-bold text-[#3B5AFF]">Book</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-[#3B5AFF]"/> Client Reviews
                    </h3>
                    <div className="space-y-4">
                        {mentor.reviews.length > 0 ? mentor.reviews.map(review => (
                            <div key={review.id} className="pb-4 border-b border-slate-100 last:border-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                    <span className="font-bold text-sm text-slate-900">{review.author}</span>
                                </div>
                                <p className="text-slate-600 text-sm italic">"{review.text}"</p>
                            </div>
                        )) : (
                            <p className="text-slate-400 italic">No reviews yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Account: React.FC<{profile: UserProfile}> = ({ profile }) => {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
            
            <div className="space-y-8">
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                    <div className="w-20 h-20 bg-[#3B5AFF] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                        {profile.name ? profile.name[0] : 'U'}
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-slate-900">{profile.name || 'User'}</h3>
                        <p className="text-slate-500">{profile.email || 'No email provided'}</p>
                        <button className="text-[#3B5AFF] text-sm font-bold hover:underline mt-2">Edit Profile</button>
                    </div>
                </div>

                <div className="space-y-3">
                    {['Notification Preferences', 'Privacy & Security', 'Billing & Subscriptions', 'Linked Accounts'].map((item) => (
                         <button key={item} className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition">
                             {item}
                             <ArrowRight className="w-4 h-4 text-slate-400"/>
                         </button>
                    ))}
                </div>

                <div className="pt-4">
                    <button className="text-red-500 font-bold text-sm hover:text-red-700 px-2">Delete Account</button>
                </div>
            </div>
        </div>
    );
};
