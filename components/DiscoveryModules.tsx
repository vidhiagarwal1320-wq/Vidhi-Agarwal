
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Search, Globe, ArrowRight, Filter, Plus, CheckCircle, MapPin, Award, BookOpen, Clock, DollarSign, X, ShieldCheck, Home as HomeIcon, Briefcase, GraduationCap, AlertCircle, Building, ChevronRight } from 'lucide-react';
import { Program, AppRoute } from '../types';
import { MOCK_PROGRAMS as ALL_PROGRAMS } from '../constants';

// --- Smart Search Utilities ---

interface Suggestion {
  type: 'Degree' | 'Specialization' | 'Country' | 'City' | 'University' | 'Combined';
  label: string;
  subLabel?: string;
  data: {
    degreeType?: string;
    specialization?: string;
    country?: string;
    city?: string;
    university?: string;
  };
}

const getUniqueValues = <T,>(arr: T[], key: keyof T): string[] => Array.from(new Set(arr.map(item => String(item[key]))));

// Dynamically derived lists from the NEW global dataset
const DEGREES = getUniqueValues(ALL_PROGRAMS, 'degreeType');
const SPECIALIZATIONS = getUniqueValues(ALL_PROGRAMS, 'specialization');
const COUNTRIES = getUniqueValues(ALL_PROGRAMS, 'country').sort(); 
const CITIES = getUniqueValues(ALL_PROGRAMS, 'city');
const UNIVERSITIES = getUniqueValues(ALL_PROGRAMS, 'university');

const generateSuggestions = (query: string): Suggestion[] => {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const suggestions: Suggestion[] = [];

  // 1. Exact Entity Matches
  DEGREES.forEach(d => {
    if (d.toLowerCase().includes(q)) suggestions.push({ type: 'Degree', label: d, data: { degreeType: d } });
  });
  SPECIALIZATIONS.forEach(s => {
    if (s.toLowerCase().includes(q)) suggestions.push({ type: 'Specialization', label: s, data: { specialization: s } });
  });
  COUNTRIES.forEach(c => {
    if (c.toLowerCase().includes(q)) suggestions.push({ type: 'Country', label: c, data: { country: c } });
  });
  CITIES.forEach(c => {
    if (c.toLowerCase().includes(q)) suggestions.push({ type: 'City', label: c, data: { city: c } });
  });
  UNIVERSITIES.forEach(u => {
    if (u.toLowerCase().includes(q)) suggestions.push({ type: 'University', label: u, data: { university: u } });
  });

  // 2. Smart Combined Matches
  const foundDegree = DEGREES.find(d => q.includes(d.toLowerCase()));
  const foundCountry = COUNTRIES.find(c => q.includes(c.toLowerCase()));
  const foundSpec = SPECIALIZATIONS.find(s => q.includes(s.toLowerCase()));
  const foundCity = CITIES.find(c => q.includes(c.toLowerCase()));

  if (foundDegree && foundCountry) {
    suggestions.unshift({
      type: 'Combined',
      label: `${foundDegree} in ${foundCountry}`,
      subLabel: 'Degree + Country',
      data: { degreeType: foundDegree, country: foundCountry }
    });
  }
  if (foundDegree && foundSpec) {
     suggestions.unshift({
      type: 'Combined',
      label: `${foundDegree} in ${foundSpec}`,
      subLabel: 'Degree + Specialization',
      data: { degreeType: foundDegree, specialization: foundSpec }
    });
  }
  if (foundDegree && foundCity) {
      suggestions.unshift({
        type: 'Combined',
        label: `${foundDegree} in ${foundCity}`,
        subLabel: 'Degree + City',
        data: { degreeType: foundDegree, city: foundCity }
      });
  }
  if (foundDegree && foundSpec && foundCountry) {
      suggestions.unshift({
      type: 'Combined',
      label: `${foundDegree} in ${foundSpec} in ${foundCountry}`,
      subLabel: 'Exact Match',
      data: { degreeType: foundDegree, specialization: foundSpec, country: foundCountry }
    });
  }

  return suggestions.slice(0, 8); // Limit results
};

