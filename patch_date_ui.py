import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/CustomInvoicesTab.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the grid 3 columns
content = content.replace('className="grid grid-cols-1 sm:grid-cols-2 gap-4"', 'className="grid grid-cols-1 sm:grid-cols-3 gap-4"')

# Insert the date input next to invoice_number
input_html = '''                <div><label className="text-xs text-gray-500 font-bold">التاريخ</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-primary" value={clientInfo.receipt_date} onChange={e => setClientInfo({...clientInfo, receipt_date: e.target.value})} /></div>'''

# Find the invoice_number input and append the new input after it
pattern = r'(<div><label className="text-xs text-gray-500 font-bold">.*?</label><input.*?value=\{clientInfo\.invoice_number\}.*?/></div>)'
replacement = r'\1\n' + input_html

content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CustomInvoicesTab date UI!")