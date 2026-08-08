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
    <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
      <div className="w-1/3 text-right text-sm">
        <h2 className="font-bold text-xl mb-1">{store_name}</h2>
        <p className="font-bold">{store_activity}</p>
        <p>{store_address}</p>
        <p>س.ت: {store_rc} | ر.ج: {store_mf}</p>
        <p>المادة: {store_art} | ر.ت.إ: {store_nif}</p>
        <p>CCP: {store_ccp_1} {store_ccp_2 ? `Clé: ${store_ccp_2}` : ''}</p>
      </div>
      <div className="w-1/3 text-center">
        <h1 className="text-3xl font-bold uppercase border-2 border-black rounded-xl p-2 inline-block shadow-sm">
          {title}
        </h1>
      </div>
      <div className="w-1/3 text-left text-sm">
        <div className="bg-gray-100 p-3 rounded-lg border border-black inline-block min-w-[200px]">
          <p className="font-bold mb-1 border-b border-gray-300 pb-1">معلومات الزبون</p>
          <p><span className="font-bold">في ذمة:</span> {client_name}</p>
          {client_rc && <p><span className="font-bold">س.ت:</span> {client_rc}</p>}
          {client_mf && <p><span className="font-bold">ر.ج:</span> {client_mf}</p>}
          {client_art && <p><span className="font-bold">المادة:</span> {client_art}</p>}
        </div>
      </div>
    </div>
  );

  const renderTable = () => (
    <table className="w-full text-right border-collapse border border-black mb-6">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-black px-2 py-1 text-center w-12">N°</th>
          <th className="border border-black px-2 py-1 text-center">التعيين (Designation)</th>
          <th className="border border-black px-2 py-1 text-center w-24">الكمية</th>
          <th className="border border-black px-2 py-1 text-center w-32">السعر الفردي</th>
          <th className="border border-black px-2 py-1 text-center w-32">المبلغ (د.ج)</th>
        </tr>
      </thead>
      <tbody>
        {items?.map((item: any) => (
          <tr key={item.item_index}>
            <td className="border border-black px-2 py-1 text-center">{item.item_index}</td>
            <td className="border border-black px-2 py-1">{item.item_designation}</td>
            <td className="border border-black px-2 py-1 text-center">{item.item_quantity}</td>
            <td className="border border-black px-2 py-1 text-center">{Number(item.item_unit_price).toFixed(2)}</td>
            <td className="border border-black px-2 py-1 text-center font-bold">{Number(item.item_total_price).toFixed(2)}</td>
          </tr>
        ))}
        {/* Fill empty rows if needed to make it look standard */}
        {Array.from({ length: Math.max(0, 10 - (items?.length || 0)) }).map((_, i) => (
          <tr key={`empty-${i}`}>
            <td className="border border-black px-2 py-4"></td>
            <td className="border border-black px-2 py-4"></td>
            <td className="border border-black px-2 py-4"></td>
            <td className="border border-black px-2 py-4"></td>
            <td className="border border-black px-2 py-4"></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderFooter = (isInvoice: boolean) => (
    <div className="flex justify-between items-start">
      <div className="w-1/2">
        <p className="mb-2 font-bold underline">المبلغ بالحروف:</p>
        <p className="italic bg-gray-50 p-2 rounded border border-gray-200 min-h-[60px]">{amount_in_words_arabic}</p>
        <div className="mt-8 text-center font-bold">
          <p>إمضاء و ختم المورد</p>
        </div>
      </div>
      <div className="w-1/3">
        <table className="w-full border-collapse border border-black text-right">
          <tbody>
            <tr>
              <th className="border border-black px-2 py-1 bg-gray-200">المجموع (HT)</th>
              <td className="border border-black px-2 py-1 font-bold">{Number(isInvoice ? total_amount_invoice : total_amount_receipt).toFixed(2)}</td>
            </tr>
            {isInvoice && (
              <>
                <tr>
                  <th className="border border-black px-2 py-1 bg-gray-200">TVA (19%)</th>
                  <td className="border border-black px-2 py-1">{Number(tva_amount).toFixed(2)}</td>
                </tr>
                <tr>
                  <th className="border border-black px-2 py-1 bg-gray-200">حق الطابع (Timbre)</th>
                  <td className="border border-black px-2 py-1">{Number(stamp_duty).toFixed(2)}</td>
                </tr>
                <tr>
                  <th className="border border-black px-2 py-2 bg-gray-300 font-bold text-lg">المجموع الكلي (TTC)</th>
                  <td className="border border-black px-2 py-2 font-bold text-lg">{Number(grand_total_invoice).toFixed(2)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="bg-white text-black" style={{ width: '210mm', minHeight: '297mm', padding: '15mm', margin: '0 auto', fontSize: '12pt', direction: 'rtl' }}>
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
