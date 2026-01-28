
import React, { useState, useEffect, useCallback } from 'react';
import { User, OrderData } from './types';
import { fetchLiveData, fetchUsers } from './services/dataService';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const refreshData = useCallback(async () => {
    try {
      const orders = await fetchLiveData();
      setData(orders);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem('bonhoeffer_user', JSON.stringify(authenticatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bonhoeffer_user');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('bonhoeffer_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      refreshData().finally(() => setLoading(false));

      const interval = setInterval(() => {
        refreshData();
      }, 60000); // 1 minute

      return () => clearInterval(interval);
    }
  }, [user, refreshData]);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      user={user} 
      data={data} 
      loading={loading} 
      lastUpdate={lastUpdate} 
      onLogout={handleLogout} 
      onRefresh={refreshData}
    />
  );
};

export default App;