const GlobalSearchBar: React.FC<{
  initialQuery?: string;
  placeholder?: string;
  variant?: 'hero' | 'compact';
  onSearch?: (filters: any) => void;
}> = ({ initialQuery = '', placeholder, variant = 'hero', onSearch }) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSuggestions(generateSuggestions(query));
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (s: Suggestion) => {
    setQuery(s.label);
    setShowSuggestions(false);
    
    if (s.type === 'University' && s.data.university) {
      navigate(`/university/${encodeURIComponent(s.data.university)}`);
    } else {
      const targetState = {
        degreeType: s.data.degreeType || '',
        specialization: s.data.specialization || '',
        country: s.data.country || '',
        city: s.data.city || ''
      };
      
      if (onSearch) {
        onSearch(targetState);
      } else {
        navigate(AppRoute.COLLEGE_FINDER, { state: targetState });
      }
    }
  };

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      const foundDegree = DEGREES.find(d => query.toLowerCase().includes(d.toLowerCase())) || '';
      const foundCountry = COUNTRIES.find(c => query.toLowerCase().includes(c.toLowerCase())) || '';
      const foundSpec = SPECIALIZATIONS.find(s => query.toLowerCase().includes(s.toLowerCase())) || '';
      const foundUni = UNIVERSITIES.find(u => query.toLowerCase().includes(u.toLowerCase()));
      const foundCity = CITIES.find(c => query.toLowerCase().includes(c.toLowerCase())) || '';

      if (foundUni) {
          navigate(`/university/${encodeURIComponent(foundUni)}`);
          return;
      }

      const targetState = {
        degreeType: foundDegree,
        specialization: foundSpec,
        country: foundCountry,
        city: foundCity
      };

      if (onSearch) {
          onSearch(targetState);
      } else {
          navigate(AppRoute.COLLEGE_FINDER, { state: targetState });
      }
    }
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'University': return <Building className="w-4 h-4 text-slate-400"/>;
          case 'Country': return <Globe className="w-4 h-4 text-slate-400"/>;
          case 'City': return <MapPin className="w-4 h-4 text-slate-400"/>;
          case 'Degree': return <GraduationCap className="w-4 h-4 text-slate-400"/>;
          case 'Specialization': return <BookOpen className="w-4 h-4 text-slate-400"/>;
          default: return <Search className="w-4 h-4 text-slate-400"/>;
      }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${variant === 'hero' ? 'max-w-xl mx-auto' : ''}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder || "Search for universities, degrees, or countries..."}
          className={`w-full pl-12 pr-4 ${variant === 'hero' ? 'py-4 rounded-2xl shadow-sm' : 'py-3 rounded-xl'} border border-slate-200 focus:ring-2 focus:ring-[#3B5AFF] focus:border-transparent outline-none transition-all`}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleEnterKey}
        />
        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 ${variant === 'hero' ? 'w-5 h-5' : 'w-4 h-4'}`} />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-100 shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
            {suggestions.map((s, idx) => (
                <div 
                    key={idx}
                    onClick={() => handleSelect(s)}
                    className="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                >
                    <div className="mr-3 bg-slate-50 p-2 rounded-lg">{getIcon(s.type)}</div>
                    <div>
                        <div className="font-bold text-slate-800 text-sm">{s.label}</div>
                        {s.subLabel && <div className="text-xs text-slate-500">{s.subLabel}</div>}
                        {!s.subLabel && <div className="text-xs text-slate-500">{s.type}</div>}
                    </div>
                    {s.type === 'University' && <ArrowRight className="ml-auto w-4 h-4 text-slate-300"/>}
                </div>
            ))}
        </div>
      )}
    </div>
  );
};


interface HomeProps {
  isLoggedIn: boolean;
  userName?: string;
}

export const Home: React.FC<HomeProps> = ({ isLoggedIn, userName }) => {
  const navigate = useNavigate();
  const degrees = ['MBA', 'MS', 'MiM', 'Undergraduate', 'Design', 'Law'];
  const [popularPrograms, setPopularPrograms] = useState<Program[]>([]);
  
  // Popular Countries List (including India)
  const popularCountries = [
    "USA", "UK", "Canada", "Germany", "France", "Australia", 
    "Singapore", "India", "Switzerland", "Netherlands", "Ireland", "Spain"
  ];
  
  // SHUFFLE LOGIC: Randomize programs on mount to ensure jumbled/fresh view
  useEffect(() => {
      const shuffled = [...ALL_PROGRAMS].sort(() => 0.5 - Math.random());
      setPopularPrograms(shuffled.slice(0, 8));
  }, []);

  const recommendedPrograms = ALL_PROGRAMS.slice(0, 3);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-8 pt-8">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
          {isLoggedIn ? `Welcome back, ${userName}` : 'Your Global Education Journey Starts Here'}
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {isLoggedIn 
            ? "Track your applications, manage deadlines, and connect with mentors from your personalized dashboard."
            : "Discover top programs, build a winning profile, and get matched with world-class mentors to achieve your dream."}
        </p>
        
        <GlobalSearchBar />
        
        {!isLoggedIn && (
           <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
             <button onClick={() => navigate(AppRoute.REGISTER)} className="bg-[#3B5AFF] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg text-lg">
               Start Your Journey
             </button>
             <button onClick={() => navigate(AppRoute.COLLEGE_FINDER)} className="bg-white text-[#3B5AFF] border-2 border-[#3B5AFF] px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition text-lg">
               Explore Colleges
             </button>
           </div>
        )}
        
        {isLoggedIn && (
           <div className="flex justify-center gap-4 pt-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer w-full max-w-md text-left flex items-center justify-between group" onClick={() => navigate(AppRoute.MY_JOURNEY)}>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#3B5AFF]">Continue Your Journey</h3>
                    <p className="text-slate-500">View upcoming deadlines and tasks</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3B5AFF] group-hover:bg-[#3B5AFF] group-hover:text-white transition">
                    <ArrowRight className="w-5 h-5" />
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Guest: Explore by Degree */}
      {!isLoggedIn && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Explore by Degree</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {degrees.map((d) => (
              <div key={d} onClick={() => navigate(AppRoute.COLLEGE_FINDER, {state: {degreeType: d}})} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#3B5AFF]/30 transition cursor-pointer text-center group">
                <div className="mb-3 w-10 h-10 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#3B5AFF] transition">
                    <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-slate-700 font-bold group-hover:text-[#3B5AFF]">{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Programs Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Popular Global Programs</h2>
          <button onClick={() => navigate(AppRoute.COLLEGE_FINDER)} className="text-[#3B5AFF] font-bold hover:underline flex items-center">
            Explore All <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popularPrograms.map((prog) => (
            <div key={prog.id} onClick={() => navigate(`/program/${prog.id}`)} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition flex flex-col h-full group cursor-pointer">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-[#3B5AFF] bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wide">{prog.country}</span>
                  <div className="flex items-center text-amber-500 text-sm font-bold">
                    <Award className="w-4 h-4 mr-1" />
                    #{prog.qsRanking} QS
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#3B5AFF] transition line-clamp-2">{prog.university}</h3>
                <p className="text-slate-600 font-medium mb-4 line-clamp-1">{prog.programName}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {prog.city}</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {prog.duration}</span>
                    <span className="flex items-center"><DollarSign className="w-3 h-3 mr-1"/> {prog.tuition.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button className="w-full py-2 text-sm font-bold text-slate-700 hover:text-[#3B5AFF] transition flex items-center justify-center">
                    View Program Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
       {/* Guest: Popular Countries */}
       {!isLoggedIn && (
        <div className="space-y-6 pb-12">
          <h2 className="text-2xl font-bold text-slate-900">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {popularCountries.map(country => (
                   <div key={country} onClick={() => navigate(AppRoute.COLLEGE_FINDER, {state: {country: country}})} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#3B5AFF] cursor-pointer transition text-center font-semibold text-slate-700 hover:text-[#3B5AFF] hover:shadow-md">
                       {country}
                   </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface CollegeFinderProps {
  shortlist: Program[];
  addToShortlist: (program: Program) => void;
  removeFromShortlist: (programId: string) => void;
  isLoggedIn: boolean;
}

export const CollegeFinder: React.FC<CollegeFinderProps> = ({ shortlist, addToShortlist, removeFromShortlist, isLoggedIn }) => {
  const location = useLocation();
  const [filters, setFilters] = useState({ 
      country: '', 
      maxTuition: 100000,
      degreeType: '',
      specialization: '',
      city: ''
    });
  
  useEffect(() => {
    if (location.state) {
      setFilters(prev => ({ ...prev, ...location.state }));
    }
  }, [location.state]);

  const navigate = useNavigate();

  const isShortlisted = (id: string) => shortlist.some(p => p.id === id);

  const results = useMemo(() => {
    const baseCandidates = ALL_PROGRAMS.filter(p => p.tuition <= filters.maxTuition);

    const matchesDegree = (p: Program) => !filters.degreeType || p.degreeType === filters.degreeType;
    const matchesCountry = (p: Program) => !filters.country || p.country === filters.country;
    const matchesSpecialization = (p: Program) => !filters.specialization || p.specialization === filters.specialization;
    const matchesCity = (p: Program) => !filters.city || p.city === filters.city;

    const exactMatches = baseCandidates.filter(p => matchesDegree(p) && matchesCountry(p) && matchesSpecialization(p) && matchesCity(p));

    return exactMatches; 
  }, [filters]);

  const handleShortlist = (program: Program, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isShortlisted(program.id)) {
      removeFromShortlist(program.id);
    } else {
      if (!isLoggedIn && shortlist.length >= 10) {
        if(confirm("Guest limit reached (10 items). Please login to shortlist more and save your progress permanently.")) {
            navigate(AppRoute.LOGIN);
        }
        return;
      }
      addToShortlist(program);
    }
  };

  const renderProgramCard = (program: Program) => {
      const shortlisted = isShortlisted(program.id);
      return (
        <div 
            key={program.id} 
            onClick={() => navigate(`/program/${program.id}`)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#3B5AFF]/30 transition flex flex-col md:flex-row justify-between gap-6 group cursor-pointer mb-4"
        >
            <div className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-bold uppercase tracking-wide">{program.degreeType}</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-semibold uppercase tracking-wide">{program.specialization}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#3B5AFF] transition">{program.programName}</h3>
                <div className="text-slate-500 font-medium mb-4">{program.university}</div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-600">
                    <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-slate-400 text-xs font-semibold">Ranking</div>
                        <div className="font-bold text-slate-900">#{program.qsRanking} QS</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-slate-400 text-xs font-semibold">Tuition</div>
                        <div className="font-bold text-slate-900">${program.tuition.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-slate-400 text-xs font-semibold">Duration</div>
                        <div className="font-bold text-slate-900">{program.duration}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-slate-400 text-xs font-semibold">Location</div>
                        <div className="font-bold text-slate-900">{program.city}, {program.country}</div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-center min-w-[160px]">
                <button 
                    onClick={(e) => handleShortlist(program, e)}
                    className={`w-full px-6 py-4 rounded-xl font-bold flex items-center justify-center transition shadow-sm ${
                        shortlisted 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-[#3B5AFF] text-white hover:bg-blue-700 shadow-md'
                    }`}
                >
                    {shortlisted ? <><CheckCircle className="w-4 h-4 mr-2"/> Added</> : <><Plus className="w-4 h-4 mr-2"/> Shortlist</>}
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/university/${encodeURIComponent(program.university)}`) }}
                    className="mt-2 text-sm text-slate-500 font-medium hover:text-[#3B5AFF] py-2 z-10 relative"
                >
                    View College Info
                </button>
            </div>
        </div>
      );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-slate-900 font-bold text-lg">
                <Filter className="w-5 h-5 mr-2" />
                Filters
            </div>
            {(filters.country || filters.maxTuition < 100000 || filters.degreeType) && (
                <button 
                    onClick={() => setFilters({country: '', maxTuition: 100000, degreeType: '', specialization: '', city: ''})}
                    className="text-xs font-semibold text-[#3B5AFF] hover:underline"
                >
                    Clear All
                </button>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Degree Type</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3B5AFF] outline-none bg-slate-50"
                value={filters.degreeType}
                onChange={(e) => setFilters({...filters, degreeType: e.target.value})}
              >
                <option value="">All Degrees</option>
                {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Specialization</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3B5AFF] outline-none bg-slate-50"
                value={filters.specialization}
                onChange={(e) => setFilters({...filters, specialization: e.target.value})}
              >
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3B5AFF] outline-none bg-slate-50"
                value={filters.country}
                onChange={(e) => setFilters({...filters, country: e.target.value})}
              >
                <option value="">All Countries</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Max Tuition</label>
              <input 
                type="range" 
                min="0" 
                max="100000" 
                step="5000"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3B5AFF]"
                value={filters.maxTuition}
                onChange={(e) => setFilters({...filters, maxTuition: parseInt(e.target.value)})}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                  <span>$0</span>
                  <span>${filters.maxTuition.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="mb-6">
           <GlobalSearchBar variant="compact" placeholder="Refine search by degree, university, country or city..." onSearch={(newFilters) => setFilters(prev => ({...prev, ...newFilters}))} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-900">
              {results.length > 0 ? `Matching Programs (${results.length})` : 'Explore Programs'}
          </h2>
          {!isLoggedIn && (
            <div className="bg-amber-50 text-amber-800 text-sm px-4 py-2 rounded-lg border border-amber-100 flex items-center">
                Guest Mode: Shortlist limited to 10 programs.
            </div>
          )}
        </div>

        <div className="space-y-4">
            {results.map(renderProgramCard)}

            {results.length === 0 && (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium mb-4">No programs match your current filters.</p>
                    <button onClick={() => setFilters({country: '', maxTuition: 100000, degreeType: '', specialization: '', city: ''})} className="text-[#3B5AFF] font-bold hover:underline">
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export const ProgramDetail: React.FC<{shortlist: Program[], addToShortlist: any, removeFromShortlist: any, isLoggedIn: boolean, hasAppSet: boolean}> = ({ shortlist, addToShortlist, removeFromShortlist, isLoggedIn, hasAppSet }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const program = ALL_PROGRAMS.find(p => p.id === id);

    if(!program) return <div className="p-8">Program not found</div>;

    const isShortlisted = shortlist.some(p => p.id === program.id);

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 font-medium mb-6">
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180"/> Back
                </button>
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-8">
                    <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {program.tags.map(t => <span key={t} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">{t}</span>)}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{program.programName}</h1>
                        <h2 onClick={() => navigate(`/university/${encodeURIComponent(program.university)}`)} className="text-xl text-[#3B5AFF] font-bold hover:underline cursor-pointer">{program.university}</h2>
                        <div className="flex gap-6 mt-6 text-sm font-medium text-slate-500">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {program.city}, {program.country}</span>
                            <span className="flex items-center"><Award className="w-4 h-4 mr-1"/> #{program.qsRanking} QS Global</span>
                            <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1"/> #{program.subjectRanking} Subject Rank</span>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center gap-3 min-w-[200px]">
                        <button 
                            onClick={() => isShortlisted ? removeFromShortlist(program.id) : addToShortlist(program)}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition shadow-lg ${
                                isShortlisted ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-[#3B5AFF] text-white'
                            }`}
                        >
                             {isShortlisted ? <><CheckCircle className="w-5 h-5 mr-2"/> Added to Shortlist</> : <><Plus className="w-5 h-5 mr-2"/> Add to Shortlist</>}
                        </button>
                        {hasAppSet && isShortlisted && (
                            <button onClick={() => navigate(`/workspace/${program.id}`)} className="w-full py-3 bg-[#111827] text-white rounded-xl font-bold hover:bg-slate-800 transition">
                                Go to Workspace
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Program Overview</h3>
                        <p className="text-slate-600 leading-relaxed text-lg">{program.description}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-[#3B5AFF]"/> Career Outcomes</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Median Salary</span>
                                    <span className="font-bold text-slate-900">${program.placements.medianSalary.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Employment Rate</span>
                                    <span className="font-bold text-green-600">{program.placements.employmentRate}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-100">
                                    <span className="text-xs text-slate-400 uppercase font-bold">Top Employers</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {program.placements.topEmployers.map(e => <span key={e} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded border border-slate-100">{e}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center"><GraduationCap className="w-5 h-5 mr-2 text-[#3B5AFF]"/> Prerequisites</h4>
                            <ul className="space-y-2">
                                {program.prerequisites.map((req, i) => (
                                    <li key={i} className="flex items-start text-sm text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2"></div>
                                        {req}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <span className="text-sm font-bold text-slate-900">Interview: </span>
                                <span className={program.interviewRequired ? 'text-amber-600 font-bold' : 'text-slate-500'}>{program.interviewRequired ? 'Required' : 'Not Required'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Accommodation */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                         <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center"><HomeIcon className="w-5 h-5 mr-2 text-[#3B5AFF]"/> Living & Accommodation</h3>
                         <div className="flex items-center mb-4">
                             <span className="text-slate-500 mr-2">City Safety Score:</span>
                             <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${program.citySafetyScore === 'High' || program.citySafetyScore === 'Very High' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{program.citySafetyScore}</span>
                         </div>
                         <div className="space-y-2">
                             {program.accommodationOptions.map((opt, i) => (
                                 <div key={i} className="p-3 bg-slate-50 rounded-lg text-slate-700 text-sm font-medium border border-slate-100">{opt}</div>
                             ))}
                         </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                        <h3 className="font-bold text-slate-900 mb-6">Financial Snapshot</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Tuition (Yearly)</span>
                                <span className="font-bold text-slate-900">${program.tuition.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Living Costs</span>
                                <span className="font-bold text-slate-900 text-sm">${program.fees.living.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                <span className="text-slate-900 font-bold">Total Est.</span>
                                <span className="font-bold text-[#3B5AFF] text-xl">${(program.tuition + program.fees.living + program.fees.accommodation).toLocaleString()}</span>
                            </div>
                        </div>
                        
                        {!hasAppSet && (
                            <div className="p-4 bg-blue-50 rounded-xl text-blue-800 text-sm mb-4">
                                Add this program to your Application Set to unlock detailed financial planning & ROI calculator.
                            </div>
                        )}
                        
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Scholarships</h4>
                            {program.scholarships.map((s, i) => (
                                <div key={i} className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-slate-700 font-medium truncate max-w-[150px]">{s.name}</span>
                                    <span className="text-green-600 font-bold">{s.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const UniversityDetail: React.FC = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(name || '');
    const programs = ALL_PROGRAMS.filter(p => p.university === decodedName);
    const uniInfo = programs[0]; // Use first program to get uni details

    if(!uniInfo) return <div className="p-8">University not found</div>;

    return (
        <div className="space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 font-medium">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180"/> Back
            </button>

            <div className="bg-[#111827] rounded-3xl p-10 text-white shadow-xl">
                <h1 className="text-4xl font-bold mb-4">{uniInfo.university}</h1>
                <div className="flex flex-wrap gap-6 text-lg opacity-90">
                     <span className="flex items-center"><MapPin className="w-5 h-5 mr-2"/> {uniInfo.city}, {uniInfo.country}</span>
                     <span className="flex items-center"><Award className="w-5 h-5 mr-2"/> Top 50 Global Rank</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Programs ({programs.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programs.map(p => (
                        <div key={p.id} onClick={() => navigate(`/program/${p.id}`)} className="p-6 border border-slate-200 rounded-xl hover:border-[#3B5AFF] hover:shadow-md transition cursor-pointer group">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#3B5AFF]">{p.programName}</h3>
                                     <div className="text-slate-500 text-sm mt-1">{p.duration} • ${p.tuition.toLocaleString()}</div>
                                 </div>
                                 <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#3B5AFF]"/>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
