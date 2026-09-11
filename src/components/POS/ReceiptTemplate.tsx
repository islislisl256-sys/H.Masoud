import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  sale_price: number;
  sale_type?: string;
};

interface ReceiptTemplateProps {
  invoiceNumber: string;
  items: InvoiceItem[];
  total: number;
  date: Date;
  size: '58mm' | '80mm';
}

export default function ReceiptTemplate({ invoiceNumber, items, total, date, size }: ReceiptTemplateProps) {
  const { currentUser } = useAuth();
  
  // Format date and time
  const formattedDate = date.toLocaleDateString('en-GB'); // DD/MM/YYYY
  const formattedTime = date.toLocaleTimeString('en-GB', { hour12: false });

  // Width classes
  const widthClass = size === '80mm' ? 'w-[300px]' : 'w-[220px]';

  return (
    <>
      <style type="text/css" media="print">
        {`
          @page {
            margin: 0;
            size: ${size === '80mm' ? '80mm auto' : '58mm auto'};
          }
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: ${size === '80mm' ? '80mm' : '58mm'};
          }
        `}
      </style>

      <div id="printable-receipt" className={`${widthClass} mx-auto bg-white text-black p-2 text-sm font-sans hidden print:block`} dir="rtl">
        {/* Header - Center Aligned */}
        <div className="text-center mb-4 flex flex-col items-center">
          {currentUser?.store_logo && (
            <img 
              src={currentUser.store_logo} 
              alt="Logo" 
              className="w-16 h-16 object-contain mb-2 grayscale"
            />
          )}
          <h1 className="font-extrabold text-xl mb-1">{currentUser?.store_name || currentUser?.library_name || 'مكتبة الحاج مسعود'}</h1>
          <p className="text-xs font-medium leading-relaxed">
            {currentUser?.business_type || 'نقطة بيع'}
          </p>
          {(currentUser?.phone_number || '0000000000') && (
            <p className="text-xs font-bold mt-1">Tél: {currentUser?.phone_number || '0000000000'}</p>
          )}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Metadata Section */}
        <div className="flex justify-between items-center text-xs font-bold mb-2" dir="ltr">
          <div className="text-left">
            <div>{formattedDate}</div>
            <div>{formattedTime}</div>
          </div>
          <span>N°: {invoiceNumber}</span>
        </div>

        <div className="border-t border-black my-2"></div>

        {/* Items Table Header */}
        <div className="flex text-xs font-bold border-b border-black pb-1 mb-1">
          <div className="w-1/6 text-center">Qté</div>
          <div className="w-1/2 px-1 text-right">Désignation</div>
          <div className="w-1/3 text-left">Prix</div>
        </div>

        {/* Items Body */}
        <div className="space-y-1 mb-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex text-xs items-start border-b border-gray-300 border-dashed pb-1">
              <div className="w-1/6 text-center font-bold">{item.quantity}</div>
              <div className="w-1/2 px-1 leading-tight text-right">{item.name}</div>
              <div className="w-1/3 text-left font-bold">{item.sale_price.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Footer & Totals Section */}
        <div className="border-t-2 border-black pt-2 mt-2">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span>Nbr {items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            <span>إجمالي القطع:</span>
          </div>
          
          <div className="bg-black text-white p-2 text-center rounded flex justify-between items-center mt-2" dir="ltr">
            <span className="font-bold text-sm">Net a payer:</span>
            <span className="font-extrabold text-lg">{total.toLocaleString()} DA</span>
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center text-xs mt-4 mb-2 font-bold">
          <p>شكراً لزيارتكم!</p>
          <p>Merci pour votre visite</p>
        </div>
      </div>
    </>
  );
}
