import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Film, Eye, Download, BarChart3, Activity, TrendingUp, Clock, Video, Home, Settings, Save, FileDown, DollarSign, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { AdManagement } from './components/AdManagement';
import { GMContentManager } from './components/GMContentManager';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;

interface User {
  id: string;
  email: string;
  name: string;
  isBlocked: boolean;
  createdAt: string;
}

interface UserActivity {
  id: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  action: 'watch' | 'download';
  timestamp: string;
}

interface UserStats {
  totalWatches: number;
  totalDownloads: number;
  lastActive: string;
}

interface AnalyticsReport {
  overview: {
    totalUsers: number;
    totalMovies: number;
    totalViews: number;
    totalDownloads: number;
    totalActivity: number;
  };
  topMovies: Array<{
    movieId: string;
    movieTitle: string;
    views: number;
    downloads: number;
    totalActivity: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    watches: number;
    downloads: number;
    totalActivity: number;
  }>;
  recentActivities: Array<{
    id: string;
    userName: string;
    userEmail: string;
    movieTitle: string;
    action: string;
    timestamp: string;
  }>;
  generatedAt: string;
}

interface AdminPortalProps {
  onAuthenticated?: (isAuth: boolean) => void;
  onNavigateToMovieAdmin?: () => void;
}

export default function AdminPortal({ onAuthenticated, onNavigateToMovieAdmin }: AdminPortalProps = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports' | 'ads' | 'settings' | 'gm-content'>('dashboard');
  
  // User Management States
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  // Analytics States
  const [analyticsReport, setAnalyticsReport] = useState<AnalyticsReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  
  // Settings States
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  // Removed: new18PlusPin state - users set their own PINs now!
  
  // GM Feed Engagement Settings
  const [gmSettings, setGmSettings] = useState({
    enabled: true,
    likesMin: 10,
    likesMax: 100,
    viewsMin: 50,
    viewsMax: 1000,
    enableFakeComments: true,
    fakeCommentTemplates: [] as string[],
    fakeUsernames: [] as string[],
  });
  const [loadingGmSettings, setLoadingGmSettings] = useState(false);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'users') {
      fetchUsers();
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (isAuthenticated && (activeTab === 'reports' || activeTab === 'dashboard')) {
      fetchAnalyticsReport();
    }
  }, [isAuthenticated, activeTab]);
  
  useEffect(() => {
    if (isAuthenticated && activeTab === 'dashboard') {
      fetchUsers();
    }
  }, [isAuthenticated, activeTab]);
  
  useEffect(() => {
    if (isAuthenticated && activeTab === 'settings') {
      fetchGmSettings();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = () => {
    if (password === '0701680Kyamundu') {
      setIsAuthenticated(true);
      if (onAuthenticated) {
        onAuthenticated(true);
      }
    } else {
      alert('❌ Invalid password!');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserActivity = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/activity`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) {
        setUserActivities(data.activities || []);
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }
  };

  const fetchAnalyticsReport = async () => {
    setLoadingReport(true);
    try {
      const response = await fetch(`${API_URL}/admin/analytics/report`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) {
        setAnalyticsReport(data.report);
      }
    } catch (error) {
      console.error('Error fetching analytics report:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchGmSettings = async () => {
    setLoadingGmSettings(true);
    try {
      const response = await fetch(`${API_URL}/gm-settings`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) {
        setGmSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching GM settings:', error);
    } finally {
      setLoadingGmSettings(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to block this user?')) return;
    
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('✓ User blocked successfully!');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('❌ Error blocking user');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/unblock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('✓ User unblocked successfully!');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('❌ Error unblocking user');
    }
  };

  const handleViewUserActivity = (user: User) => {
    setSelectedUser(user);
    fetchUserActivity(user.id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/30 shadow-2xl shadow-orange-500/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black bg-gradient-to-r from-orange-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              🔐 ADMIN PORTAL
            </h1>
            <p className="text-gray-400 text-sm">THEE ARCHIVE Management System</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-400/60 transition-all"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-orange-500 via-purple-600 to-cyan-500 text-white font-black py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all"
            >
              LOGIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#FFD700]/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl font-black bg-gradient-to-r from-[#FFD700] to-[#FF4500] bg-clip-text text-transparent">
                ADMIN PORTAL
              </h1>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveTab('dashboard'); setSelectedUser(null); }}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Home className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => { setActiveTab('users'); setSelectedUser(null); }}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Reports
              </button>
              <button
                onClick={() => setActiveTab('ads')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'ads'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                Ad Manager
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('gm-content')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'gm-content'
                    ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                GM Content
              </button>
              <button
                onClick={onNavigateToMovieAdmin}
                className="px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <Video className="w-4 h-4 inline mr-2" />
                Content Manager
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* USERS TAB */}
        {activeTab === 'users' && !selectedUser && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2">User Management</h2>
              <p className="text-gray-400">Total Users: {users.length}</p>
            </div>

            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-[#FFD700]/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-white">{user.name}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined: {formatDate(user.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewUserActivity(user)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                      >
                        <Activity className="w-4 h-4 inline mr-1" />
                        View Activity
                      </button>
                      
                      {user.isBlocked ? (
                        <button
                          onClick={() => handleUnblockUser(user.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockUser(user.id)}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all"
                        >
                          Block
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {user.isBlocked && (
                    <div className="mt-3 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <p className="text-sm font-bold text-red-400">🚫 This user is currently BLOCKED</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USER ACTIVITY DETAILS */}
        {activeTab === 'users' && selectedUser && (
          <div>
            <button
              onClick={() => setSelectedUser(null)}
              className="mb-6 flex items-center gap-2 text-[#FFD700] hover:text-[#FFA500] font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Users
            </button>

            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-6">
              <h2 className="text-2xl font-black text-white mb-2">{selectedUser.name}'s Activity</h2>
              <p className="text-gray-400 mb-4">{selectedUser.email}</p>
              
              {userStats && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 rounded-xl p-4 border border-[#FFD700]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-[#FFD700]" />
                      <span className="text-sm font-bold text-gray-400">Total Watches</span>
                    </div>
                    <p className="text-3xl font-black text-[#FFD700]">{userStats.totalWatches}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm font-bold text-gray-400">Total Downloads</span>
                    </div>
                    <p className="text-3xl font-black text-cyan-400">{userStats.totalDownloads}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-bold text-gray-400">Last Active</span>
                    </div>
                    <p className="text-sm font-bold text-purple-400">{formatDate(userStats.lastActive)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-black text-white mb-4">Activity History</h3>
              
              <div className="space-y-3">
                {userActivities.length > 0 ? (
                  userActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        {activity.action === 'watch' ? (
                          <div className="w-10 h-10 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-[#FFD700]" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <Download className="w-5 h-5 text-cyan-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white">{activity.movieTitle}</p>
                          <p className="text-sm text-gray-400">
                            {activity.action === 'watch' ? 'Watched' : 'Downloaded'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{formatDate(activity.timestamp)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-8">No activity recorded yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS REPORTS TAB */}
        {activeTab === 'reports' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Analytics & Reports</h2>
                <p className="text-gray-400">Platform-wide activity overview</p>
              </div>
              <button
                onClick={fetchAnalyticsReport}
                disabled={loadingReport}
                className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all disabled:opacity-50"
              >
                {loadingReport ? 'Loading...' : 'Refresh Report'}
              </button>
            </div>

            {analyticsReport && (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 rounded-xl p-4 border border-[#FFD700]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-[#FFD700]" />
                      <span className="text-xs font-bold text-gray-400">Total Users</span>
                    </div>
                    <p className="text-2xl font-black text-[#FFD700]">{analyticsReport.overview.totalUsers}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Film className="w-5 h-5 text-purple-400" />
                      <span className="text-xs font-bold text-gray-400">Total Movies</span>
                    </div>
                    <p className="text-2xl font-black text-purple-400">{analyticsReport.overview.totalMovies}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-green-400" />
                      <span className="text-xs font-bold text-gray-400">Total Views</span>
                    </div>
                    <p className="text-2xl font-black text-green-400">{analyticsReport.overview.totalViews}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs font-bold text-gray-400">Total Downloads</span>
                    </div>
                    <p className="text-2xl font-black text-cyan-400">{analyticsReport.overview.totalDownloads}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      <span className="text-xs font-bold text-gray-400">Total Activity</span>
                    </div>
                    <p className="text-2xl font-black text-orange-400">{analyticsReport.overview.totalActivity}</p>
                  </div>
                </div>

                {/* Top Movies */}
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-[#FFD700]" />
                    Top Movies by Activity
                  </h3>
                  <div className="space-y-2">
                    {analyticsReport.topMovies.map((movie, index) => (
                      <div
                        key={movie.movieId}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FF4500] flex items-center justify-center font-black text-black text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-white">{movie.movieTitle}</p>
                            <p className="text-sm text-gray-400">
                              {movie.views} views • {movie.downloads} downloads
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-[#FFD700]">{movie.totalActivity}</p>
                          <p className="text-xs text-gray-400">total activity</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Users */}
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Most Active Users
                  </h3>
                  <div className="space-y-2">
                    {analyticsReport.topUsers.map((user, index) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-black text-white text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-white">{user.userName}</p>
                            <p className="text-sm text-gray-400">{user.userEmail}</p>
                            <p className="text-xs text-gray-500">
                              {user.watches} watches • {user.downloads} downloads
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-cyan-400">{user.totalActivity}</p>
                          <p className="text-xs text-gray-400">total activity</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {analyticsReport.recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          {activity.action === 'watch' ? (
                            <div className="w-8 h-8 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
                              <Eye className="w-4 h-4 text-[#FFD700]" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                              <Download className="w-4 h-4 text-cyan-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{activity.userName}</p>
                            <p className="text-xs text-gray-400">
                              {activity.action === 'watch' ? 'Watched' : 'Downloaded'} "{activity.movieTitle}"
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-center text-sm text-gray-400">
                  Report generated at: {formatDate(analyticsReport.generatedAt)}
                </p>
              </div>
            )}

            {!analyticsReport && !loadingReport && (
              <div className="text-center py-12">
                <p className="text-gray-400">Click "Generate Report" to view analytics</p>
              </div>
            )}
          </div>
        )}

        {/* ADS TAB */}
        {activeTab === 'ads' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2">💰 Ad Management</h2>
              <p className="text-gray-400">Manage your platform advertisements</p>
            </div>

            <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 backdrop-blur-xl rounded-2xl p-6 border border-[#FFD700]/20">
              <AdManagement />
            </div>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2">📊 Dashboard Overview</h2>
              <p className="text-gray-400">Your complete platform summary at a glance</p>
            </div>

            {analyticsReport && (
              <div className="space-y-6">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 rounded-2xl p-6 border border-[#FFD700]/30 float-animation">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FFD700]/30 flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#FFD700]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400">Total Users</p>
                        <p className="text-2xl font-black text-[#FFD700]">{analyticsReport.overview.totalUsers}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="text-xs font-bold text-[#FFD700] hover:text-[#FFA500] transition-colors"
                    >
                      Manage Users →
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30 float-animation" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                        <Film className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400">Total Content</p>
                        <p className="text-2xl font-black text-purple-400">{analyticsReport.overview.totalMovies}</p>
                      </div>
                    </div>
                    <button
                      onClick={onNavigateToMovieAdmin}
                      className="text-xs font-bold text-purple-400 hover:text-pink-400 transition-colors"
                    >
                      Manage Content →
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30 float-animation" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-green-500/30 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400">Total Views</p>
                        <p className="text-2xl font-black text-green-400">{analyticsReport.overview.totalViews}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-green-400/70">👁️ Watch Activity</p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-cyan-500/30 float-animation" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/30 flex items-center justify-center">
                        <Download className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400">Total Downloads</p>
                        <p className="text-2xl font-black text-cyan-400">{analyticsReport.overview.totalDownloads}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-cyan-400/70">📥 Download Activity</p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-black text-white mb-4">⚡ Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={onNavigateToMovieAdmin}
                      className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all text-sm"
                    >
                      <Video className="w-4 h-4 inline mr-2" />
                      Upload Content
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-sm"
                    >
                      <Users className="w-4 h-4 inline mr-2" />
                      View Users
                    </button>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all text-sm"
                    >
                      <BarChart3 className="w-4 h-4 inline mr-2" />
                      Full Report
                    </button>
                    <button
                      onClick={() => setActiveTab('ads')}
                      className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all text-sm"
                    >
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Manage Ads
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gray-500/50 transition-all text-sm"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Settings
                    </button>
                  </div>
                </div>

                {/* Top 5 Movies - Compact View */}
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-[#FFD700]" />
                    🏆 Top 5 Movies
                  </h3>
                  <div className="space-y-2">
                    {analyticsReport.topMovies.slice(0, 5).map((movie, index) => (
                      <div key={movie.movieId} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FF4500] flex items-center justify-center font-black text-black text-sm">
                            #{index + 1}
                          </div>
                          <p className="font-bold text-white text-sm">{movie.movieTitle}</p>
                        </div>
                        <p className="text-lg font-black text-[#FFD700]">{movie.totalActivity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity - Last 8 */}
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    📡 Recent Activity
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analyticsReport.recentActivities.slice(0, 8).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2 border border-white/10">
                        <div className="flex items-center gap-2">
                          {activity.action === 'watch' ? (
                            <div className="w-6 h-6 rounded bg-[#FFD700]/20 flex items-center justify-center">
                              <Eye className="w-3 h-3 text-[#FFD700]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
                              <Download className="w-3 h-3 text-cyan-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-xs">{activity.userName}</p>
                            <p className="text-xs text-gray-400">
                              {activity.action === 'watch' ? '👁️' : '📥'} {activity.movieTitle.slice(0, 30)}...
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp).slice(-8)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!analyticsReport && (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading dashboard data...</p>
              </div>
            )}
          </div>
        )}

        {/* ADS TAB */}
        {activeTab === 'ads' && (
          <div>
            <AdManagement />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2">⚙️ Settings</h2>
              <p className="text-gray-400">Manage your admin portal configuration</p>
            </div>

            <div className="space-y-6">
              {/* Password Change */}
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-[#FFD700]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Change Admin Password</h3>
                    <p className="text-sm text-gray-400">Update your admin portal password</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Enter new admin password"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
                  />
                  <button
                    onClick={() => {
                      if (newAdminPassword.length < 8) {
                        alert('❌ Password must be at least 8 characters!');
                        return;
                      }
                      if (confirm(`Change admin password to: ${newAdminPassword}?`)) {
                        // In a real app, this would call an API to update the password
                        localStorage.setItem('admin_password_hint', 'Password changed! Use your new password next login.');
                        alert('✅ Password will be updated! (Note: This is a demo - password is hardcoded in code)');
                        setNewAdminPassword('');
                      }
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save New Password
                  </button>
                  <p className="text-xs text-gray-500">⚠️ Current password: 0701680Kyamundu (hardcoded in admin.tsx)</p>
                </div>
              </div>

              {/* 18+ PIN REMOVED - Each user now sets their own personal PIN from Profile menu! */}
              {/* Users can access: Profile → Set/Change 18+ PIN */}

              {/* Export Data */}
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <FileDown className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Export Data</h3>
                    <p className="text-sm text-gray-400">Download your platform data as CSV</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      // Export users to CSV
                      const csvContent = 'data:text/csv;charset=utf-8,' + 
                        'Name,Email,Joined,Status\n' +
                        users.map(u => `${u.name},${u.email},${u.createdAt},${u.isBlocked ? 'Blocked' : 'Active'}`).join('\n');
                      const link = document.createElement('a');
                      link.href = encodeURI(csvContent);
                      link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                      alert('✅ Users exported successfully!');
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-sm"
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Export Users
                  </button>
                  <button
                    onClick={() => {
                      if (!analyticsReport) {
                        alert('❌ Please generate analytics report first!');
                        return;
                      }
                      // Export analytics to CSV
                      const csvContent = 'data:text/csv;charset=utf-8,' + 
                        'Total Users,Total Movies,Total Views,Total Downloads,Total Activity\n' +
                        `${analyticsReport.overview.totalUsers},${analyticsReport.overview.totalMovies},${analyticsReport.overview.totalViews},${analyticsReport.overview.totalDownloads},${analyticsReport.overview.totalActivity}`;
                      const link = document.createElement('a');
                      link.href = encodeURI(csvContent);
                      link.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                      alert('✅ Analytics exported successfully!');
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all text-sm"
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Export Analytics
                  </button>
                </div>
              </div>

              {/* Ad Management */}
              <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 backdrop-blur-xl rounded-2xl p-6 border border-[#FFD700]/20">
                <h3 className="text-lg font-black text-[#FFD700] mb-2">💰 Ad Management</h3>
                <AdManagement />
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 backdrop-blur-xl rounded-2xl p-6 border border-[#FFD700]/20">
                <h3 className="text-lg font-black text-[#FFD700] mb-2">ℹ️ Admin Portal Info</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <span className="font-bold">Access:</span> Click red dot on logo 6 times</li>
                  <li>• <span className="font-bold">Password:</span> 0701680Kyamundu</li>
                  <li>• <span className="font-bold">18+ PIN:</span> Each user sets their own (Profile menu)</li>
                  <li>• <span className="font-bold">Features:</span> User management, Analytics, Content management</li>
                  <li>• <span className="font-bold">Data:</span> All stored in Supabase KV store</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* GM CONTENT TAB */}
        {activeTab === 'gm-content' && (
          <div>
            <GMContentManager />
          </div>
        )}
      </main>
    </div>
  );
}