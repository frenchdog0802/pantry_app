import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { ArrowLeftIcon, UserIcon, PaletteIcon, SaveIcon } from 'lucide-react';
interface SettingsProps {
  onBack: () => void;
}
export function Settings({
  onBack
}: SettingsProps) {
  const {
    user,
    logout
  } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('light');
  const [units, setUnits] = useState('imperial');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const handleSave = () => {
    // In a real app, this would save to backend
    setShowSaveMessage(true);
    setTimeout(() => {
      setShowSaveMessage(false);
    }, 3000);
  };
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
        <div className="container mx-auto flex items-center">
          <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
            <ArrowLeftIcon size={24} />
          </button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 container mx-auto p-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button className={`px-6 py-4 text-sm font-medium flex items-center ${activeTab === 'profile' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600 hover:text-gray-800'}`} onClick={() => setActiveTab('profile')}>
              <UserIcon size={18} className="mr-2" />
              Profile
            </button>
            <button className={`px-6 py-4 text-sm font-medium flex items-center ${activeTab === 'preferences' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600 hover:text-gray-800'}`} onClick={() => setActiveTab('preferences')}>
              <div size={18} className="mr-2" />
              Preferences
            </button>
            <button className={`px-6 py-4 text-sm font-medium flex items-center ${activeTab === 'appearance' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600 hover:text-gray-800'}`} onClick={() => setActiveTab('appearance')}>
              <PaletteIcon size={18} className="mr-2" />
              Appearance
            </button>
          </div>
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Profile Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div className="pt-4">
                <button onClick={handleSave} className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
                  <SaveIcon size={18} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </div>}
            {activeTab === 'preferences' && <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Measurement Units
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input id="imperial" name="units" type="radio" checked={units === 'imperial'} onChange={() => setUnits('imperial')} className="h-4 w-4 text-orange-600 border-gray-300" />
                  <label htmlFor="imperial" className="ml-3 block text-sm font-medium text-gray-700">
                    Imperial (oz, lb, cups)
                  </label>
                </div>
                <div className="flex items-center">
                  <input id="metric" name="units" type="radio" checked={units === 'metric'} onChange={() => setUnits('metric')} className="h-4 w-4 text-orange-600 border-gray-300" />
                  <label htmlFor="metric" className="ml-3 block text-sm font-medium text-gray-700">
                    Metric (g, kg, ml)
                  </label>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={handleSave} className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
                  <SaveIcon size={18} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </div>}
            {activeTab === 'appearance' && <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Theme Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input id="light" name="theme" type="radio" checked={theme === 'light'} onChange={() => setTheme('light')} className="h-4 w-4 text-orange-600 border-gray-300" />
                  <label htmlFor="light" className="ml-3 block text-sm font-medium text-gray-700">
                    Light Mode
                  </label>
                </div>
                <div className="flex items-center">
                  <input id="dark" name="theme" type="radio" checked={theme === 'dark'} onChange={() => setTheme('dark')} className="h-4 w-4 text-orange-600 border-gray-300" />
                  <label htmlFor="dark" className="ml-3 block text-sm font-medium text-gray-700">
                    Dark Mode
                  </label>
                </div>
                <div className="flex items-center">
                  <input id="system" name="theme" type="radio" checked={theme === 'system'} onChange={() => setTheme('system')} className="h-4 w-4 text-orange-600 border-gray-300" />
                  <label htmlFor="system" className="ml-3 block text-sm font-medium text-gray-700">
                    System Default
                  </label>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={handleSave} className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
                  <SaveIcon size={18} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </div>}
          </div>
        </div>
        {/* Sign Out Button */}
        <div className="mt-8 text-center">
          <button onClick={logout} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Sign Out
          </button>
        </div>
        {/* Save Message */}
        {showSaveMessage && <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-6 py-3 rounded-lg shadow-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Changes saved successfully!
        </div>}
      </main>
    </div></div>;
}