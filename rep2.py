import re
def rep(file, old, new):
    with open(file, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace(old, new)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(c)

base = 'C:/Users/User/Desktop/H.Masoud/library-system/src/'

old1 = """    if (confirm("هل تريد تفريغ كل المنتجات الحالية لإنشاء فاتورة جديدة فارغة؟")) {
      setInvoiceItems([]);
      setClientName("");
      setInvoiceNumber("");
      setReceiptDate(new Date().toISOString().split("T")[0]);
    }"""
new1 = """    confirmDialog("فاتورة جديدة", "هل تريد تفريغ كل المنتجات الحالية لإنشاء فاتورة جديدة فارغة؟", () => {
      setInvoiceItems([]);
      setClientName("");
      setInvoiceNumber("");
      setReceiptDate(new Date().toISOString().split("T")[0]);
    });"""
rep(base + 'components/Invoices/CustomInvoicesTab.tsx', old1, new1)

old2 = """    if (confirm("تفريغ الجدول؟")) {
      setInvoiceItems([]);
    }"""
new2 = """    confirmDialog("تفريغ الجدول", "هل أنت متأكد من تفريغ الجدول؟", () => {
      setInvoiceItems([]);
    });"""
rep(base + 'components/Invoices/CustomInvoicesTab.tsx', old2, new2)

print("Done")