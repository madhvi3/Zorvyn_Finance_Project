import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { RoleContext } from '../App';

export default function Records() {
  const { getToken } = useAuth();
  const dbUser = useContext(RoleContext);
  const role = dbUser?.role || 'Viewer';
  const isViewer = role === 'Viewer';
  
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const fetchRecords = async () => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (filterType) params.append("type", filterType);
      if (filterCategory) params.append("category", filterCategory);
      if (filterStartDate && filterEndDate) {
        params.append("startDate", filterStartDate);
        params.append("endDate", filterEndDate);
      }
      
      const res = await axios.get(`http://localhost:5000/api/records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line
  }, [getToken, filterType, filterCategory, filterStartDate, filterEndDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newRec = {
      notes: fd.get('desc'),
      category: fd.get('category'),
      amount: parseFloat(fd.get('amount')),
      type: fd.get('type')
    };

    try {
      const token = await getToken();
      if (editRecord) {
        await axios.put(`http://localhost:5000/api/records/${editRecord._id}`, newRec, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/records', newRec, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditRecord(null);
      fetchRecords();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error saving record.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const token = await getToken();
      await axios.delete(`http://localhost:5000/api/records/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRecords();
    } catch (error) {
      alert("Failed to delete record.");
    }
  }

  const openAddModal = () => {
    setEditRecord(null);
    setShowModal(true);
  }

  const openEditModal = (r) => {
    setEditRecord(r);
    setShowModal(true);
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Financial Records</h1>
          <p>Manage and view all organizational transactions from the database.</p>
        </div>
        {isViewer && (
          <button className="btn-primary" onClick={openAddModal}>+ Add Record</button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <input type="text" className="form-control" placeholder="Filter by Category..." style={{ flex: 1, minWidth: '150px' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} />
        <select className="form-control" style={{ width: '150px' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <input type="date" className="form-control" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
          <span style={{color: 'white'}}>to</span>
          <input type="date" className="form-control" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              {isViewer && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {(records || []).map(r => (
              <tr key={r._id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.notes || 'N/A'}</td>
                <td>{r.category}</td>
                <td>
                  <span className={`badge ${r.type === 'Income' ? 'badge-income' : 'badge-expense'}`}>
                    {r.type}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                {isViewer && (
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => openEditModal(r)}>Edit</button>
                    <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleDelete(r._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={isViewer ? 6 : 5} style={{ textAlign: 'center', opacity: 0.5, padding: '24px' }}>No records found matching filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '24px' }}>{editRecord ? "Edit Record" : "Add New Record"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Description (Notes)</label>
                <input name="desc" type="text" className="form-control" defaultValue={editRecord?.notes || ''} required />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input name="amount" type="number" step="0.01" className="form-control" defaultValue={editRecord?.amount || ''} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input name="category" type="text" className="form-control" defaultValue={editRecord?.category || ''} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type" className="form-control" defaultValue={editRecord?.type || 'Income'} required>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
