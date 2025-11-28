
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { Home, CollegeFinder, ProgramDetail, UniversityDetail } from './components/DiscoveryModules';
import { Shortlist, MyJourney, ProgramWorkspace } from './components/JourneyModules';
import { Login, CreateAccount, ProfileBuilder, Mentors, MentorDetail, Account } from './components/UserModules';
import { AppRoute, UserProfile, Program, ApplicationSetItem, Tier } from './types';
import { INITIAL_PROFILE } from './constants';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [session, setSession] = useState<any>(null);
  const [applicationSet, setApplicationSet] = useState<ApplicationSetItem[]>([]);

  // 1. Initialize Auth Session and Listen for Changes
  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoggedIn(!!session);
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      }
    });

    // Listen for auth changes (login, logout, signup)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoggedIn(!!session);
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        // Clear state on logout
        setUserProfile(INITIAL_PROFILE);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Profile from 'profiles' table
  const fetchProfile = async (userId: string, email: string | undefined) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        // Merge fetched data with initial structure
        // Assumes 'profile_data' column exists for rich data, otherwise fallbacks to columns
        const loadedProfile: UserProfile = {
             ...INITIAL_PROFILE,
             ...(data.profile_data || {}), 
             name: data.full_name || '',
             email: data.email || email || ''
        };
        
        // Ensure arrays are initialized
        if (!loadedProfile.savedShortlist) loadedProfile.savedShortlist = [];
        
        setUserProfile(loadedProfile);
      } else if (email) {
        // If profile doesn't exist but user is auth'd (e.g. manual auth row creation), init basic
         setUserProfile({ ...INITIAL_PROFILE, email });
      }
    } catch (error) {
      console.error('Unexpected error loading user data:', error);
    }
  };

  // 3. Save Profile (Upsert) - Persist Shortlist etc.
  const saveProfileToSupabase = async (profile: UserProfile) => {
    if (!session?.user) return;

    try {
      const updates = {
        id: session.user.id,
        email: session.user.email,
        full_name: profile.name,
        profile_data: profile, // Store full object in JSONB column
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        // Handle case where profile_data column might be missing (fallback)
        if(error.message?.includes('profile_data')) {
             await supabase.from('profiles').upsert({
                id: session.user.id,
                email: session.user.email,
                full_name: profile.name,
                updated_at: new Date()
             });
        } else {
             throw error;
        }
      }
      
      setUserProfile(profile);
      
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };


  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    // 1. Supabase Auth SignUp
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            },
        },
    });
    
    if (error) throw error;

    // 2. Insert into 'profiles' table upon success
    if (data.user) {
        const newProfile = { ...INITIAL_PROFILE, name, email };
        
        const { error: profileError } = await supabase.from('profiles').insert([
            { 
                id: data.user.id,
                email: email,
                full_name: name,
                profile_data: newProfile 
            }
        ]);
        
        // Graceful fallback if profile_data column doesn't exist
        if (profileError) {
            console.error("Initial profile insert failed:", profileError.message);
            if(profileError.message?.includes('profile_data')) {
                 await supabase.from('profiles').insert([
                    { id: data.user.id, email: email, full_name: name }
                ]);
            }
        }
        
        setUserProfile(newProfile);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserProfile(INITIAL_PROFILE);
    setSession(null);
  };

  // Strict Shortlist Logic
  const currentShortlist = isLoggedIn ? userProfile.savedShortlist : [];

  const addToShortlist = (program: Program) => {
    if (isLoggedIn) {
        if (!userProfile.savedShortlist.find(p => p.id === program.id)) {
            const updatedProfile = {
                ...userProfile,
                savedShortlist: [...userProfile.savedShortlist, program]
            };
            saveProfileToSupabase(updatedProfile);
        }
    } else {
        console.warn("Attempted to shortlist while logged out.");
    }
  };

  const removeFromShortlist = (programId: string) => {
    if (isLoggedIn) {
        const updatedProfile = {
            ...userProfile,
            savedShortlist: userProfile.savedShortlist.filter(p => p.id !== programId)
        };
        saveProfileToSupabase(updatedProfile);
    }
  };

  const moveToAppSet = (program: Program, tier: Tier) => {
    if (!applicationSet.find(a => a.id === program.id)) {
      const newItem: ApplicationSetItem = {
        ...program,
        status: 'Planning',
        round: 'Round 1',
        appDeadline: program.deadline || '2025-01-01',
        tier: tier
      };
      setApplicationSet([...applicationSet, newItem]);
    }
  };

  return (
    <Router>
      <ScrollToTop />
      <Layout 
        isLoggedIn={isLoggedIn} 
        onLogout={handleLogout}
        hasApplicationSet={applicationSet.length > 0}
        shortlistCount={currentShortlist.length}
      >
        <Routes>
          <Route path={AppRoute.HOME} element={<Home isLoggedIn={isLoggedIn} userName={userProfile.name} />} />
          
          <Route path={AppRoute.LOGIN} element={<Login onLogin={handleLogin} />} />
          <Route path={AppRoute.REGISTER} element={<CreateAccount onRegister={handleRegister} />} />
          
          <Route path={AppRoute.COLLEGE_FINDER} element={
            <CollegeFinder 
              shortlist={currentShortlist} 
              addToShortlist={addToShortlist} 
              removeFromShortlist={removeFromShortlist}
              isLoggedIn={isLoggedIn}
            />
          } />

          <Route path={AppRoute.PROGRAM_DETAIL} element={
             <ProgramDetail 
                shortlist={currentShortlist}
                addToShortlist={addToShortlist}
                removeFromShortlist={removeFromShortlist}
                isLoggedIn={isLoggedIn}
                hasAppSet={applicationSet.length > 0}
             />
          } />

          <Route path={AppRoute.COLLEGE_DETAIL} element={<UniversityDetail />} />

          <Route path={AppRoute.SHORTLIST} element={
            isLoggedIn ? (
              <Shortlist 
                items={currentShortlist} 
                moveToAppSet={moveToAppSet} 
                appSet={applicationSet}
                profile={userProfile}
              />
            ) : (
               <Navigate to={AppRoute.LOGIN} />
            )
          } />

          <Route path={AppRoute.MY_JOURNEY} element={
            isLoggedIn ? <MyJourney appSet={applicationSet} profile={userProfile} /> : <Navigate to={AppRoute.LOGIN} />
          } />

          <Route path={AppRoute.WORKSPACE} element={
            isLoggedIn ? <ProgramWorkspace appSet={applicationSet} profile={userProfile} /> : <Navigate to={AppRoute.LOGIN} />
          } />

          <Route path={AppRoute.PROFILE_BUILDER} element={
            isLoggedIn ? <ProfileBuilder profile={userProfile} /> : <Navigate to={AppRoute.LOGIN} />
          } />

          <Route path={AppRoute.MENTORS} element={
            isLoggedIn ? <Mentors /> : <Navigate to={AppRoute.LOGIN} />
          } />

          <Route path={AppRoute.MENTOR_DETAIL} element={
            isLoggedIn ? <MentorDetail /> : <Navigate to={AppRoute.LOGIN} />
          } />

           <Route path={AppRoute.ACCOUNT} element={
            isLoggedIn ? <Account profile={userProfile} /> : <Navigate to={AppRoute.LOGIN} />
          } />

          <Route path="*" element={<Navigate to={AppRoute.HOME} />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
