import db from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url, "http://localhost");
  const month = searchParams.get("month");

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

  const rows = [];
  for (const prod of produktionen) {
    const zutaten = db.prepare(`
      SELECT z.name AS zutat, pz.mhd, pz.chargennummer, pz.marke
      FROM produkt_zutat pz
      JOIN zutaten z ON pz.zutat_id = z.id
      WHERE pz.produkt_id = ?
    `).all(prod.id);

    for (const z of zutaten) {
      rows.push({
        Produkt: prod.produktname,
        Datum: prod.datum,
        ErstelltVon: prod.erstellt_von,
        Zutat: z.zutat,
        MHD: z.mhd,
        Chargennummer: z.chargennummer,
        Marke: z.marke
      });
    }
  }

  const header = "Produkt;Datum;Erstellt von;Zutat;MHD;Chargennummer;Marke";
  const csv = [header, ...rows.map(r =>
    `${r.Produkt};${r.Datum};${r.ErstelltVon};${r.Zutat};${r.MHD};${r.Chargennummer};${r.Marke}`
  )].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=produktionen-${month || 'alle'}.csv`
    }
  });
}
