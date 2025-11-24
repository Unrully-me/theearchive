import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, DollarSign, Eye, EyeOff, Settings, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;

export interface AdSettings {
  // Global Settings
  adsEnabled: boolean;
  
  // PropellerAds
  propellerAdsEnabled: boolean;
  propellerAdsPublisherId: string;
  
  // AdSterra
  adsterraEnabled: boolean;
  adsterraPublisherId: string;
  
  // Ad Placements
  showAdBeforeVideo: boolean;
  showAdBetweenContent: boolean;
  showAdOnDownload: boolean;
  showBannerAds: boolean;
  showPopunderAds: boolean;
  
  // Ad Frequency
  videoAdFrequency: number; // Show ad every X videos
  downloadAdFrequency: number; // Show ad every X downloads
  
  // Advanced Settings
  skipAdAfterSeconds: number; // Allow skip after X seconds
  adBlockerDetection: boolean;
  
  // Last Updated
  updatedAt?: string;
}

const defaultSettings: AdSettings = {
  adsEnabled: false,
  propellerAdsEnabled: false,
  propellerAdsPublisherId: '',
  adsterraEnabled: false,
  adsterraPublisherId: '',
  showAdBeforeVideo: false,
  showAdBetweenContent: false,
  showAdOnDownload: false,
  showBannerAds: false,
  showPopunderAds: false,
  videoAdFrequency: 1,
  downloadAdFrequency: 1,
  skipAdAfterSeconds: 5,
  adBlockerDetection: false,
};

