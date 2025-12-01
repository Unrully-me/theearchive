import React from 'react';
import { 
  Crown, 
  BookOpen, 
  List, 
  Clock, 
  MessageSquare, 
  Users, 
  FileText, 
  Heart, 
  MessageCircle,
  Settings,
  Send,
  ChevronRight,
  LogOut,
  Download,
  Eye,
  Globe,
  AlertCircle,
  Camera
} from 'lucide-react';
import { getAvatarById } from './AvatarPicker';

interface MenuItem {
  icon: any;
  label: string;
  subtitle?: string;
  badge?: number | string;
  color: string;
  action: () => void;
  special?: boolean;
}

interface ProfileMenuListProps {
  userName: string;
  userEmail: string;
  userId: string;
  onLogout: () => void;
  watchHistoryCount?: number;
  downloadCount?: number;
  onViewWatchHistory?: () => void;
  onViewDownloads?: () => void;
  onBrowseAllCategories?: () => void;
  onAccess18Plus?: () => void;
  userAvatar?: string;
  onChangeAvatar?: () => void;
}

export function ProfileMenuList({ 
  userName, 
  userEmail, 
  userId, 
  onLogout,
  watchHistoryCount = 0,
  downloadCount = 0,
  onViewWatchHistory,
  onViewDownloads,
  onBrowseAllCategories,
  onAccess18Plus,
  userAvatar,
  onChangeAvatar
}: ProfileMenuListProps) {
  const menuItems: MenuItem[] = [
    {
      icon: Crown,
      label: 'Get Premium',
      subtitle: 'No ads • 720P Quality • Multi-downloads',
      color: '#FFD700',
      action: () => alert('Premium feature coming soon!'),
      special: true
    },
    {
      icon: Globe,
      label: 'Browse All Categories',
      subtitle: 'Explore our complete entertainment library',
      color: '#8B5CF6',
      action: () => onBrowseAllCategories ? onBrowseAllCategories() : alert('Browse Categories')
    },
    {
      icon: AlertCircle,
      label: '18+ Content',
      subtitle: 'PIN protected adult content',
      color: '#EF4444',
      action: () => onAccess18Plus ? onAccess18Plus() : alert('18+ Content'),
      special: true
    },
    {
      icon: Eye,
      label: 'Watch History',
      badge: watchHistoryCount,
      color: '#FF4500',
      action: () => onViewWatchHistory ? onViewWatchHistory() : alert('Watch History coming soon!')
    },
    {
      icon: Download,
      label: 'My Downloads',
      badge: downloadCount,
      color: '#00D9A5',
      action: () => onViewDownloads ? onViewDownloads() : alert('Downloads coming soon!')
    },
    {
      icon: BookOpen,
      label: 'Hot Novels',
      subtitle: 'Offline, Free and Daily updated',
      color: '#9932CC',
      action: () => alert('Novels coming soon!')
    },
    {
      icon: List,
      label: 'My List',
      badge: 0,
      color: '#8B5CF6',
      action: () => alert('My List feature coming soon!')
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      badge: 0,
      color: '#1E90FF',
      action: () => alert('Messages coming soon!')
    },
    {
      icon: Users,
      label: 'Community',
      badge: 0,
      color: '#4169E1',
      action: () => alert('Community coming soon!')
    },
    {
      icon: FileText,
      label: 'Posts',
      badge: 0,
      color: '#FF69B4',
      action: () => alert('Posts coming soon!')
    },
    {
      icon: Heart,
      label: 'My Likes',
      badge: 0,
      color: '#DC143C',
      action: () => alert('My Likes coming soon!')
    },
    {
      icon: MessageCircle,
      label: 'My Comments',
      badge: 0,
      color: '#32CD32',
      action: () => alert('My Comments coming soon!')
    },
    {
      icon: Settings,
      label: 'Settings',
      color: '#808080',
      action: () => alert('Settings coming soon!')
    },
    {
      icon: Send,
      label: 'Feedback',
      color: '#00BFFF',
      action: () => alert('Feedback: Send your suggestions to support@theearchive.com')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white px-4 py-6 pb-24">
      {/* User Info Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar with SVG */}
            <button 
              onClick={onChangeAvatar}
              className="relative w-20 h-20 rounded-full overflow-hidden shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all hover:scale-105 group"
            >
              {userAvatar ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: getAvatarById(userAvatar) }}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                  <span className="text-white font-black text-2xl">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Change Avatar Overlay */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            <div>
              <h2 className="text-xl font-black text-white">{userName}</h2>
              <p className="text-sm text-gray-400">ID: {userId}</p>
              <button
                onClick={onChangeAvatar}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors mt-1 flex items-center gap-1"
              >
                <Camera className="w-3 h-3" />
                Change Avatar
              </button>
            </div>
          </div>
        </div>

        {/* Family Mode Notice */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-green-400 text-sm">🌟</span>
          <p className="text-green-400 text-xs">
            Find Family Mode in Settings for family-friendly content.
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              className={`w-full rounded-xl p-4 transition-all flex items-center justify-between group ${
                item.special
                  ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 hover:border-purple-500/50'
                  : 'bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white">{item.label}</h3>
                  {item.subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.badge !== undefined && (
                  <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded-lg">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </button>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-xl p-4 transition-all flex items-center justify-between group mt-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/20">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-red-500">Log out</h3>
          </div>
          <ChevronRight className="w-5 h-5 text-red-500" />
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-xs">
          Official website: theearchive.com
        </p>
        <button 
          onClick={() => {
            navigator.clipboard.writeText('https://theearchive.com');
            alert('Link copied!');
          }}
          className="text-[#00D9A5] text-sm font-bold mt-2 hover:text-[#00F0B5] transition-colors"
        >
          Copy link
        </button>
      </div>
    </div>
  );
}