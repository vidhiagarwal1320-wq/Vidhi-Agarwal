

export interface UserProfile {
  name: string;
  email: string;
  degreeType: string;
  targetMajor: string;
  gpa: string;
  testStatus: string;
  budget: string;
  countries: string[];
  experienceYears: number;
  savedShortlist: Program[]; // Added to fix App.tsx errors
  // Profile Builder Sections
  skills?: string[];
  projects?: string[];
  certifications?: string[];
  leadership?: string[];
  careerGoals?: string;
  
  // Detailed Structures for Interactive Profile Builder
  education?: {
    level: string;
    institution: string;
    gpa: string;
    scoreType: 'GPA' | 'Percentage' | 'CGPA';
    graduationYear: string;
  }[];
  
  tests?: {
    type: 'GMAT' | 'GRE' | 'IELTS' | 'TOEFL' | 'SAT';
    status: 'Planned' | 'Taken';
    score?: string;
    date?: string;
  }[];

  workExperience?: {
    role: string;
    company: string;
    duration: string;
    type: 'Internship' | 'Full-time';
    description: string;
  }[];

  activities?: {
    title: string;
    type: 'Leadership' | 'Volunteering' | 'Club' | 'Sports';
    description: string;
  }[];
}

export interface PlacementStats {
  medianSalary: number;
  employmentRate: string;
  topEmployers: string[];
}

export interface Program {
  id: string;
  university: string;
  programName: string;
  degreeType: string; // e.g., 'MBA', 'MS', 'UG'
  specialization: string; // e.g., 'Marketing', 'CS', 'Data Science'
  country: string;
  city: string;
  qsRanking: number;
  subjectRanking?: number;
  tuition: number; // in USD
  duration: string;
  acceptanceRate: string;
  tags: string[];
  description: string;
  deadline?: string;
  
  // New Detailed Fields
  fees: {
    living: number;
    accommodation: number;
    misc: number;
  };
  scholarships: {
    name: string;
    amount: string;
    probability: 'High' | 'Medium' | 'Low';
  }[];
  placements: PlacementStats;
  prerequisites: string[];
  interviewRequired: boolean;
  interviewSampleQuestions?: string[];
  citySafetyScore: string; // e.g., "High", "Medium"
  accommodationOptions: string[];
}

export type Tier = 'Dream Shot' | 'Reach' | 'Achievable' | 'Safe';
export type AppStatus = 'Planning' | 'Applied' | 'Admitted' | 'Rejected' | 'Waitlisted';

export interface ApplicationSetItem extends Program {
  status: AppStatus;
  round: string;
  appDeadline: string;
  tier: Tier;
  fitScore?: number;
}

export interface MentorReview {
  id: string;
  author: string;
  rating: number;
  text: string;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  imageUrl: string;
  category: 'Study Abroad' | 'Essay' | 'Resume' | 'Test Prep' | 'Finance';
  rate: string;
  bestFor?: string;
  bio: string;
  experienceYears: number;
  reviews: MentorReview[];
  availability: string[]; // Next available slots
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  category: 'Essay' | 'Finance' | 'Test' | 'App' | 'Resume' | 'LOR' | 'Deadline';
  status: 'Pending' | 'In Progress' | 'Completed';
  programId?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

export enum AppRoute {
  HOME = '/',
  COLLEGE_FINDER = '/colleges',
  COLLEGE_DETAIL = '/university/:name',
  PROGRAM_DETAIL = '/program/:id',
  MY_JOURNEY = '/journey',
  PROFILE_BUILDER = '/profile-builder',
  MENTORS = '/mentors',
  MENTOR_DETAIL = '/mentor/:id',
  ACCOUNT = '/account',
  LOGIN = '/login',
  REGISTER = '/register',
  SHORTLIST = '/shortlist',
  WORKSPACE = '/workspace/:programId'
}