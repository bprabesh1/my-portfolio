export interface ProfileData {
  name: string;
  initials: string;
  title: string;
  tagline: string;
  bioSummary: string;
  aboutMe: string;
  location: string;
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  avatarUrl: string;
  resumeUrl: string;
  highlights: string[];
}

export type MilestoneCategory = 'education' | 'experience';

export interface JourneyMilestone {
  id: string;
  category: MilestoneCategory;
  year: string;
  period?: string;
  title: string;
  organization: string;
  description: string;
  skills?: string[];
  treePosition?: {
    branch: 'left' | 'right';
    heightPercent: number;
    xOffset: number;
  };
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: 'Full-Stack' | 'Networking' | 'Database' | 'Systems';
  tags: string[];
  imageUrl: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  highlights?: string[];
  featured?: boolean;
}

export interface SkillItem {
  name: string;
  level?: number;
}

export interface SkillCategory {
  id: string;
  title: string;
  iconName: string;
  skills: SkillItem[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: 'Super Admin' | 'Editor';
  createdAt: string;
}

export interface PortfolioDatabase {
  profile: ProfileData;
  milestones: JourneyMilestone[];
  projects: ProjectItem[];
  skillCategories: SkillCategory[];
  messages: ContactMessage[];
  admins: AdminUser[];
  adminCredentials: {
    username: string;
    email: string;
    passwordHash: string;
    securityQuestion: string;
    securityAnswer: string;
  };
}
