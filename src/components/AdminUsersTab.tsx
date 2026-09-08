'use client';

import React, { useState, useEffect } from 'react';
import { Users, RotateCcw, Loader2, Phone, Calendar, KeyRound, ShieldAlert } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export function AdminUsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/users');
      setUsers(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetBinding = async (accessCodeId: string, codeStr: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to reset device binding for code "${codeStr}" (activated by ${userName})?\n\nThis will allow the user to activate this access code on a new device.`,
      )
    ) {
      return;
    }

    setResettingId(accessCodeId);
    try {
      const res = await apiFetch(`/admin/access-codes/${accessCodeId}/reset-binding`, {
        method: 'POST',
      });
      alert(res.message || 'Device binding reset successfully!');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to reset device binding');
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Users & Bound Devices</h2>
        <p className="text-xs text-gray-400">View user activations and perform manual device binding resets</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-400" />
          <span>Loading users & device bindings...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Activated Users Yet</h3>
          <p className="text-xs text-gray-400">When users scan a QR code and enter their details, they will appear here.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Bound Code</th>
                  <th className="py-3.5 px-4">Album</th>
                  <th className="py-3.5 px-4">Activation Date</th>
                  <th className="py-3.5 px-4 text-right">Reset Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {users.map((u) => {
                  const ac = u.accessCode;
                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {u.name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 font-mono">
                        {u.phone}
                      </td>
                      <td className="py-3.5 px-4">
                        {ac ? (
                          <span className="font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                            {ac.code}
                          </span>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-300">
                        {ac?.album?.title || 'Unknown'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ac ? (
                          <button
                            onClick={() => handleResetBinding(ac.id, ac.code, u.name)}
                            disabled={resettingId === ac.id}
                            className="py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            {resettingId === ac.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                            <span>Reset Device</span>
                          </button>
                        ) : (
                          <span className="text-gray-500 text-[11px]">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
