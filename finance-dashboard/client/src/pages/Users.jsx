import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';

export default function Users() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useUser();

  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [getToken]);

  const updateUser = async (id, field, value) => {
    try {
      const token = await getToken();
      // find original mapping to preserve other fields
      const targetUser = users.find(u => u._id === id);
      const payload = { role: targetUser.role, status: targetUser.status, [field]: value };
      
      await axios.put(`http://localhost:5000/api/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || "Error updating user");
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading users...</div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1>User Management</h1>
          <p>Assign roles and activate or deactivate accounts.</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map(u => {
              const isOnline = u.clerkId === currentUser?.id;
              return (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name || "N/A"}</td>
                  <td>{u.email}</td>
                  <td>
                    <select 
                      className="form-control" 
                      value={u.role} 
                      onChange={(e) => updateUser(u._id, 'role', e.target.value)}
                      style={{ padding: '6px', fontSize: '13px', width: '100px' }}
                      disabled={u.clerkId === currentUser?.id}
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Analyst">Analyst</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${isOnline ? 'badge-income' : 'badge-expense'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {isOnline ? '🟢 Online' : '🔴 Offline'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: 'center', opacity: 0.5, padding: '24px' }}>No user data available or unauthorized.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
