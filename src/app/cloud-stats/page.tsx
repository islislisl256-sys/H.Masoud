"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { Cloud, Image as ImageIcon, HardDrive, CheckCircle2, AlertTriangle, ArrowRight, Trash2, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function CloudStatsPage() {
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const [images, setImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (currentUser?.cloudinary_api_key && currentUser?.cloudinary_api_secret) {
      fetchImages();
    }
  }, [currentUser]);

  const fetchImages = async () => {
    setLoadingImages(true);
    setError(null);
    try {
      const res = await fetch('/api/cloudinary/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloud_name: currentUser.cloudinary_cloud_name,
          api_key: currentUser.cloudinary_api_key,
          api_secret: currentUser.cloudinary_api_secret
        })
      });
      const data = await res.json();
      if (data.resources) {
        setImages(data.resources);
      } else if (data.error) {
        setError(data.error.message || data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDelete = async (public_id: string) => {
    if (!confirm("�l أنت متاكُ من مسج هذه الصورة نهائياٗ?")) return;
    setDeletingId(public_id);
    try {
      const res = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: public_id,
          cloud_name: currentUser.cloudinary_cloud_name,
          api_key: currentUser.cloudinary_api_key,
          api_secret: currentUser.cloudinary_api_secret
        })
      });
      
      const result = await res.json();
      if (result.result === 'ok') {
        setImages(prev => prev.filter(img => img.public_id !== public_id));
        // Decrement storage counter
        const used = currentUser.storage_used || 0;
        const newUsed = Math.max(0, used - 1);
        await supabase.from("app_accounts").update({ storage_used: newUsed }).eq("id", currentUser.id);
        const updatedUser = { ...currentUser, storage_used: newUsed };
        sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      } else {
        alert("�صل مد الصورة: " + JSON.stringify(result));
      }
    } catch (err: any) {
      alert("حدث خطإ: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted || !currentUser) return null;

  const maxImages = 100;
  const currentImages = currentUser.storage_used || 0;
  const percentage = Math.min((currentImages / maxImages) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isLimitReached = percentage >= 100;

  const hasApiKeys = !!(currentUser.cloudinary_api_key && currentUser.cloudinary_api_secret);

  return (
    <ProtectedLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">إمدارة مساحة التخزين</h1>
            <p className="text-muted-foreground mt-1">التحصم في الصور المدفوعة (Cloudinary)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Cloud className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">استهلب: الباقة</h2>
                <p className="text-gray-500 dark:text-gray-400">ةحكم بالصور لتقليل الاستهلب</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-primary">{currentImages}</span>
                <span className="text-xl text-gray-400"> / {maxImages}</span>
                <p className="text-sm font-bold text-gray-500 mt-1">صورة مستخدمً</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className={isLimitReached ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-green-500"}>
                  المستهلق: {percentage.toFixed(1)}%
                </span>
                <span className="text-gray-500">
                  المببق؊: {Math.max(maxImages - currentImages, 0)} صور
                </span>
              </div>
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`hR�gV��&�V�FVB�gV��G��4Ɩ֗E&V6�VB�v&r�&VB�Sr��4�V$Ɩ֗B�v&r��&W"�Sr�v&r�&��'�w�Т����F�c���F�c���F�c���F�cࠒ��4��W�2�����F�b6�74��S�&&r��&W"�SF&��&r��&W"ӓ�#&�&FW"&�&FW"��&W"�#F&��&�&FW"��&W"Ӄ&�V�FVB׆��bFW�B�6V�FW"76Rג�B#ࠒ�F�b6�74��S�&ׂ�WF�r�"��"&r��&W"�F&��&r��&W"ӓ�C&�V�FVB�gV��f�W��FV�2�6V�FW"�W7F�g��6V�FW"FW�B��&W"�cF&��FW�B��&W"�C#ࠒ��W'EG&��v�R6�74��S�'r�b��b"�ࠒ��F�cࠒ�F�cࠒƃ26�74��S�&f��B�&��BFW�B�w&�ӓF&��FW�B�v��FRFW�B��r#�M�R�����R�݋����}���]��}����������3ࠒ�6�74��S�'FW�B�w&��cF&��FW�B�w&��C�B�"#�M����b�}�M�]������]�=�ݘ}�r�]���}�M����]�b�}�m�}�����͊��݊���}�B��W����6V7&WB����]��݊��}�M�]�����}���}�����ࠒ��F�cࠒ�Ɩ��&Vc�"�6WGF��w2"6�74��S�&��Ɩ�R�&��6�&r��&W"�c��fW#�&r��&W"�sFW�B�v��FRf��B�&��B��"��b&�V�FVB��rG&�6�F����6���'2#ࠒ�}�M��}�}���M�M�]�����}���}������Ɩ�ࠒ��F�c������F�b6�74��S�&&r�v��FRF&��&r�w&�Ӄ&�V�FVB׆�6�F�r�6�&�&FW"&�&FW"�w&��#F&��&�&FW"�w&��s�b#��F�b6�74��S�&f�W��W7F�g��&WGvVV��FV�2�6V�FW"�"�b#�ƃ"6�74��S�'FW�B׆�f��B�&��BFW�B�w&�ӓF&��FW�B�v��FR#�]����b�}�M�]����}�M�=�݊}�������#��'WGF����6Ɩ6�׶fWF6���vW7�F�6&�VC׶��F��t��vW7�6�74��S�&f�W��FV�2�6V�FW"v�"��B��"&r�w&����fW#�&r�w&��#F&��&r�w&��sF&����fW#�&r�w&��c&�V�FVB��rFW�B�6�f��B�&��BG&�6�F����6���'2F�6&�VC��6�G��S#��&Vg&W6�7r6�74��S׶r�B��BG���F��t��vW2�v��FR�7��r�rw�������݊��������'WGF�����F�c� ����F��t��vW2����F�b6�74��S�'��"f�W��W7F�g��6V�FW"#����FW#"6�74��S�'rӂ�ӂ��FR�7��FW�B�&��'�"����F�c���W'&�"����F�b6�74��S�'�ӂFW�B�6V�FW"FW�B�&VB�Sf��B�&��B#�W'&�'���F�c�����vW2��V�wF��������F�b6�74��S�'��"FW�B�6V�FW"FW�B�w&��S#�M�r�����͊��]�������]�=�}�݊��2�}�M�=�݊}���������F�c������F�b6�74��S�&w&�Bw&�B�6��2�"�BӦw&�B�6��2�Bv�B#����vW2�����r�����F�b�W�׶��r�V&Ɩ5��G�6�74��S�&w&�W&V�F�fR7V7B�7V&R&�V�FVB׆��fW&f��rֆ�FFV�&r�w&��F&��&r�w&�ӓ&�&FW"&�&FW"�w&��#F&��&�&FW"�w&��s#�Ɩ�r7&3׶��r�6V7W&U�W&���C�""6�74��S�'r�gV����gV���&�V7B�6�fW""���F�b6�74��S�&'6��WFR��6WB�&r�&�6��c�6�G��w&�Wֆ�fW#��6�G��G&�6�F�����6�G�f�W��FV�2�6V�FW"�W7F�g��6V�FW"v�"#��'WGF�� ���6Ɩ6�ײ������F�TFV�WFR���r�V&Ɩ5��B�ТF�6&�VC׶FV�WF��t�B�����r�V&Ɩ5��GТ6�74��S�'�2&r�&VB�c��fW#�&r�&VB�sFW�B�v��FR&�V�FVB�gV��G&�6�F����6���'2F�6&�VC��6�G��S �F�F�S�-�]�=���m�}�}�m�� ���FV�WF��t�B�����r�V&Ɩ5��B����FW#"6�74��S�'r�R��R��FR�7��"����G&6�"6�74��S�'r�R��R"��Т��'WGF�����F�c��F�b6�74��S�&'6��WFR&�GF����VgB�&�v�B��"&r�w&F�V�B�F��Bg&���&�6��F��G&�7&V�BFW�B�v��FRFW�Bׇ2G'V�6FR#����r�V&Ɩ5��B�7ƗB�r�r�����Т��F�c���F�c���Т��F�c��Т��F�c��Т��F�c���&�FV7FVD���WC����Р