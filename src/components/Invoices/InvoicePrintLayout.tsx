import React, { forwardRef } from 'react';

type InvoicePrintLayoutProps = {
  payload: any;
};

const InvoicePrintLayout = forwardRef<HTMLDivElement, InvoicePrintLayoutProps>(({ payload }, ref) => {
  if (!payload) return null;

  const {
    store_name, store_activity, store_address, store_ccp_1, store_ccp_2, store_rc, store_mf, store_art, store_nif,
    client_name, client_art, client_mf, client_rc, receipt_date, invoice_number,
    items,
    total_amount_receipt, total_amount_invoice, tva_amount, stamp_duty, grand_total_invoice,
    amount_in_words_arabic
  } = payload;

  // ---------------------------------------------------------------------------
  // RECEIPT RENDERERS (Image 2 style)
  // ---------------------------------------------------------------------------
  const renderReceiptHeader = () => (
    <div className="mb-6 text-center text-sm font-bold leading-tight font-sans">
      <h2 className="text-xl mb-1">{store_name}</h2>
      <p>{store_activity}</p>
      {store_address && <p>{store_address}</p>}
      {(store_ccp_1 || store_ccp_2) && (
        <p>Compte CCP : {store_ccp_1} {store_ccp_2 ? `clé ${store_ccp_2}` : ''}</p>
      )}
      <p>
        {store_rc && `RC : ${store_rc} - `}
        {store_mf && `MF: ${store_mf} - `}
        {store_art && `ART: ${store_art} - `}
        {store_nif && `NIF: ${store_nif}`}
      </p>
    </div>
  );

  const renderReceiptClientAndTitle = () => (
    <div className="mb-4">
      <div className="text-right mb-4">
        <div style={{ border: '1px solid #000000', padding: '8px', display: 'inline-block', minWidth: '350px', textAlign: 'right', fontWeight: 'bold' }}>
          الزبون: {client_name}
          {store_rc && <div>س.ت: {store_rc}</div>}
          {store_mf && <div>الرقم الجبائي: {store_mf}</div>}
          {store_art && <div>رقم المادة: {store_art}</div>}
        </div>
      </div>
      <div className="text-center font-bold text-xl">
        وصل استلام : {receipt_date}
      </div>
    </div>
  );

  const renderReceiptTable = () => (
    <table className="w-full text-center border-collapse mb-8" style={{ border: '1px solid #000000', fontWeight: 'bold' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #000000', padding: '8px' }}>
            الرقم<br/>N°
          </th>
          <th style={{ border: '1px solid #000000', padding: '8px' }}>
            التعيين<br/>Designation
          </th>
          <th style={{ border: '1px solid #000000', padding: '8px' }}>
            الكمية<br/>Unit
          </th>
          <th style={{ border: '1px solid #000000', padding: '8px' }}>
            السعر الفردي<br/>Prix Unit
          </th>
          <th style={{ border: '1px solid #000000', padding: '8px' }}>
            المبلغ<br/>Montant
          </th>
        </tr>
      </thead>
      <tbody>
        {items?.map((item: any) => (
          <tr key={item.item_index}>
            <td style={{ border: '1px solid #000000', padding: '8px' }}>{String(item.item_index).padStart(2, '0')}</td>
            <td style={{ border: '1px solid #000000', padding: '8px' }}>{item.item_designation}</td>
            <td style={{ border: '1px solid #000000', padding: '8px' }}>{String(item.item_quantity).padStart(2, '0')}</td>
            <td style={{ border: '1px solid #000000', padding: '8px' }}>{Number(item.item_unit_price).toFixed(2).replace('.', ',')}</td>
            <td style={{ border: '1px solid #000000', padding: '8px' }}>{Number(item.item_total_price).toFixed(2).replace('.', ',')}</td>
          </tr>
        ))}
        {/* Totals row for receipt */}
        <tr>
          <td colSpan={3} style={{ border: '1px solid #ffffff' }}></td>
          <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>المجموع</td>
          <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>{Number(total_amount_receipt).toFixed(2).replace('.', ',')}</td>
        </tr>
      </tbody>
    </table>
  );

  const renderReceiptFooter = () => (
    <div>
      <div className="text-center font-bold text-lg mb-12">
        {amount_in_words_arabic}
      </div>
      <div className="text-left font-bold text-xl ml-20">
        الممون
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // INVOICE RENDERERS (Image 1 style)
  // ---------------------------------------------------------------------------
  const renderInvoiceHeader = () => (
    <div className="mb-4">
      {/* Top Box */}
      <div style={{ border: '1px solid #000000', padding: '10px', textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
        <h2 className="text-2xl mb-2">{store_name}</h2>
        <p className="text-lg leading-snug">{store_activity}</p>
        <p className="text-lg leading-snug">{store_address}</p>
      </div>
      {/* Right details */}
      <div className="text-left font-bold text-sm" style={{ direction: 'rtl' }}>
        {store_rc && <div>س.ت.رقم : {store_rc}</div>}
        {store_art && <div>رقم المادة : {store_art}</div>}
        {store_mf && <div>الرقم الجبائي : {store_mf}</div>}
        {(store_ccp_1 || store_ccp_2) && <div>CCP : {store_ccp_1} {store_ccp_2 ? ` Clé: ${store_ccp_2}` : ''}</div>}
        {store_nif && <div>NIF : {store_nif}</div>}
      </div>
    </div>
  );

  const renderInvoiceClientAndTitle = () => (
    <div className="mb-6 relative">
      <div style={{ border: '1px solid #000000', padding: '10px', display: 'inline-block', minWidth: '350px', textAlign: 'right', fontWeight: 'bold' }}>
        <div className="text-xl mb-1">في ذمة {client_name}</div>
        <div>
          {store_art && `رقم المادة: ${store_art} `}
          {store_mf && `الرقم الجبائي: `}
        </div>
        {store_mf && <div>{store_mf}</div>}
        {store_rc && <div>س.ت.رقم : {store_rc}</div>}
      </div>
      <div className="text-center font-bold text-2xl mt-4">
        فاتورة رقم {invoice_number}
      </div>
    </div>
  );

  const renderInvoiceTable = () => (
    <table className="w-full text-center border-collapse mb-4" style={{ border: '1px solid #000000', fontWeight: 'bold' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #000000', padding: '8px' }}>الرقم</th>
          <th style={{ border: '1px solid #000000', padding: '8px' }}>التعيين</th>
          <th style={{ border: '1px solid #000000', padding: '8px' }}>الكمية</th>
          <th style={{ border: '1px solid #000000', padding: '8px' }}>سعر الوحدة</th>
          <th style={{ border: '1px solid #000000', padding: '8px' }}>السعر الكلي</th>
        </tr>
      </thead>
      <tbody>
        {items?.map((item: any) => (
          <tr key={item.item_index}>
            <td style={{ border: '1px solid #000000', padding: '8px' }}>{String(item.item_index).padStart(2, '0')}</td>
            <td style={{ border: '1px solid #000000', padding: '8px' }}>{item.item_designation}</td>
            <td style={{ border: '1px solid #000000', padding: '8px' }}>{String(item.item_quantity).padStart(2, '0')}</td>
            <td style={{ border: '1px solid #000000', padding: '8px' }}>{Number(item.item_unit_price).toFixed(2).replace('.', ',')}</td>
            <td style={{ border: '1px solid #000000', padding: '8px' }}>{Number(item.item_total_price).toFixed(2).replace('.', ',')}</td>
          </tr>
        ))}
        {/* Totals rows for invoice */}
        <tr>
          <td colSpan={3} style={{ border: '1px solid #ffffff', borderRight: '1px solid #000000' }}></td>
          <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>المجموع</td>
          <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>{Number(total_amount_invoice).toFixed(2).replace('.', ',')}</td>
        </tr>
        <tr>
          <td colSpan={3} style={{ border: '1px solid #ffffff', borderRight: '1px solid #000000' }}></td>
          <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>الرسم ع القيمة<br/>المضافة 19%</td>
          <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>{Number(tva_amount).toFixed(2).replace('.', ',')}</td>
        </tr>
        <tr>
          <td colSpan={3} style={{ border: '1px solid #ffffff', borderRight: '1px solid #000000' }}></td>
          <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>الرسم على الطابع</td>
          <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>{Number(stamp_duty).toFixed(2).replace('.', ',')}</td>
        </tr>
        <tr>
          <td colSpan={3} style={{ border: '1px solid #ffffff', borderRight: '1px solid #000000' }}></td>
          <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>المجموع الكلي</td>
          <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: 'bold' }}>{Number(grand_total_invoice).toFixed(2).replace('.', ',')}</td>
        </tr>
      </tbody>
    </table>
  );

  const renderInvoiceFooter = () => (
    <div>
      <div className="text-center font-bold text-lg mb-12 px-4">
        {amount_in_words_arabic}
      </div>
      <div className="text-left font-bold text-xl ml-20">
        الممون
      </div>
    </div>
  );

  return (
    <div ref={ref} style={{ width: '210mm', minHeight: '297mm', padding: '15mm', margin: '0 auto', fontSize: '12pt', direction: 'rtl', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Page 1: Receipt (Image 2 Style) */}
      <div className="page-break-after" style={{ pageBreakAfter: 'always', minHeight: '260mm' }}>
        {renderReceiptHeader()}
        {renderReceiptClientAndTitle()}
        {renderReceiptTable()}
        {renderReceiptFooter()}
      </div>

      {/* Page 2: Invoice (Image 1 Style) */}
      <div style={{ minHeight: '260mm', paddingTop: '10mm' }}>
        {renderInvoiceHeader()}
        {renderInvoiceClientAndTitle()}
        {renderInvoiceTable()}
        {renderInvoiceFooter()}
      </div>

    </div>
  );
});

InvoicePrintLayout.displayName = 'InvoicePrintLayout';

export default InvoicePrintLayout;
