import React, { useEffect, useState } from 'react';

export default function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');

  async function loadUsers() {
    const res = await fetch('http://localhost:5000/api/users');
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      setName('');
      loadUsers();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Users</h2>
      <ul>
        {users.map(u => <li key={u.id}>{u.name}</li>)}
      </ul>

      <form onSubmit={handleAdd}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New name" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