export function AdManagement() {
  const [settings, setSettings] = useState<AdSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAdSettings();
  }, []);

  const fetchAdSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/ad-settings`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch ad settings');
      
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching ad settings:', error);
      showMessage('error', 'Failed to load ad settings');
    } finally {
      setLoading(false);
    }
  };

  const saveAdSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/ad-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: { ...settings, updatedAt: new Date().toISOString() } })
      });
      
      if (!response.ok) throw new Error('Failed to save ad settings');
      
      const data = await response.json();
      if (data.success) {
        showMessage('success', '✅ Ad settings saved successfully!');
        fetchAdSettings(); // Reload to confirm
      }
    } catch (error) {
      console.error('Error saving ad settings:', error);
      showMessage('error', '❌ Failed to save ad settings');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateSetting = (key: keyof AdSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-black gradient-gold">Ad Management</h2>
            <p className="text-gray-400 text-sm">Control monetization and ad placements</p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border-2 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/50 text-green-400' 
            : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          <p className="font-bold">{message.text}</p>
        </div>
      )}

      {/* Global Master Switch */}
      <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-[#FFD700]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              settings.adsEnabled 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-gray-600 to-gray-700'
            }`}>
              {settings.adsEnabled ? (
                <Eye className="w-8 h-8 text-white" strokeWidth={2.5} />
              ) : (
                <EyeOff className="w-8 h-8 text-white" strokeWidth={2.5} />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-1">
                {settings.adsEnabled ? '✅ Ads Enabled' : '❌ Ads Disabled'}
              </h3>
              <p className="text-gray-400 text-sm">
                {settings.adsEnabled 
                  ? 'Ads are currently active on the website' 
                  : 'All ads are currently disabled - monetization is OFF'}
              </p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('adsEnabled', !settings.adsEnabled)}
            className={`px-8 py-4 rounded-xl font-black text-lg transition-all ${
              settings.adsEnabled
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-600/50'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50'
            }`}
          >
            {settings.adsEnabled ? 'DISABLE ADS' : 'ENABLE ADS'}
          </button>
        </div>
      </div>

      {/* Ad Networks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* PropellerAds */}
        <div className="glass-card rounded-2xl p-6 border-2 border-blue-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-blue-400" strokeWidth={2.5} />
            <h3 className="text-xl font-black text-white">PropellerAds</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm font-bold text-gray-300">Enable Network</span>
              <button
                onClick={() => updateSetting('propellerAdsEnabled', !settings.propellerAdsEnabled)}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.propellerAdsEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.propellerAdsEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Publisher ID
              </label>
              <input
                type="text"
                value={settings.propellerAdsPublisherId}
                onChange={(e) => updateSetting('propellerAdsPublisherId', e.target.value)}
                placeholder="Enter your PropellerAds Publisher ID"
                className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                disabled={!settings.propellerAdsEnabled}
              />
            </div>
          </div>
        </div>

        {/* AdSterra */}
        <div className="glass-card rounded-2xl p-6 border-2 border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-400" strokeWidth={2.5} />
            <h3 className="text-xl font-black text-white">AdSterra</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm font-bold text-gray-300">Enable Network</span>
              <button
                onClick={() => updateSetting('adsterraEnabled', !settings.adsterraEnabled)}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.adsterraEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.adsterraEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Publisher ID
              </label>
              <input
                type="text"
                value={settings.adsterraPublisherId}
                onChange={(e) => updateSetting('adsterraPublisherId', e.target.value)}
                placeholder="Enter your AdSterra Publisher ID"
                className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                disabled={!settings.adsterraEnabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ad Placements */}
      <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-[#FFD700]/20">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-[#FFD700]" strokeWidth={2.5} />
          <h3 className="text-xl font-black text-white">Ad Placements</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'showAdBeforeVideo', label: 'Show Ad Before Video', desc: 'Display ad before video playback starts' },
            { key: 'showAdBetweenContent', label: 'Show Ads Between Content', desc: 'Display ads in content feed' },
            { key: 'showAdOnDownload', label: 'Show Ad on Download', desc: 'Display ad before download starts' },
            { key: 'showBannerAds', label: 'Show Banner Ads', desc: 'Display banner ads throughout the site' },
            { key: 'showPopunderAds', label: 'Show Popunder Ads', desc: 'Display popunder ads (less intrusive)' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="p-4 bg-white/5 rounded-xl border-2 border-white/10 hover:border-[#FFD700]/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-bold text-white mb-1">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button
                  onClick={() => updateSetting(key as keyof AdSettings, !settings[key as keyof AdSettings])}
                  className={`ml-3 w-12 h-7 rounded-full transition-all flex-shrink-0 ${
                    settings[key as keyof AdSettings] ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings[key as keyof AdSettings] ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Frequency Settings */}
      <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-orange-500/20">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-orange-400" strokeWidth={2.5} />
          <h3 className="text-xl font-black text-white">Ad Frequency</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Video Ad Frequency
            </label>
            <p className="text-xs text-gray-400 mb-3">Show ad every X videos</p>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.videoAdFrequency}
              onChange={(e) => updateSetting('videoAdFrequency', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Current: Show ad every <span className="text-[#FFD700] font-bold">{settings.videoAdFrequency}</span> video(s)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Download Ad Frequency
            </label>
            <p className="text-xs text-gray-400 mb-3">Show ad every X downloads</p>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.downloadAdFrequency}
              onChange={(e) => updateSetting('downloadAdFrequency', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Current: Show ad every <span className="text-[#FFD700] font-bold">{settings.downloadAdFrequency}</span> download(s)
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-red-500/20">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-red-400" strokeWidth={2.5} />
          <h3 className="text-xl font-black text-white">Advanced Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Skip Ad After (seconds)
            </label>
            <p className="text-xs text-gray-400 mb-3">Allow users to skip ad after X seconds</p>
            <input
              type="number"
              min="0"
              max="30"
              value={settings.skipAdAfterSeconds}
              onChange={(e) => updateSetting('skipAdAfterSeconds', parseInt(e.target.value) || 5)}
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white focus:border-red-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {settings.skipAdAfterSeconds === 0 
                ? 'Ads cannot be skipped' 
                : `Users can skip after ${settings.skipAdAfterSeconds} seconds`}
            </p>
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl border-2 border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white mb-1">Ad Blocker Detection</p>
                <p className="text-xs text-gray-400">Detect and warn users with ad blockers</p>
              </div>
              <button
                onClick={() => updateSetting('adBlockerDetection', !settings.adBlockerDetection)}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.adBlockerDetection ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.adBlockerDetection ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between glass-card rounded-2xl p-6 border-2 border-[#FFD700]/30">
        <div>
          <p className="text-sm text-gray-400">
            {settings.updatedAt 
              ? `Last updated: ${new Date(settings.updatedAt).toLocaleString()}`
              : 'Never saved'}
          </p>
        </div>
        <button
          onClick={saveAdSettings}
          disabled={saving}
          className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black text-lg rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              SAVING...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              SAVE AD SETTINGS
            </>
          )}
        </button>
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <p className="font-bold text-blue-400 mb-2">💡 Ad Setup Instructions</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Sign up for PropellerAds or AdSterra to get your Publisher ID</li>
              <li>• Enable the ad networks and enter your Publisher IDs above</li>
              <li>• Configure which ad placements you want to show</li>
              <li>• Adjust frequency to control how often ads appear</li>
              <li>• Use the master switch to enable/disable all ads instantly</li>
              <li>• Changes take effect immediately after saving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
