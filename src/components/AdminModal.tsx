import { hashSecret, lockState, recordFailure, recordSuccess } from '../services/security';
import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  Trash2,
  Plus,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Users,
  Monitor,
} from 'lucide-react';
import {
  PortfolioDatabase,
  ProjectItem,
  JourneyMilestone,
  SkillCategory,
  AdminUser,
} from '../types/portfolio';
import {
  getDatabase,
  saveDatabase,
  updateMessageStatus,
  deleteMessage,
  verifyAdminPassword,
  updateAdminPassword,
  verifySecurityAnswer,
  getSecurityQuestion,
  resetDatabaseToDefault,
  exportDatabaseJson,
  addAdminUser,
  deleteAdminUser,
} from '../services/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  initialEditItem?: { type: 'milestone' | 'project'; item: any } | null;
}

type TabType =
  | 'Overview'
  | 'Live View'
  | 'Profile'
  | 'Skills'
  | 'Projects'
  | 'Journey'
  | 'Media'
  | 'Messages'
  | 'Admins'
  | 'Settings';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  setIsLoggedIn,
  initialEditItem,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<TabType>(
    initialEditItem?.type === 'milestone'
      ? 'Journey'
      : initialEditItem?.type === 'project'
      ? 'Projects'
      : 'Overview'
  );

  // Auth States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Forgot Password States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [securityAnswerInput, setSecurityAnswerInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Add new admin user states
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Super Admin' | 'Editor'>('Editor');

  // Local working copy of Database
  const [db, setDb] = useState<PortfolioDatabase>(getDatabase());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setDb(getDatabase());
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAll = () => {
    saveDatabase(db);
    showToast('Saved to database ✔');
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const lock = lockState();
    if (lock.locked) {
      setAuthError(`Too many attempts. Try again in ${lock.seconds}s.`);
      return;
    }
    if (await verifyAdminPassword(passwordInput, usernameInput)) {
      recordSuccess();
      setPasswordInput('');
      setIsLoggedIn(true);
      setDb(getDatabase());
    } else {
      recordFailure();
      setAuthError('Invalid credentials.');
    }
  };

  // Forgot password
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockState().locked) { setAuthError('Too many attempts. Please wait.'); return; }
    if (await verifySecurityAnswer(securityAnswerInput)) {
      if (newPasswordInput.length < 10) {
        setAuthError('New password must be at least 10 characters.');
        return;
      }
      updateAdminPassword(newPasswordInput);
      setForgotSuccess('Password reset successfully! Please log in.');
      setTimeout(() => {
        setIsForgotMode(false);
        setPasswordInput(newPasswordInput);
        setForgotSuccess('');
        setAuthError('');
      }, 1500);
    } else {
      recordFailure();
      setAuthError('Security answer did not match.');
    }
  };

  // Photo & CV uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const updated = {
            ...db,
            profile: {
              ...db.profile,
              avatarUrl: event.target.result as string,
            },
          };
          setDb(updated);
          saveDatabase(updated);
          showToast('Profile photo updated ✔');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const updated = {
            ...db,
            profile: {
              ...db.profile,
              resumeUrl: event.target.result as string,
            },
          };
          setDb(updated);
          saveDatabase(updated);
          showToast('CV uploaded — Download CV button is now active ✔');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUsername || newAdminPassword.length < 10) { showToast('Password needs 10+ characters'); return; }
    const hashed = await hashSecret(newAdminPassword);

    addAdminUser({
      name: newAdminName || newAdminUsername,
      username: newAdminUsername,
      passwordHash: hashed,
      role: newAdminRole,
    });

    setNewAdminName('');
    setNewAdminUsername('');
    setNewAdminPassword('');
    setDb(getDatabase());
    showToast('New Admin account created successfully ✔');
  };

  const unreadMessagesCount = db.messages.filter((m) => m.status === 'unread').length;

  const tabs: TabType[] = [
    'Overview',
    'Live View',
    'Profile',
    'Skills',
    'Projects',
    'Journey',
    'Media',
    'Messages',
    'Admins',
    'Settings',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl h-[94vh] overflow-hidden bg-[#0c0d24] text-[#eef0fb] border border-[rgba(160,150,255,0.25)] rounded-3xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(160,150,255,0.18)] bg-[#101233]/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff3d3d] to-[#ffb347] text-white flex items-center justify-center shadow-md">
              {isLoggedIn ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-white flex items-center gap-2">
                <span>Admin</span>
                <span className="bg-gradient-to-r from-[#ff3d3d] to-[#ffb347] bg-clip-text text-transparent">Dashboard</span>
                {isLoggedIn && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold ml-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Admin Active</span>
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-[#ff3d3d] to-[#ffb347] text-white hover:opacity-95 shadow-md transition-transform hover:scale-105 cursor-pointer"
              >
                💾 Save all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full border border-[rgba(160,150,255,0.2)] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close admin modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 text-xs font-bold flex items-center justify-between shadow-md">
            <span>{toastMessage}</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        {/* Content View: Authentication vs Dashboard */}
        {!isLoggedIn ? (
          /* LOGIN & FORGOT PASSWORD VIEW */
          <div className="p-6 sm:p-10 overflow-y-auto max-w-md mx-auto w-full my-auto">
            {!isForgotMode ? (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold font-display text-white">
                    Admin Sign-In
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage real portfolio projects, profile avatar, and journey tree.
                  </p>
                </div>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="admin"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-white focus:outline-none focus:border-[#ff3d3d]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotMode(true);
                          setAuthError('');
                        }}
                        className="text-[11px] text-[#ffb347] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-white focus:outline-none focus:border-[#ff3d3d]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#ff3d3d] to-[#ffb347] rounded-xl hover:opacity-95 transition-opacity cursor-pointer shadow-lg"
                  >
                    Authenticate as Admin
                  </button>
                </form>
              </div>
            ) : (
              /* FORGOT PASSWORD WORKFLOW */
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold font-display text-white">
                    Password Reset
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Answer the security question to set a new password.
                  </p>
                </div>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleForgotReset} className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)]">
                    <div className="text-[11px] font-semibold text-slate-400">
                      Security Question:
                    </div>
                    <div className="text-xs font-bold text-amber-300 mt-0.5">
                      {getSecurityQuestion()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Answer:
                    </label>
                    <input
                      type="text"
                      required
                      value={securityAnswerInput}
                      onChange={(e) => setSecurityAnswerInput(e.target.value)}
                      placeholder="e.g. bhairahawa"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      New Password:
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl hover:opacity-95 cursor-pointer"
                  >
                    Reset Password
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(false);
                      setAuthError('');
                    }}
                    className="text-xs text-slate-400 hover:underline cursor-pointer"
                  >
                    Back to Sign-in
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* LOGGED IN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Tab Bar Navigation */}
            <div className="flex items-center gap-1.5 px-6 py-3 border-b border-[rgba(160,150,255,0.18)] bg-[#101233]/40 overflow-x-auto shrink-0">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === t
                      ? 'bg-gradient-to-r from-[#ff3d3d] to-[#ffb347] text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {t === 'Live View' && <Eye className="w-3.5 h-3.5" />}
                  {t === 'Admins' && <Users className="w-3.5 h-3.5" />}
                  <span>{t}</span>
                  {t === 'Messages' && unreadMessagesCount > 0 && ` (${unreadMessagesCount})`}
                </button>
              ))}
            </div>

            {/* Dashboard Content Container */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
              {/* TAB: OVERVIEW */}
              {activeTab === 'Overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)]">
                      <div className="text-3xl font-black bg-gradient-to-r from-[#ff3d3d] to-[#ffb347] bg-clip-text text-transparent font-display">
                        {db.projects.length}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Real Projects</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)]">
                      <div className="text-3xl font-black text-amber-400 font-display">
                        {db.skillCategories.length}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Skill Groups</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)]">
                      <div className="text-3xl font-black text-emerald-400 font-display">
                        {db.milestones.length}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Journey Nodes</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)]">
                      <div className="text-3xl font-black text-rose-400 font-display">
                        {db.messages.length}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Inquiries ({unreadMessagesCount} unread)</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-xs text-slate-300 leading-relaxed flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white mb-1">Live View Available Inside Admin</p>
                      <p className="text-slate-400">
                        Click &ldquo;Live View&rdquo; in the top tab menu to see and interact with the live website view directly from this dashboard.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('Live View')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff3d3d] to-[#ffb347] text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Open Live View
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: LIVE VIEW OF WEBSITE */}
              {activeTab === 'Live View' && (
                <div className="h-full flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Monitor className="w-4 h-4 text-emerald-400" />
                      <span>Live Rendered Website Preview</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open('/', '_blank')}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Open in Full Tab ↗
                    </button>
                  </div>

                  <div className="flex-1 w-full rounded-2xl overflow-hidden border-2 border-[rgba(160,150,255,0.3)] bg-[#0a0a1f] shadow-2xl min-h-[500px]">
                    <iframe
                      src="/"
                      title="Live Website Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}

              {/* TAB: PROFILE */}
              {activeTab === 'Profile' && (
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={db.profile.name}
                      onChange={(e) =>
                        setDb({ ...db, profile: { ...db.profile, name: e.target.value } })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Role line</label>
                    <input
                      type="text"
                      value={db.profile.title}
                      onChange={(e) =>
                        setDb({ ...db, profile: { ...db.profile, title: e.target.value } })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Headline Tagline</label>
                    <input
                      type="text"
                      value={db.profile.tagline}
                      onChange={(e) =>
                        setDb({ ...db, profile: { ...db.profile, tagline: e.target.value } })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Intro</label>
                    <textarea
                      rows={3}
                      value={db.profile.bioSummary}
                      onChange={(e) =>
                        setDb({ ...db, profile: { ...db.profile, bioSummary: e.target.value } })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">About</label>
                    <textarea
                      rows={4}
                      value={db.profile.aboutMe}
                      onChange={(e) =>
                        setDb({ ...db, profile: { ...db.profile, aboutMe: e.target.value } })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      What I bring (one per line)
                    </label>
                    <textarea
                      rows={5}
                      value={db.profile.highlights.join('\n')}
                      onChange={(e) =>
                        setDb({
                          ...db,
                          profile: {
                            ...db.profile,
                            highlights: e.target.value.split('\n').filter(Boolean),
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#141438] border border-[rgba(160,150,255,0.2)] text-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB: PROJECTS */}
              {activeTab === 'Projects' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-slate-400">
                      Featured projects. Add, modify or delete real project entries.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const newP: ProjectItem = {
                          id: `proj-${Date.now()}`,
                          title: 'New Project',
                          description: '',
                          category: 'Full-Stack',
                          tags: ['PHP', 'MySQL'],
                          imageUrl: '/src/assets/images/elearning_project_banner_1793550331450.jpg',
                          githubUrl: '',
                          liveDemoUrl: '',
                          featured: false,
                        };
                        setDb({ ...db, projects: [...db.projects, newP] });
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                    >
                      ＋ Add Project
                    </button>
                  </div>

                  {db.projects.map((proj, idx) => (
                    <div
                      key={proj.id}
                      className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-400">
                          Project #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedProjects = db.projects.filter((p) => p.id !== proj.id);
                            const updatedDb = { ...db, projects: updatedProjects };
                            setDb(updatedDb);
                            saveDatabase(updatedDb);
                            showToast(`Project "${proj.title || 'Untitled'}" deleted ✔`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600/80 rounded-lg border border-red-500/30 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const newProjects = [...db.projects];
                            newProjects[idx].title = e.target.value;
                            setDb({ ...db, projects: newProjects });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Technologies (comma separated)</label>
                        <input
                          type="text"
                          value={proj.tags.join(', ')}
                          onChange={(e) => {
                            const newProjects = [...db.projects];
                            newProjects[idx].tags = e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            setDb({ ...db, projects: newProjects });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={proj.description}
                          onChange={(e) => {
                            const newProjects = [...db.projects];
                            newProjects[idx].description = e.target.value;
                            setDb({ ...db, projects: newProjects });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">GitHub Link (optional)</label>
                          <input
                            type="text"
                            value={proj.githubUrl || ''}
                            onChange={(e) => {
                              const newProjects = [...db.projects];
                              newProjects[idx].githubUrl = e.target.value;
                              setDb({ ...db, projects: newProjects });
                            }}
                            placeholder="https://github.com/..."
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Live Link (optional)</label>
                          <input
                            type="text"
                            value={proj.liveDemoUrl || ''}
                            onChange={(e) => {
                              const newProjects = [...db.projects];
                              newProjects[idx].liveDemoUrl = e.target.value;
                              setDb({ ...db, projects: newProjects });
                            }}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: JOURNEY */}
              {activeTab === 'Journey' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-slate-400">
                      Central tree milestones. Side: Education (Left) or Training &amp; Experience (Right).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const newM: JourneyMilestone = {
                          id: `milestone-${Date.now()}`,
                          category: 'education',
                          year: '2026',
                          period: '2026',
                          title: 'New Milestone',
                          organization: '',
                          description: '',
                          skills: [],
                        };
                        setDb({ ...db, milestones: [newM, ...db.milestones] });
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                    >
                      ＋ Add Milestone
                    </button>
                  </div>

                  {db.milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-400">
                          {m.category === 'education' ? '🎓 Education (Left)' : '💼 Experience (Right)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedMilestones = db.milestones.filter((item) => item.id !== m.id);
                            const updatedDb = { ...db, milestones: updatedMilestones };
                            setDb(updatedDb);
                            saveDatabase(updatedDb);
                            showToast(`Milestone "${m.title || 'Untitled'}" deleted ✔`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600/80 rounded-lg border border-red-500/30 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Branch Side</label>
                          <select
                            value={m.category}
                            onChange={(e) => {
                              const newM = [...db.milestones];
                              newM[idx].category = e.target.value as any;
                              setDb({ ...db, milestones: newM });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                          >
                            <option value="education">Education (Left Branch)</option>
                            <option value="experience">Experience (Right Branch)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sort Year (Fruit Label)</label>
                          <input
                            type="text"
                            value={m.year}
                            onChange={(e) => {
                              const newM = [...db.milestones];
                              newM[idx].year = e.target.value;
                              setDb({ ...db, milestones: newM });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Period Label</label>
                          <input
                            type="text"
                            value={m.period || ''}
                            onChange={(e) => {
                              const newM = [...db.milestones];
                              newM[idx].period = e.target.value;
                              setDb({ ...db, milestones: newM });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) => {
                              const newM = [...db.milestones];
                              newM[idx].title = e.target.value;
                              setDb({ ...db, milestones: newM });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Organization</label>
                          <input
                            type="text"
                            value={m.organization}
                            onChange={(e) => {
                              const newM = [...db.milestones];
                              newM[idx].organization = e.target.value;
                              setDb({ ...db, milestones: newM });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Details</label>
                        <textarea
                          rows={2}
                          value={m.description}
                          onChange={(e) => {
                            const newM = [...db.milestones];
                            newM[idx].description = e.target.value;
                            setDb({ ...db, milestones: newM });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: SKILLS */}
              {activeTab === 'Skills' && (
                <div className="space-y-4">
                  {db.skillCategories.map((cat, cIdx) => (
                    <div
                      key={cat.id}
                      className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] space-y-2"
                    >
                      <label className="block text-xs font-bold text-amber-300">
                        Category: {cat.title}
                      </label>
                      <label className="block text-[11px] text-slate-400">
                        Skills (comma separated)
                      </label>
                      <textarea
                        rows={2}
                        value={cat.skills.map((s) => s.name).join(', ')}
                        onChange={(e) => {
                          const newCats = [...db.skillCategories];
                          newCats[cIdx].skills = e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((name) => ({ name }));
                          setDb({ ...db, skillCategories: newCats });
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-[#0d0e26] border border-slate-700 text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: MEDIA */}
              {activeTab === 'Media' && (
                <div className="space-y-6 max-w-xl">
                  <div className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] space-y-3">
                    <label className="block text-xs font-bold text-white">
                      Profile Photo (replaces the &ldquo;PB&rdquo; 3D core in the gyroscope orb)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
                    />
                    {db.profile.avatarUrl && (
                      <p className="text-xs text-emerald-400 font-semibold">
                        Photo set. (Displays in 3D gyroscope core)
                      </p>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] space-y-3">
                    <label className="block text-xs font-bold text-white">
                      CV / Résumé PDF (adds a &ldquo;Download CV&rdquo; button in the hero)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleCvUpload}
                      className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                    />
                    {db.profile.resumeUrl && db.profile.resumeUrl !== '#' && (
                      <p className="text-xs text-emerald-400 font-semibold">
                        CV set. (Hero shows &ldquo;Download CV&rdquo; button)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: MESSAGES INBOX */}
              {activeTab === 'Messages' && (
                <div className="space-y-4">
                  {db.messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No inquiries received yet.
                    </div>
                  ) : (
                    db.messages.map((m) => (
                      <div
                        key={m.id}
                        className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] space-y-2"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">
                            {m.subject} — {m.name} {m.status === 'unread' ? '🆕' : ''}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {new Date(m.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed bg-[#0d0e26] p-3 rounded-xl border border-slate-800">
                          {m.message}
                        </p>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-400">
                            {m.email} {m.phone ? `· ${m.phone}` : ''}
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold"
                            >
                              Reply
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                updateMessageStatus(
                                  m.id,
                                  m.status === 'read' ? 'unread' : 'read'
                                );
                                setDb(getDatabase());
                              }}
                              className="px-3 py-1 rounded-lg border border-slate-700 text-slate-300"
                            >
                              Mark {m.status === 'read' ? 'Unread' : 'Read'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteMessage(m.id);
                                setDb(getDatabase());
                                showToast('Inquiry deleted ✔');
                              }}
                              className="px-3 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-600/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: ADMINS MANAGEMENT (ADD OTHER ADMIN) */}
              {activeTab === 'Admins' && (
                <div className="space-y-6 max-w-2xl">
                  {/* Add New Admin Form */}
                  <form
                    onSubmit={handleAddNewAdmin}
                    className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] space-y-3"
                  >
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Add New Admin User</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Admin Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="e.g. Co-Administrator"
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          required
                          value={newAdminUsername}
                          onChange={(e) => setNewAdminUsername(e.target.value)}
                          placeholder="e.g. prabesh_admin"
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Role
                        </label>
                        <select
                          value={newAdminRole}
                          onChange={(e) => setNewAdminRole(e.target.value as any)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Editor">Editor</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 cursor-pointer shadow-md"
                    >
                      Create Admin User
                    </button>
                  </form>

                  {/* List of Registered Admins */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-white">Registered Admin Accounts</h5>
                    {(db.admins || []).map((admin) => (
                      <div
                        key={admin.id}
                        className="p-4 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{admin.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {admin.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Username: <strong className="text-slate-200">{admin.username}</strong>
                          </div>
                        </div>

                        {(admin.username !== 'admin' || (db.admins || []).length > 1) && (
                          <button
                            type="button"
                            onClick={() => {
                              deleteAdminUser(admin.id);
                              const freshDb = getDatabase();
                              setDb(freshDb);
                              showToast(`Admin "${admin.username}" removed ✔`);
                            }}
                            className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/80 rounded-xl border border-red-500/30 transition-colors cursor-pointer"
                            title="Delete Admin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Admin</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: SETTINGS & BACKUP */}
              {activeTab === 'Settings' && (
                <div className="space-y-6 max-w-xl">
                  {/* Change Password */}
                  <div className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] space-y-3">
                    <h5 className="text-sm font-bold text-white">Change Master Password</h5>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        New Password (minimum 4 characters)
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        onChange={(e) => {
                          if (e.target.value.length >= 4) {
                            updateAdminPassword(e.target.value);
                            showToast('Password updated ✔');
                          }
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0e26] border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  {/* Backup & Reset */}
                  <div className="p-5 rounded-2xl bg-[#141438] border border-[rgba(160,150,255,0.2)] space-y-3">
                    <h5 className="text-sm font-bold text-white">Backup &amp; Reset</h5>
                    <textarea
                      rows={4}
                      readOnly
                      value={exportDatabaseJson()}
                      className="w-full px-3 py-2 text-[11px] font-mono rounded-xl bg-[#0d0e26] border border-slate-700 text-slate-300"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const json = exportDatabaseJson();
                          const blob = new Blob([json], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'prabesh_portfolio_db.json';
                          a.click();
                          showToast('JSON Export downloaded ✔');
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
                      >
                        Export JSON
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          resetDatabaseToDefault();
                          setDb(getDatabase());
                          showToast('All content reset to defaults ✔');
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-800/80 text-red-400 hover:bg-red-950/40 cursor-pointer"
                      >
                        Reset Content
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsLoggedIn(false);
                          showToast('Logged out');
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 ml-auto"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
