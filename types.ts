
export interface OrderData {
  status: string;
  fy: string;
  stuffingDate: string;
  stuffingMonth: string;
  etdSob: string;
  eta: string;
  orderNumber: string;
  commercialInvoiceNo: string;
  productCode: string;
  category: string;
  segment: string;
  product: string;
  imageLink: string;
  client: string;
  country: string;
  qty: number;
  unitPrice: number;
  exportValue: number;
  month: string;
  orderForwardingDate: string;
  fobPrice: number;
  moq: number;
  logoImage: string;
}

export interface User {
  name: string;
  apiKey: string;
  isAdmin: boolean;
}

export interface DashboardStats {
  orderForwardingValue: number;
  shipmentOrderValue: number;
  inProcessValue: number;
  totalOrders: number;
  inProcessCount: number;
  shippedOrdersCount: number;
  totalUnits: number;
  uniqueProducts: number;
}
