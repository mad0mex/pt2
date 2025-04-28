'use client';
import { useEffect, useState } from 'react';

export default function BackendOverview() {
  const [produktionen, setProduktionen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [editingProd, setEditingProd] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const url = filterMonth ? `/api/overview?month=${filterMonth}` : '/api/overview';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProduktionen(data);
        setLoading(false);
      });
  }, [filterMonth]);

  const handleDelete = async (id) => {
    const password = prompt("Zum Löschen bitte Passwort eingeben:");
    if (password !== "1220") return alert("Falsches Passwort!");

    try {
      const res = await fetch(`/api/delete?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Löschen fehlgeschlagen");
      setProduktionen(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      alert("Eintrag konnte nicht gelöscht werden.");
    }
  };

  const openEdit = (prod) => {
    setEditingProd(prod);
    setEditData({
      produktname: prod.produktname,
      datum: prod.datum,
      erstellt_von: prod.erstellt_von,
      zutaten: prod.zutaten.map(z => ({ ...z }))
    });
  };

  const handleEditChange = (e, index, field) => {
    const updated = [...editData.zutaten];
    updated[index][field] = e.target.value;
    setEditData({ ...editData, zutaten: updated });
  };

  const saveEdit = async () => {
    const res = await fetch('/api/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingProd.id, ...editData })
    });

    if (res.ok) {
      setEditingProd(null);
      setLoading(true);
      const url = filterMonth ? `/api/overview?month=${filterMonth}` : '/api/overview';
      const newData = await fetch(url).then(r => r.json());
      setProduktionen(newData);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Lade Daten...</div>;

  return (
    <div className="p-6 bg-amber-100 min-h-screen text-black max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Produktionsübersicht</h1>
      <div className="mb-4">
        <label className="font-bold mr-2">Produktion am:</label>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      <button
        onClick={() => {
          const url = filterMonth ? `/api/export?month=${filterMonth}` : '/api/export';
          window.open(url, '_blank');
        }}
        className="mb-4 px-4 py-2 bg-amber-300 rounded hover:bg-amber-400 transition"
      >
        CSV exportieren
      </button>

      <div className="space-y-6">
        {produktionen.map((prod) => (
          <div key={prod.id} className="border rounded-lg p-4 bg-amber-100 shadow">
            <div className="mb-2">
              <span className="font-semibold">Produkt:</span> {prod.produktname} <br />
              <span className="font-semibold">Datum:</span> {prod.datum || '–'} <br />
              <span className="font-semibold">Erstellt von:</span> {prod.erstellt_von}
            </div>

            {prod.zutaten.length > 0 ? (
              <table className="w-full table-auto border-collapse mt-3 text-sm">
                <thead>
                  <tr className="bg-amber-300 text-left">
                    <th className="border px-2 py-1">Zutat</th>
                    <th className="border px-2 py-1">MHD</th>
                    <th className="border px-2 py-1">Chargennummer</th>
                    <th className="border px-2 py-1">Marke</th>
                  </tr>
                </thead>
                <tbody>
                  {prod.zutaten.map((zutat, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{zutat.zutat}</td>
                      <td className="border px-2 py-1">{zutat.mhd}</td>
                      <td className="border px-2 py-1">{zutat.chargennummer}</td>
                      <td className="border px-2 py-1">{zutat.marke}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-sm mt-2">Keine Zutaten erfasst.</p>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={() => openEdit(prod)} className="px-3 py-1 bg-amber-300 rounded text-sm hover:bg-amber-400 transition">Bearbeiten</button>
              <button onClick={() => handleDelete(prod.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Löschen</button>
            </div>
          </div>
        ))}
      </div>

      {editingProd && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-amber-100 border-3 p-6 rounded shadow-xl w-[90%] max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">Eintrag bearbeiten</h2>

            <input type="text" className="border p-2 w-full mb-2" value={editData.produktname} onChange={(e) => setEditData({ ...editData, produktname: e.target.value })} />
            <input type="date" className="border p-2 w-full mb-2" value={editData.datum} onChange={(e) => setEditData({ ...editData, datum: e.target.value })} />
            <input type="text" className="border p-2 w-full mb-4" value={editData.erstellt_von} onChange={(e) => setEditData({ ...editData, erstellt_von: e.target.value })} />

            <table className="w-full mb-4 text-sm">
              <thead>
                <tr className="bg-amber-300">
                  <th className="border p-1">Zutat</th>
                  <th className="border p-1">MHD</th>
                  <th className="border p-1">Chargennr.</th>
                  <th className="border p-1">Marke</th>
                </tr>
              </thead>
              <tbody>
                {editData.zutaten.map((z, i) => (
                  <tr key={i}>
                    <td className="border p-1">{z.zutat}</td>
                    <td className="border p-1">
                      <input type="text" value={z.mhd} onChange={(e) => handleEditChange(e, i, 'mhd')} className="w-full" />
                    </td>
                    <td className="border p-1">
                      <input type="text" value={z.chargennummer} onChange={(e) => handleEditChange(e, i, 'chargennummer')} className="w-full" />
                    </td>
                    <td className="border p-1">
                      <input type="text" value={z.marke} onChange={(e) => handleEditChange(e, i, 'marke')} className="w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex gap-4">
              <button onClick={saveEdit} className="bg-amber-300 hover:bg-amber-400 transition px-4 py-2 rounded">Speichern</button>
              <button onClick={() => setEditingProd(null)} className="bg-gray-300 hover:bg-gray-400 transistion px-4 py-2 rounded">Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
