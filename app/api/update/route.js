import pool from '@/lib/db';

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, produktname, datum, erstellt_von, zutaten } = body;

    if (!id || !produktname || !datum || !erstellt_von || !Array.isArray(zutaten)) {
      return new Response(JSON.stringify({ error: 'Ungültige Daten' }), { status: 400 });
    }

    // 1. Produkt aktualisieren
    await pool.query(
      'UPDATE produkte SET produktname = $1, datum = $2, erstellt_von = $3 WHERE id = $4',
      [produktname, datum, erstellt_von, id]
    );

    // 2. Bestehende Zuordnungen löschen
    await pool.query('DELETE FROM produkt_zutat WHERE produkt_id = $1', [id]);

    // 3. Zutaten neu verknüpfen
    for (const z of zutaten) {
      const zutatName = z.zutat;

      // 3a. Zutat-ID holen oder anlegen
      const zutatResult = await pool.query(
        'INSERT INTO zutaten (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [zutatName]
      );
      const zutatId = zutatResult.rows[0].id;

      // 3b. Neue Verknüpfung einfügen
      await pool.query(
        `INSERT INTO produkt_zutat (produkt_id, zutat_id, mhd, chargennummer, marke)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, zutatId, z.mhd, z.chargennummer, z.marke]
      );
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    console.error('Update-Fehler:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
