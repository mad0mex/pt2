import pool from '@/lib/db';
import { FORM_FIELDS } from '@/app/components/fields';

export async function GET(req) {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const month = searchParams.get('month');

  let produktionen = [];

  const baseQuery = `
    SELECT id, produktname, datum, erstellt_von, template_key
    FROM produkte
    ${month ? 'WHERE datum BETWEEN $1 AND $2' : ''}
    ORDER BY datum DESC
  `;

  if (month) {
    const from = `${month}-01`;
    const to = new Date(from);
    to.setMonth(to.getMonth() + 1);
    to.setDate(0);
    const toStr = to.toISOString().slice(0, 10);

    const result = await pool.query(baseQuery, [from, toStr]);
    produktionen = result.rows;
  } else {
    const result = await pool.query(baseQuery);
    produktionen = result.rows;
  }

  const rows = [];

  for (const prod of produktionen) {
    const fieldMap = FORM_FIELDS[prod.template_key]?.reduce((acc, field) => {
      acc[field.name] = field.title;
      return acc;
    }, {});

    const zutatenResult = await pool.query(
      `
      SELECT z.name AS zutat, pz.mhd, pz.chargennummer, pz.marke
      FROM produkt_zutat pz
      JOIN zutaten z ON pz.zutat_id = z.id
      WHERE pz.produkt_id = $1
    `,
      [prod.id]
    );

    for (const z of zutatenResult.rows) {
      rows.push({
        Produkt: prod.produktname,
        Datum: prod.datum,
        ErstelltVon: prod.erstellt_von,
        Zutat: fieldMap?.[z.zutat] || z.zutat,
        MHD: z.mhd,
        Chargennummer: z.chargennummer,
        Marke: z.marke,
      });
    }
  }

  const header = 'Produkt;Datum;Erstellt von;Zutat;MHD;Chargennummer;Marke';
  const csv = [
    header,
    ...rows.map((r) =>
      `${r.Produkt};${r.Datum};${r.ErstelltVon};${r.Zutat};${r.MHD};${r.Chargennummer};${r.Marke}`
    ),
  ].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=produktionen-${month || 'alle'}.csv`,
    },
  });
}
