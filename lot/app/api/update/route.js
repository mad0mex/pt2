import db from '@/lib/db';

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, produktname, datum, erstellt_von, zutaten } = body;

    if (!id || !produktname || !datum || !erstellt_von || !Array.isArray(zutaten)) {
      return new Response(JSON.stringify({ error: "Ungültige Daten" }), { status: 400 });
    }

    // Produkt aktualisieren
    db.prepare(`
      UPDATE produkte SET produktname = ?, datum = ?, erstellt_von = ?
      WHERE id = ?
    `).run(produktname, datum, erstellt_von, id);

    // Bestehende Zutaten löschen
    db.prepare(`DELETE FROM produkt_zutat WHERE produkt_id = ?`).run(id);

    // Zutaten neu einfügen
    const insert = db.prepare(`
      INSERT INTO produkt_zutat (produkt_id, zutat_id, mhd, chargennummer, marke)
      VALUES (?, (SELECT id FROM zutaten WHERE name = ?), ?, ?, ?)
    `);

    for (const z of zutaten) {
      insert.run(id, z.zutat, z.mhd, z.chargennummer, z.marke);
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    console.error("Update-Fehler:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
