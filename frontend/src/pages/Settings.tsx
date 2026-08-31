import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Moon, Monitor, Sun, Check } from 'lucide-react';
import Header from '../components/layout/Header';

export default function Settings() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyReport: true,
  });

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar">

        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1D21] tracking-tight">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences and application settings.</p>
        </div>

        <div className="max-w-3xl space-y-8">
          
          {/* Account */}
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#1A1D21] flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-gray-400" /> Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input type="email" value="alex@example.com" disabled className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <div className="flex gap-4">
                  <input type="password" value="********" disabled className="flex-1 h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                  <button className="h-11 px-6 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#1A1D21] flex items-center gap-2 mb-6">
              <Monitor className="w-5 h-5 text-gray-400" /> Appearance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Monitor },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${theme === t.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'}`}
                >
                  <t.icon className="w-6 h-6 mb-2" />
                  <span className="font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#1A1D21] flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-gray-400" /> Notifications
            </h2>
            <div className="space-y-4">
              {[
                { id: 'email', label: 'Email Notifications', desc: 'Receive updates about your learning path.' },
                { id: 'push', label: 'Push Notifications', desc: 'Get reminded to study and complete milestones.' },
                { id: 'weeklyReport', label: 'Weekly Progress Report', desc: 'A summary of your learning activity each week.' },
              ].map(item => (
                <div key={item.id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-bold text-gray-800">{item.label}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notifications[item.id] ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute shadow-sm transition-transform ${notifications[item.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>
          
          <div className="flex justify-end pb-8">
            <button className="h-12 px-8 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
              Save Preferences
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
