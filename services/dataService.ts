
import { OrderData, User } from '../types';

const SHEET_ID = '1JbxRqsZTDgmdlJ_3nrumfjPvjGVZdjJe43FPrh9kYw4';
const LIVE_GID = '793147058';
// Updated to the correct GID provided by the user for the "Api Key" sheet
const API_KEY_GID = '817322209'; 

function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentField = '';
  let inQuotes = false;
  let currentRow: string[] = [];

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField);
          rows.push(currentRow);
          currentField = '';
          currentRow = [];
        }
        if (char === '\r' && nextChar === '\n') i++;
      } else {
        currentField += char;
      }
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

export const fetchLiveData = async (): Promise<OrderData[]> => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${LIVE_GID}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch live data');
  const text = await response.text();
  const rows = parseCSV(text);
  
  // Skip header (row 0)
  return rows.slice(1).map(row => ({
    status: row[0] || '',
    fy: row[1] || '',
    stuffingDate: row[2] || '',
    stuffingMonth: row[3] || '',
    etdSob: row[4] || '',
    eta: row[5] || '',
    orderNumber: row[6] || '',
    commercialInvoiceNo: row[7] || '',
    productCode: row[8] || '',
    category: row[9] || '',
    segment: row[10] || '',
    product: row[11] || '',
    imageLink: row[12] || '',
    client: row[13] || '',
    country: row[14] || '',
    qty: parseFloat(row[15]) || 0,
    unitPrice: parseFloat(row[16]) || 0,
    exportValue: parseFloat(row[17]) || 0,
    month: row[18] || '',
    orderForwardingDate: row[19] || '',
    fobPrice: parseFloat(row[20]) || 0,
    moq: parseFloat(row[21]) || 0,
    logoImage: row[22] || ''
  }));
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${API_KEY_GID}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch user data');
    const text = await response.text();
    const rows = parseCSV(text);
    
    // Filter out empty rows and process valid data
    return rows.slice(1)
      .filter(row => row[0] && row[1]) // Ensure Name and Api_Key exist
      .map(row => ({
        name: row[0].trim(),
        apiKey: row[1].trim(),
        isAdmin: (row[0] || '').toLowerCase().trim() === 'admin'
      }));
  } catch (e) {
    console.error('DataService: Falling back to static user list due to fetch error:', e);
    // Fallback based on user prompt data to ensure app stays usable
    return [
      { name: 'admin', apiKey: 'admin-123', isAdmin: true },
      { name: 'DIAZ', apiKey: 'diaz-125', isAdmin: false },
      { name: 'SVF', apiKey: 'svf-#1234', isAdmin: false },
      { name: 'PROMESA', apiKey: 'promesa-%123', isAdmin: false }
    ];
  }
};
