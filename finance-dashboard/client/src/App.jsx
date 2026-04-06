import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useUser, UserButton, useAuth } from '@clerk/clerk-react';
import { LayoutDashboard, Wallet, Users, PieChart } from 'lucide-react';
import axios from 'axios';
import { createContext, useContext, useState, useEffect } from 'react';

import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import UsersPage from './pages/Users';
import Summaries from './pages/Summaries';
import Login from './pages/Login';

export const RoleContext = createContext(null);

function Layout({ children }) {
  const { user } = useUser();
  const location = useLocation();
  const dbUser = useContext(RoleContext);
  const role = dbUser?.role || 'Viewer';

  const getNavClass = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-logo">FinanceApp</div>
        <div className="sidebar-nav">
          <Link to="/dashboard" className={getNavClass('/dashboard')}><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/records" className={getNavClass('/records')}><Wallet size={20} /> Records</Link>

          {(role === 'Analyst' || role === 'Admin') && (
            <Link to="/summaries" className={getNavClass('/summaries')}><PieChart size={20} /> Insights</Link>
          )}
          {role === 'Admin' && (
            <Link to="/users" className={getNavClass('/users')}><Users size={20} /> Admin Page</Link>
          )}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div className="flex-between glass-panel" style={{ padding: '12px', border: 'none', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserButton />
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{user?.firstName || 'User'}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

function App() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    if (isSignedIn && user) {
      const syncLocalUser = async () => {
        try {
          const token = await getToken();
          const res = await axios.post('http://localhost:5000/api/users/sync', {
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setDbUser(res.data);
        } catch (error) {
          console.error("Local sync error:", error);
        }
      };
      syncLocalUser();
    }
  }, [isSignedIn, user, getToken]);

  if (!isLoaded || (isSignedIn && !dbUser)) return <div style={{ color: 'white', padding: 40 }}>Loading Profile...</div>;

  if (!isSignedIn) {
    return <Login />;
  }

  return (
    <RoleContext.Provider value={dbUser}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/records" element={<Records />} />
          <Route path="/summaries" element={<Summaries />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </RoleContext.Provider>
  );
}

export default App;
