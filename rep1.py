import re

def rep(file, old, new):
    with open(file, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace(old, new)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(c)

base = 'C:/Users/User/Desktop/H.Masoud/library-system/src/'

# invoices
inv_old = """  const handleDelete = async (id: string) => {
    if (confirm("هل تريد حذف هذه الفاتورة؟")) {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (!error) { fetchInvoices(); showSystemToast("تم الحذف", "تم حذف الفاتورة بنجاح.", "delete"); }
      else { showSystemToast("خطأ", "حدث خطأ ما", "error"); }
    }
  };"""
inv_new = """  const handleDelete = async (id: string) => {
    confirmDialog("حذف الفاتورة", "هل أنت متأكد من حذف هذه الفاتورة؟", async () => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (!error) { fetchInvoices(); showSystemToast("تم الحذف", "تم حذف الفاتورة بنجاح.", "delete"); }
      else { showSystemToast("خطأ", "حدث خطأ ما", "error"); }
    });
  };"""
rep(base + 'app/invoices/page.tsx', inv_old, inv_new)

print("Done")