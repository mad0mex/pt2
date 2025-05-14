import pool from '@/lib/db';

export async function POST(req) {
  try {
    const data = await req.json();

    const produktname = data['production'];
    const datum = data['production-date'];
    const erstelltVon = data['name'];
    const templateKey = data['templateKey'];

    // 1. Produkt speichern
    const produktRes = await pool.query(
      `INSERT INTO produkte (produktname, datum, erstellt_von, template_key)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [produktname, datum, erstelltVon, templateKey]
    );
    const produktId = produktRes.rows[0].id;

    // 2. Zutaten aus der Form extrahieren
    const zutatenMap = {};
    Object.keys(data).forEach((key) => {
      const match = key.match(/^(.+)-(mhd|charge|marke)$/);
      if (!match) return;
      const [_, zutatName, feldTyp] = match;
      if (!zutatenMap[zutatName]) {
        zutatenMap[zutatName] = { name: zutatName, mhd: '', chargennummer: '', marke: '' };
      }
      zutatenMap[zutatName][feldTyp === 'charge' ? 'chargennummer' : feldTyp] = data[key];
    });

    // 3. Zutaten speichern
    for (const zutat of Object.values(zutatenMap)) {
      if (!(zutat.mhd || zutat.chargennummer || zutat.marke)) continue;

      // 3a. Zutat holen oder anlegen
      const result = await pool.query(
        `INSERT INTO zutaten (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [zutat.name]
      );
      const zutatId = result.rows[0].id;

      // 3b. Produkt-Zutat speichern
      await pool.query(
        `INSERT INTO produkt_zutat (produkt_id, zutat_id, mhd, chargennummer, marke)
         VALUES ($1, $2, $3, $4, $5)`,
        [produktId, zutatId, zutat.mhd, zutat.chargennummer, zutat.marke]
      );
    }

    return new Response(JSON.stringify({ message: 'Successfully saved' }), { status: 200 });
  } catch (error) {
    console.error('❌ Fehler beim Speichern:', error);
    return new Response(JSON.stringify({ error: 'Fehler beim Speichern' }), { status: 500 });
  }
}
