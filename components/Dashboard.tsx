
import React, { useMemo, useState, useEffect } from 'react';
import { User, OrderData } from '../types';
import { LogOut, RefreshCw, LayoutDashboard, TrendingUp, AlertCircle, X, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  data: OrderData[];
  loading: boolean;
  lastUpdate: string;
  onLogout: () => void;
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, data, loading, lastUpdate, onLogout, onRefresh }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('Global');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  const uniqueClients = useMemo(() => {
    const clients = Array.from(new Set(data.map(d => d.client))).filter(Boolean);
    return ['Global', ...clients.sort()];
  }, [data]);

  const clientData = useMemo(() => {
    if (!user.isAdmin) {
      return data.filter(d => d.client.toLowerCase() === user.name.toLowerCase());
    }
    if (selectedClient === 'Global') return data;
    return data.filter(d => d.client.toLowerCase() === selectedClient.toLowerCase());
  }, [data, user, selectedClient]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const top10Global = useMemo(() => {
    const productMap: Record<string, { value: number, code: string }> = {};
    data.forEach(item => {
      const key = item.product;
      if (!productMap[key]) {
        productMap[key] = { value: 0, code: item.productCode };
      }
      productMap[key].value += item.exportValue;
    });
    return Object.entries(productMap)
      .map(([name, { value, code }]) => ({ name, value, code }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data]);

  const top10Client = useMemo(() => {
    const productMap: Record<string, { value: number, code: string }> = {};
    clientData.forEach(item => {
      const key = item.product;
      if (!productMap[key]) {
        productMap[key] = { value: 0, code: item.productCode };
      }
      productMap[key].value += item.exportValue;
    });
    return Object.entries(productMap)
      .map(([name, { value, code }]) => ({ name, value, code }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [clientData]);

  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#431407'];

  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const dataItem = [...top10Global, ...top10Client].find(d => d.name === payload.value);
    const code = dataItem?.code || '';
    const name = payload.value;
    
    // Truncate name for mobile
    const displayName = name.length > (isMobile ? 15 : 25) ? name.substring(0, isMobile ? 12 : 22) + '...' : name;

    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={-10} 
          y={-5} 
          dy={0} 
          textAnchor="end" 
          fill="#475569" 
          style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: 700 }}
        >
          {displayName}
        </text>
        <text 
          x={-10} 
          y={10} 
          dy={0} 
          textAnchor="end" 
          fill="#94a3b8" 
          style={{ fontSize: isMobile ? '9px' : '10px', fontWeight: 500 }}
        >
          {code}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, code } = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-2xl rounded-2xl border border-orange-100 min-w-[200px] sm:min-w-[240px] animate-in fade-in zoom-in duration-200">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Bonhoeffer</span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-tight">Code</p>
            <p className="text-xs sm:text-sm font-bold text-gray-800 break-all">{code || 'N/A'}</p>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-tight mt-1 sm:mt-2">Product</p>
            <p className="text-xs sm:text-sm font-bold text-gray-800 leading-tight">{name}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative text-gray-900 overflow-x-hidden">
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLogoutConfirm(false)} />
          <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 w-full max-w-sm relative z-10 border border-gray-100 animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setShowLogoutConfirm(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <AlertCircle size={28} className="text-orange-500 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 sm:mb-8">Are you sure you want to log out of your Bonhoeffer session?</p>
              <div className="flex flex-col w-full gap-3">
                <button onClick={onLogout} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <LogOut size={18} /> Logout Now
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl transition-all">Stay Signed In</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 w-full md:w-auto">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-1.5">
              <span className="text-orange-500">Welcome,</span> {user.name}
            </h1>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${loading ? 'bg-orange-400 animate-pulse' : 'bg-green-500'}`} />
              Last Update: {lastUpdate || '---'}
            </div>
            
            {user.isAdmin ? (
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-orange-700 bg-orange-50 pl-2 sm:pl-3 pr-1.5 sm:pr-2 py-1 rounded-full border border-orange-100 shadow-sm transition-all">
                <span className="hidden xs:inline">Viewing For:</span>
                <div className="relative flex items-center">
                  <select 
                    value={selectedClient} 
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="bg-white border-none text-[9px] sm:text-[11px] font-black text-orange-600 rounded-full pl-2 pr-6 py-0.5 sm:py-1 appearance-none outline-none cursor-pointer uppercase shadow-sm"
                  >
                    {uniqueClients.map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-1.5 text-orange-400 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-orange-700 bg-orange-50 px-2 sm:px-3 py-1 rounded-full border border-orange-100 shadow-sm whitespace-nowrap">
                Viewing For: <span className="uppercase">{user.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
            <button onClick={onRefresh} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Refresh Data">
              <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''} sm:w-5 sm:h-5`} />
            </button>
            <div className="h-5 sm:h-6 w-px bg-gray-200" />
            <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-1.5 sm:gap-2 bg-red-50 text-red-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-100 transition-all group">
              <LogOut size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
              <TrendingUp size={20} className="text-orange-500 sm:w-6 sm:h-6" />
              Top 10 Products (Bonhoeffer)
            </h3>
            <div className="h-[400px] sm:h-[500px] -ml-4 sm:-ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Global} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={isMobile ? 120 : 180} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={<CustomYAxisTick />}
                  />
                  <Tooltip cursor={{ fill: '#fff7ed', radius: 4 }} content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={isMobile ? 24 : 32}>
                    {top10Global.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
              <LayoutDashboard size={20} className="text-orange-500 sm:w-6 sm:h-6" />
              Top 10 Products ({user.isAdmin ? selectedClient : user.name})
            </h3>
            <div className="h-[400px] sm:h-[500px] -ml-4 sm:-ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Client} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={isMobile ? 120 : 180} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={<CustomYAxisTick />}
                  />
                  <Tooltip cursor={{ fill: '#fff7ed', radius: 4 }} content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={isMobile ? 24 : 32}>
                    {top10Client.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full px-4 py-6 sm:py-8 text-center text-gray-400 text-[10px] sm:text-sm">
        © {new Date().getFullYear()} Bonhoeffer AG. All sales analytics are synced in real-time.
      </footer>
    </div>
  );
};

export default Dashboard;
