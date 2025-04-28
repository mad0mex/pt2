import db from '@/lib/db';

export async function POST(req) {
  try {
    const data = await req.json();

    const produktname = data['production'];
    const datum = data['production-date'];
    const erstelltVon = data['name'];

    // 1. Produkt speichern
    const produktStmt = db.prepare('INSERT INTO produkte (produktname, datum, erstellt_von) VALUES (?, ?, ?)');
    const produktResult = produktStmt.run(produktname, datum, erstelltVon);
    const produktId = produktResult.lastInsertRowid;

    // 2. Zutaten aus der FormData extrahieren
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
    Object.values(zutatenMap).forEach((zutat) => {
      if (!(zutat.mhd || zutat.chargennummer || zutat.marke)) return;
      let zutatRow = db.prepare('SELECT id FROM zutaten WHERE name = ?').get(zutat.name);
      if (!zutatRow) {
        const insertZutat = db.prepare('INSERT INTO zutaten (name) VALUES (?)').run(zutat.name);
        zutatRow = { id: insertZutat.lastInsertRowid };
      }
      db.prepare(`
        INSERT INTO produkt_zutat (produkt_id, zutat_id, mhd, chargennummer, marke)
        VALUES (?, ?, ?, ?, ?)
      `).run(produktId, zutatRow.id, zutat.mhd, zutat.chargennummer, zutat.marke);
    });

    return new Response(JSON.stringify({ message: 'Successfully saved' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
