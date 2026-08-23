"use client";

import React, { useState, useEffect } from "react";
import { mainSupabase as supabase } from "@/lib/supabase";
import { Shield, Trash2, Smartphone, Key, Plus, ArrowRight, Monitor, Hash, Database } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newBusinessType, setNewBusinessType] = useState("");
  const [newAcceptanceNumber, setNewAcceptanceNumber] = useState("");
  
  const [useCustomDb, setUseCustomDb] = useState(false);
  const [newDbUrl, setNewDbUrl] = useState("");
  const [newDbKey, setNewDbKey] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === "islam" && adminPass === "123456") {
      setIsAdminLoggedIn(true);
      fetchAccounts();
    } else {
      alert("??????? ?????? ??? ?????!");
    }
  };

  const fetchAccounts = async () => {
    const { data, error } = await supabase.from('app_accounts').select('*').order('created_at', { ascending: false });
    if (data) setAccounts(data);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: newName,
      email: newEmail,
      password: newPassword,
      business_type: newBusinessType,
      acceptance_number: newAcceptanceNumber
    };
    
    if (useCustomDb && newDbUrl && newDbKey) {
      payload.db_url = newDbUrl;
      payload.db_key = newDbKey;
    }

    const { error } = await supabase.from('app_accounts').insert([payload]);

    if (error) {
      alert("??? ??? ????? ???????: " + error.message);
    } else {
      alert("??? ????? ?????? ?????");
      setShowAddModal(false);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewBusinessType(""); setNewAcceptanceNumber("");
      setUseCustomDb(false); setNewDbUrl(""); setNewDbKey("");
      fetchAccounts();
    }
  };

  const handleUnlinkDevice = async (id: string) => {
    if (confirm("?? ??? ????? ?? ?? ?????? ?????? ???? ???????")) {
      const { error } = await supabase.from('app_accounts').update({
        device_uuid: null,
        device_info: null
      }).eq('id', id);
      if (!error) {
        alert("?? ?? ???????? ?????");
        fetchAccounts();
      }
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (confirm("?? ??? ????? ?? ??? ?????? ????????")) {
      const { error } = await supabase.from('app_accounts').delete().eq('id', id);
      if (!error) fetchAccounts();
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 relative">
        <Link href="/login" className="absolute top-4 right-4 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
          <ArrowRight className="h-5 w-5" />
          <span>?????? ???????</span>
        </Link>
        <form onSubmit={handleAdminLogin} className="max-w-sm w-full space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">???? ???? ???????</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">??? ???????</label>
            <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">???? ??????</label>
            <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700">????</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-wrap justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-red-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">????? ?????? ???????</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-lg">
              ????
            </Link>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              ???? ????
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-right text-xs md:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <thead className="bg-gray-50/80 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-4 py-2 font-semibold">????????</th>
                <th className="px-4 py-2 font-semibold">?????? ??????</th>
                <th className="px-4 py-2 font-semibold">????? ????????</th>
                <th className="px-4 py-2 font-semibold">??????? / ??????</th>
                <th className="px-4 py-2 font-semibold min-w-[200px]">?????? ?????? / UUID</th>
                <th className="px-4 py-2 font-semibold text-left">???????</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-750/50 transition-colors">
                  <td className="px-4 py-2">
                    <div className="font-bold text-gray-900 dark:text-white">{acc.name}</div>
                    <div className="text-[10px] text-gray-400">ID: {acc.id.split("-")[0]}...</div>
                  </td>
                  <td className="px-4 py-2 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-14 text-[10px] uppercase text-gray-400">???????:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{acc.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-14 text-[10px] uppercase text-gray-400">??????:</span>
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200 text-[11px]">{acc.password}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {acc.db_url ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium text-[11px]">
                        <Database className="h-3 w-3" /> ?????
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium text-[11px]">
                        <Database className="h-3 w-3" /> ??????
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 space-y-1">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium text-[11px]">
                        {acc.business_type}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] font-medium text-gray-600 dark:text-gray-300">
                      {acc.acceptance_number}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {acc.device_uuid ? (
                      <div className="flex flex-col gap-0.5 text-[10px] max-w-[250px] md:max-w-xs whitespace-normal break-words">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold mb-0.5">
                          <Monitor className="h-3 w-3"/>
                          <span>????? ?????</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 leading-tight">
                          <span className="font-semibold text-gray-400">UUID: </span>
                          <span className="font-mono">{acc.device_uuid}</span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                          <span className="font-semibold text-gray-400">????/?????: </span>
                          {acc.device_info}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <Hash className="h-3 w-3" /> ??? ????? ???
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      {acc.device_uuid && (
                        <button onClick={() => handleUnlinkDevice(acc.id)} className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800/30 transition-colors" title="?? ?????? ??????">
                          <Key className="h-3 w-3" />
                          ?? ?????
                        </button>
                      )}
                      <button onClick={() => handleDeleteAccount(acc.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-transparent hover:border-red-200 dark:hover:border-red-800/30 transition-colors" title="??? ??????">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <Shield className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3 opacity-50" />
                    ?? ???? ?????? ?????? ?? ????? ????????
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 my-8">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              ????? ???? ????
            </h3>
            <form onSubmit={handleAddAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">?????</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">???????</label>
                <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">???? ??????</label>
                <input required type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">??? ???????</label>
                  <input required type="text" value={newBusinessType} onChange={e => setNewBusinessType(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">??? ??????</label>
                  <input required type="text" value={newAcceptanceNumber} onChange={e => setNewAcceptanceNumber(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" dir="ltr" />
                </div>
              </div>
              
              <div className="pt-3 border-t dark:border-gray-700 mt-2">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input type="checkbox" checked={useCustomDb} onChange={(e) => setUseCustomDb(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1"><Database className="h-4 w-4"/> ??? ?????? ?????? ????? (Supabase)</span>
                </label>
                
                {useCustomDb && (
                  <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">???? ????? ???????? (URL)</label>
                      <input required type="text" value={newDbUrl} onChange={e => setNewDbUrl(e.target.value)} placeholder="https://xxx.supabase.co" className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-mono text-xs" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">??????? ????? (Anon Key)</label>
                      <input required type="text" value={newDbKey} onChange={e => setNewDbKey(e.target.value)} placeholder="eyJhbGci..." className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-mono text-xs" dir="ltr" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6 pt-2">
                <button type="submit" className="flex-1 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm">??? ??????</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">?????</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
