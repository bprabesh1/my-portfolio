import { hashSecret, verifySecret, isHashed, cleanText } from './security';
import { INITIAL_DATA } from '../data/initialData';
import {
  AdminUser,
  ContactMessage,
  JourneyMilestone,
  PortfolioDatabase,
  ProfileData,
  ProjectItem,
  SkillCategory,
} from '../types/portfolio';

const STORAGE_KEY = 'prabesh_portfolio_db_v5';
const LISTENERS: Array<() => void> = [];

export function getDatabase(): PortfolioDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabase(INITIAL_DATA);
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw) as PortfolioDatabase;
    if (!parsed.profile || !parsed.milestones || !parsed.projects) {
      saveDatabase(INITIAL_DATA);
      return INITIAL_DATA;
    }
    // ensure admins array exists
    if (!parsed.admins) {
      parsed.admins = INITIAL_DATA.admins;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load portfolio database, using initial data:', err);
    return INITIAL_DATA;
  }
}

export function saveDatabase(data: PortfolioDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notifyListeners();
  } catch (err) {
    console.error('Failed to save portfolio database:', err);
  }
}

export function resetDatabaseToDefault(): PortfolioDatabase {
  saveDatabase(INITIAL_DATA);
  return INITIAL_DATA;
}

export function exportDatabaseJson(): string {
  const db = getDatabase();
  return JSON.stringify(db, null, 2);
}

export function importDatabaseJson(jsonString: string): boolean {
  try {
    if (jsonString.length > 5_000_000) return false;
    const parsed = JSON.parse(jsonString) as PortfolioDatabase;
    if (parsed.profile && parsed.milestones && parsed.projects) {
      saveDatabase(parsed);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Profile updates
export function updateProfile(newProfile: Partial<ProfileData>): ProfileData {
  const db = getDatabase();
  db.profile = { ...db.profile, ...newProfile };
  saveDatabase(db);
  return db.profile;
}

// Milestones CRUD
export function addMilestone(milestone: Omit<JourneyMilestone, 'id'>): JourneyMilestone {
  const db = getDatabase();
  const id = `milestone-${Date.now()}`;
  const newMilestone: JourneyMilestone = { ...milestone, id };
  db.milestones.push(newMilestone);
  saveDatabase(db);
  return newMilestone;
}

export function updateMilestone(milestone: JourneyMilestone): void {
  const db = getDatabase();
  const idx = db.milestones.findIndex((m) => m.id === milestone.id);
  if (idx !== -1) {
    db.milestones[idx] = milestone;
    saveDatabase(db);
  }
}

export function deleteMilestone(id: string): void {
  const db = getDatabase();
  db.milestones = db.milestones.filter((m) => m.id !== id);
  saveDatabase(db);
}

// Projects CRUD
export function addProject(project: Omit<ProjectItem, 'id'>): ProjectItem {
  const db = getDatabase();
  const id = `proj-${Date.now()}`;
  const newProj: ProjectItem = { ...project, id };
  db.projects.unshift(newProj);
  saveDatabase(db);
  return newProj;
}

export function updateProject(project: ProjectItem): void {
  const db = getDatabase();
  const idx = db.projects.findIndex((p) => p.id === project.id);
  if (idx !== -1) {
    db.projects[idx] = project;
    saveDatabase(db);
  }
}

export function deleteProject(id: string): void {
  const db = getDatabase();
  db.projects = db.projects.filter((p) => p.id !== id);
  saveDatabase(db);
}

// Skills CRUD
export function updateSkillCategories(categories: SkillCategory[]): void {
  const db = getDatabase();
  db.skillCategories = categories;
  saveDatabase(db);
}

// Messages
export function addContactMessage(
  msg: Omit<ContactMessage, 'id' | 'timestamp' | 'status'>
): ContactMessage {
  const db = getDatabase();
  const newMessage: ContactMessage = {
    ...msg,
    name: cleanText(msg.name, 100),
    subject: cleanText(msg.subject, 150),
    message: cleanText(msg.message, 3000),
    id: `msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'unread',
  };
  db.messages.unshift(newMessage);
  saveDatabase(db);
  return newMessage;
}

export function updateMessageStatus(id: string, status: ContactMessage['status']): void {
  const db = getDatabase();
  const target = db.messages.find((m) => m.id === id);
  if (target) {
    target.status = status;
    saveDatabase(db);
  }
}

export function deleteMessage(id: string): void {
  const db = getDatabase();
  db.messages = db.messages.filter((m) => m.id !== id);
  saveDatabase(db);
}

// Multi-Admin Management
export function addAdminUser(user: Omit<AdminUser, 'id' | 'createdAt'>): AdminUser {
  const db = getDatabase();
  const newAdmin: AdminUser = {
    ...user,
    id: `admin-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  if (!db.admins) db.admins = [];
  db.admins.push(newAdmin);
  saveDatabase(db);
  return newAdmin;
}

export function deleteAdminUser(id: string): void {
  const db = getDatabase();
  if (db.admins) {
    db.admins = db.admins.filter((a) => a.id !== id);
    saveDatabase(db);
  }
}

// Security / Admin
export async function verifyAdminPassword(input: string, username?: string): Promise<boolean> {
  const db = getDatabase();
  const u = (username || '').trim().toLowerCase();
  if (db.adminCredentials.username.toLowerCase() === u && (await verifySecret(input, db.adminCredentials.passwordHash))) {
    if (!isHashed(db.adminCredentials.passwordHash)) await updateAdminPassword(input); // upgrade legacy plaintext
    return true;
  }
  for (const a of db.admins || []) {
    if (a.username.toLowerCase() === u && (await verifySecret(input, a.passwordHash))) return true;
  }
  return false;
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  const db = getDatabase();
  const h = await hashSecret(newPassword);
  db.adminCredentials.passwordHash = h;
  if (db.admins && db.admins[0]) db.admins[0].passwordHash = h;
  saveDatabase(db);
}

export async function verifySecurityAnswer(answer: string): Promise<boolean> {
  const db = getDatabase();
  const stored = db.adminCredentials.securityAnswer;
  const norm = answer.trim().toLowerCase();
  const ok = await verifySecret(norm, stored);
  if (ok && !isHashed(stored)) {
    db.adminCredentials.securityAnswer = await hashSecret(norm);
    saveDatabase(db);
  }
  return ok;
}

export function getSecurityQuestion(): string {
  const db = getDatabase();
  return db.adminCredentials.securityQuestion;
}

// Subscriptions for React
export function subscribeDatabase(callback: () => void): () => void {
  LISTENERS.push(callback);
  return () => {
    const idx = LISTENERS.indexOf(callback);
    if (idx !== -1) LISTENERS.splice(idx, 1);
  };
}

function notifyListeners() {
  LISTENERS.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  });
}
