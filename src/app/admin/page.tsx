"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, Trash2, Smartphone, Key, Plus, ArrowRight } from "lucide-react";
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
    const { error } = await supabase.from('app_accounts').insert([
      {
        name: newName,
        email: newEmail,
        password: newPassword,
        business_type: newBusinessType,
        acceptance_number: newAcceptanceNumber
      }
    ]);

    if (error) {
      alert("??? ??? ????? ???????: " + error.message);
    } else {
      alert("??? ????? ?????? ?????");
      setShowAddModal(false);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewBusinessType(""); setNewAcceptanceNumber("");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">????? ?????? ???????</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              ?????? ???????
            </Link>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              <Plus className="h-5 w-5" />
              ????? ???? ????
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-right text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4">????? ????????</th>
                <th className="px-6 py-4">??? ???????</th>
                <th className="px-6 py-4">??? ??????</th>
                <th className="px-6 py-4">???? ??????</th>
                <th className="px-6 py-4 text-left">???????</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{acc.name}</div>
                    <div className="text-xs">{acc.email}</div>
                  </td>
                  <td className="px-6 py-4">{acc.business_type}</td>
                  <td className="px-6 py-4">{acc.acceptance_number}</td>
                  <td className="px-6 py-4">
                    {acc.device_uuid ? (
                      <div className="flex flex-col gap-1 text-xs text-green-600 dark:text-green-400">
                        <span className="flex items-center gap-1"><Smartphone className="h-3 w-3"/> ????? ?????</span>
                        <span className="truncate max-w-[150px]" title={acc.device_info}>{acc.device_info}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">??? ?????</span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end gap-2">
                    {acc.device_uuid && (
                      <button onClick={() => handleUnlinkDevice(acc.id)} className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg" title="?? ?????? ??????">
                        <Key className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteAccount(acc.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="??? ??????">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">?? ???? ?????? ??????</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">????? ???? ????</h3>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">?????</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">???????</label>
                <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">???? ??????</label>
                <input required type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">??? ???????</label>
                <input required type="text" value={newBusinessType} onChange={e => setNewBusinessType(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">??? ??????</label>
                <input required type="text" value={newAcceptanceNumber} onChange={e => setNewAcceptanceNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg">?????</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg">?????</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
