export type Product = {
  id: string;
  product_number: string;
  name: string;
  qr_code: string;
  purchase_price: number;
  sale_price: number;
  profit: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  total: number;
  profit: number;
  created_at: string;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  profit: number;
};

export type Settings = {
  id: string;
  library_name: string;
  username: string;
  password_hash: string;
  dark_mode: boolean;
  logo: string | null;
};
