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

  const renderHeader = (title: string) => (
    <div className="flex justify-between items-start mb-6 pb-4" style={{ borderBottom: '2px solid #000000' }}>
      <div className="w-1/3 text-right text-sm">
        <h2 className="font-bold text-xl mb-1">{store_name}</h2>
        <p className="font-bold">{store_activity}</p>
        <p>{store_address}</p>
        <p>س.ت: {store_rc} | ر.ج: {store_mf}</p>
        <p>المادة: {store_art} | ر.ت.إ: {store_nif}</p>
        <p>CCP: {store_ccp_1} {store_ccp_2 ? `Clé: ${store_ccp_2}` : ''}</p>
      </div>
      <div className="w-1/3 text-center">
        <h1 className="text-3xl font-bold uppercase rounded-xl p-2 inline-block shadow-sm" style={{ border: '2px solid #000000' }}>
          {title}
        </h1>
      </div>
      <div className="w-1/3 text-left text-sm">
        <div className="p-3 rounded-lg inline-block min-w-[200px]" style={{ backgroundColor: '#f3f4f6', border: '1px solid #000000' }}>
          <p className="font-bold mb-1 pb-1" style={{ borderBottom: '1px solid #d1d5db' }}>معلومات الزبون</p>
          <p><span className="font-bold">في ذمة:</span> {client_name}</p>
          {client_rc && <p><span className="font-bold">س.ت:</span> {client_rc}</p>}
          {client_mf && <p><span className="font-bold">ر.ج:</span> {client_mf}</p>}
          {client_art && <p><span className="font-bold">المادة:</span> {client_art}</p>}
        </div>
      </div>
    </div>
  );

  const renderTable = () => (
    <table className="w-full text-right border-collapse mb-6" style={{ border: '1px solid #000000' }}>
      <thead>
        <tr style={{ backgroundColor: '#e5e7eb' }}>
          <th className="px-2 py-1 text-center w-12" style={{ border: '1px solid #000000' }}>N°</th>
          <th className="px-2 py-1 text-center" style={{ border: '1px solid #000000' }}>التعيين (Designation)</th>
          <th className="px-2 py-1 text-center w-24" style={{ border: '1px solid #000000' }}>الكمية</th>
          <th className="px-2 py-1 text-center w-32" style={{ border: '1px solid #000000' }}>السعر الفردي</th>
          <th className="px-2 py-1 text-center w-32" style={{ border: '1px solid #000000' }}>المبلغ (د.ج)</th>
        </tr>
      </thead>
      <tbody>
        {items?.map((item: any) => (
          <tr key={item.item_index}>
            <td className="px-2 py-1 text-center" style={{ border: '1px solid #000000' }}>{item.item_index}</td>
            <td className="px-2 py-1" style={{ border: '1px solid #000000' }}>{item.item_designation}</td>
            <td className="px-2 py-1 text-center" style={{ border: '1px solid #000000' }}>{item.item_quantity}</td>
            <td className="px-2 py-1 text-center" style={{ border: '1px solid #000000' }}>{Number(item.item_unit_price).toFixed(2)}</td>
            <td className="px-2 py-1 text-center font-bold" style={{ border: '1px solid #000000' }}>{Number(item.item_total_price).toFixed(2)}</td>
          </tr>
        ))}
        {/* Fill empty rows if needed to make it look standard */}
        {Array.from({ length: Math.max(0, 10 - (items?.length || 0)) }).map((_, i) => (
          <tr key={`empty-${i}`}>
            <td className="px-2 py-4" style={{ border: '1px solid #000000' }}></td>
            <td className="px-2 py-4" style={{ border: '1px solid #000000' }}></td>
            <td className="px-2 py-4" style={{ border: '1px solid #000000' }}></td>
            <td className="px-2 py-4" style={{ border: '1px solid #000000' }}></td>
            <td className="px-2 py-4" style={{ border: '1px solid #000000' }}></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderFooter = (isInvoice: boolean) => (
    <div className="flex justify-between items-start">
      <div className="w-1/2">
        <p className="mb-2 font-bold underline">المبلغ بالحروف:</p>
        <p className="italic p-2 rounded min-h-[60px]" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>{amount_in_words_arabic}</p>
        <div className="mt-8 text-center font-bold">
          <p>إمضاء و ختم المورد</p>
        </div>
      </div>
      <div className="w-1/3">
        <table className="w-full border-collapse text-right" style={{ border: '1px solid #000000' }}>
          <tbody>
            <tr>
              <th className="px-2 py-1" style={{ border: '1px solid #000000', backgroundColor: '#e5e7eb' }}>المجموع (HT)</th>
              <td className="px-2 py-1 font-bold" style={{ border: '1px solid #000000' }}>{Number(isInvoice ? total_amount_invoice : total_amount_receipt).toFixed(2)}</td>
            </tr>
            {isInvoice && (
              <>
                <tr>
                  <th className="px-2 py-1" style={{ border: '1px solid #000000', backgroundColor: '#e5e7eb' }}>TVA (19%)</th>
                  <td className="px-2 py-1" style={{ border: '1px solid #000000' }}>{Number(tva_amount).toFixed(2)}</td>
                </tr>
                <tr>
                  <th className="px-2 py-1" style={{ border: '1px solid #000000', backgroundColor: '#e5e7eb' }}>حق الطابع (Timbre)</th>
                  <td className="px-2 py-1" style={{ border: '1px solid #000000' }}>{Number(stamp_duty).toFixed(2)}</td>
                </tr>
                <tr>
                  <th className="px-2 py-2 font-bold text-lg" style={{ border: '1px solid #000000', backgroundColor: '#d1d5db' }}>المجموع الكلي (TTC)</th>
                  <td className="px-2 py-2 font-bold text-lg" style={{ border: '1px solid #000000' }}>{Number(grand_total_invoice).toFixed(2)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div ref={ref} style={{ width: '210mm', minHeight: '297mm', padding: '15mm', margin: '0 auto', fontSize: '12pt', direction: 'rtl', backgroundColor: '#ffffff', color: '#000000' }}>
      {/* Page 1: Receipt */}
      <div className="page-break-after" style={{ pageBreakAfter: 'always', minHeight: '260mm' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold">التاريخ: {receipt_date}</span>
          <span className="font-bold">الرقم: {invoice_number}</span>
        </div>
        {renderHeader('وصل استلام')}
        {renderTable()}
        {renderFooter(false)}
      </div>

      {/* Page 2: Invoice */}
      <div style={{ minHeight: '260mm', paddingTop: '10mm' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold">التاريخ: {receipt_date}</span>
          <span className="font-bold">رقم الفاتورة: {invoice_number}</span>
        </div>
        {renderHeader('فــــاتـــورة')}
        {renderTable()}
        {renderFooter(true)}
      </div>
    </div>
  );
});

InvoicePrintLayout.displayName = 'InvoicePrintLayout';

export default InvoicePrintLayout;
