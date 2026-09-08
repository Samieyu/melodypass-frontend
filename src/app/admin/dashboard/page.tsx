'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Disc, KeyRound, Users, LogOut, Shield, Music, Sparkles } from 'lucide-react';
import { AdminCatalogTab } from '@/components/AdminCatalogTab';
import { AdminAccessCodesTab } from '@/components/AdminAccessCodesTab';
import { AdminUsersTab } from '@/components/AdminUsersTab';

type TabType = 'catalog' | 'codes' | 'users';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('melodypass_admin_token');
    const userStr = localStorage.getItem('melodypass_admin_user');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('melodypass_admin_token');
    localStorage.removeItem('melodypass_admin_user');
    router.push('/admin/login');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Navbar */}
      <header className="glass-panel rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">QR Album Access — Admin</h1>
            <p className="text-xs text-gray-400">
              Signed in as <span className="text-brand-300 font-semibold">{adminUser?.email || 'Admin'}</span> ({adminUser?.role || 'admin'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            Public Site
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors inline-flex items-center gap-1.5 font-semibold ml-auto sm:ml-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex gap-2 p-1.5 rounded-2xl glass-panel border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'catalog'
              ? 'bg-gradient-to-r from-brand-600 to-accent-violet text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Disc className="w-4 h-4" />
          <span>Catalog & Songs</span>
        </button>

        <button
          onClick={() => setActiveTab('codes')}
          className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'codes'
              ? 'bg-gradient-to-r from-brand-600 to-accent-violet text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Access Codes & QR</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-brand-600 to-accent-violet text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Bindings</span>
        </button>
      </div>

      {/* Tab Content */}
      <main className="pt-2">
        {activeTab === 'catalog' && <AdminCatalogTab />}
        {activeTab === 'codes' && <AdminAccessCodesTab />}
        {activeTab === 'users' && <AdminUsersTab />}
      </main>
    </div>
  );
}
