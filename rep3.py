import re
def rep(file, old, new):
    with open(file, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace(old, new)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(c)
base = 'C:/Users/User/Desktop/H.Masoud/library-system/src/'

old3 = """  const handleDeleteMessage = async (msgId: string) => {
    if (confirm("هل أنت متأكد من مسح هذه الرسالة؟")) {
      const { error } = await supabase.from('workspace_messages').delete().eq('id', msgId);
      if (error) {
        toast.error("حدث خطأ");
      }
    }
  };"""
new3 = """  const handleDeleteMessage = async (msgId: string) => {
    confirmDialog("تأكيد الحذف", "هل أنت متأكد من مسح هذه الرسالة؟", async () => {
      const { error } = await supabase.from('workspace_messages').delete().eq('id', msgId);
      if (error) {
        showSystemToast("خطأ", "حدث خطأ أثناء مسح الرسالة", "error");
      }
    });
  };"""
rep(base + 'app/chat/page.tsx', old3, new3)

old4 = """  const clearInvoices = async () => {
    if (!confirm("هل أنت متأكد من مسح جميع الفواتير المحفوظة سحابياً؟")) return;
    setClearing(true);"""
new4 = """  const clearInvoices = async () => {
    confirmDialog("تنبيه الحذف", "هل أنت متأكد من مسح جميع الفواتير المحفوظة سحابياً؟", async () => {
      setClearing(true);"""
old4b = """      setClearing(false);
    }
  };"""
new4b = """      setClearing(false);
      }
    });
  };"""
rep(base + 'app/cloud-stats/page.tsx', old4, new4)
rep(base + 'app/cloud-stats/page.tsx', old4b, new4b)

old5 = """  const handleDelete = async (public_id: string) => {
    if (!confirm("هل أنت متأكد من مسح هذه الصورة سحابياً؟")) return;
    setDeletingId(public_id);"""
new5 = """  const handleDelete = async (public_id: string) => {
    confirmDialog("تنبيه الحذف", "هل أنت متأكد من مسح هذه الصورة سحابياً؟", async () => {
      setDeletingId(public_id);"""
old5b = """      setDeletingId(null);
    }
  };"""
new5b = """      setDeletingId(null);
      }
    });
  };"""
rep(base + 'app/cloud-stats/page.tsx', old5, new5)
rep(base + 'app/cloud-stats/page.tsx', old5b, new5b)

old6 = """  const handleClearSettings = () => {
    if (!confirm("هل أنت متأكد من مسح جميع إعدادات التخزين السحابي؟")) return;
    localStorage.removeItem("cloudinary_cloud_name");
    localStorage.removeItem("cloudinary_api_key");
    localStorage.removeItem("cloudinary_api_secret");
    
    setCloudName("");
    setApiKey("");
    setApiSecret("");
    
    showSystemToast("تنبيه", "تم مسح جميع الإعدادات السحابية", "warning");
    onClose();
  };"""
new6 = """  const handleClearSettings = () => {
    confirmDialog("مسح الإعدادات", "هل أنت متأكد من مسح جميع إعدادات التخزين السحابي؟", () => {
      localStorage.removeItem("cloudinary_cloud_name");
      localStorage.removeItem("cloudinary_api_key");
      localStorage.removeItem("cloudinary_api_secret");
      
      setCloudName("");
      setApiKey("");
      setApiSecret("");
      
      showSystemToast("تنبيه", "تم مسح جميع الإعدادات السحابية", "warning");
      onClose();
    });
  };"""
rep(base + 'components/Modals/CloudinarySetupModal.tsx', old6, new6)

print("Done rest")