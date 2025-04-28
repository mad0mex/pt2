import db from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost");
    const month = searchParams.get('month');

    let produktionen = [];

    if (month) {
      const from = `${month}-01`;
      const to = new Date(from);
      to.setMonth(to.getMonth() + 1);
      to.setDate(0);
      const toStr = to.toISOString().slice(0, 10);

      produktionen = db.prepare(
        'SELECT * FROM produkte WHERE datum BETWEEN ? AND ? ORDER BY datum DESC'
      ).all(from, toStr);
    } else {
      produktionen = db.prepare('SELECT * FROM produkte ORDER BY datum DESC').all();
    }

    const result = [];

    for (const prod of produktionen) {
      const zutaten = db.prepare(`
        SELECT z.name AS zutat, pz.mhd, pz.chargennummer, pz.marke
        FROM produkt_zutat pz
        JOIN zutaten z ON pz.zutat_id = z.id
        WHERE pz.produkt_id = ?
      `).all(prod.id);

      result.push({
        id: prod.id,
        produktname: prod.produktname,
        datum: prod.datum,
        erstellt_von: prod.erstellt_von,
        zutaten
      });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
