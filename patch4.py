import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/Invoices/InvoicePrintLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'const renderInvoiceHeader = \(\) => \([\s\S]*?const renderInvoiceClientAndTitle = \(\) => \(', re.MULTILINE)
replacement = '''const renderInvoiceHeader = () => (
    <div className="mb-6">
      {/* Top Box */}
      <div style={{ border: '1px solid #000000', padding: '10px', textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
        <h2 className="text-2xl mb-2">{store_name}</h2>
        <p className="text-lg leading-snug">{store_activity}</p>
        <p className="text-lg leading-snug">{store_address}</p>
      </div>
      {/* Right details */}
      <div className="text-left font-bold text-sm" style={{ direction: 'rtl' }}>
        {store_rc && <div>RC : {store_rc}</div>}
        {store_art && <div>ART : {store_art}</div>}
        {store_mf && <div>MF : {store_mf}</div>}
        {(store_ccp_1 || store_ccp_2) && <div>CCP : {store_ccp_1} {store_ccp_2 ? ` Clé: ${store_ccp_2}` : ''}</div>}
        {store_nif && <div>NIF : {store_nif}</div>}
      </div>
    </div>
  );

  const renderInvoiceClientAndTitle = () => ('''

content = pattern.sub(replacement, content, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed corruption in renderInvoiceHeader!")