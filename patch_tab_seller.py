import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/CustomInvoicesTab.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we useAuth to get the seller name
if 'const { currentUser } = useAuth();' not in content:
    content = content.replace('const [mounted, setMounted] = useState(false);', 'const [mounted, setMounted] = useState(false);\n  const { currentUser } = useAuth();')

# Modify buildPayload to include seller_name
if 'seller_name:' not in content:
    content = content.replace('amount_in_words_arabic: amountInWords,', 'amount_in_words_arabic: amountInWords,\n      seller_name: currentUser?.full_name || currentUser?.store_name || "البائع",')

# Update PDF filename
content = content.replace('filename:     `Invoice_${payload.client_name}_${payload.invoice_number || Date.now()}.pdf`,', 'filename:     `Invoice_${payload.client_name}_${payload.invoice_number || Date.now()}_${payload.seller_name || "seller"}.pdf`,')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CustomInvoicesTab with seller_name")