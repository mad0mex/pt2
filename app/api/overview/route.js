import pool from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url, 'http://localhost');
    const month = searchParams.get('month');

    let produktionen;

    if (month) {
      const from = `${month}-01`;
      const to = new Date(from);
      to.setMonth(to.getMonth() + 1);
      to.setDate(0);
      const toStr = to.toISOString().slice(0, 10);

      const result = await pool.query(
        'SELECT * FROM produkte WHERE datum BETWEEN $1 AND $2 ORDER BY datum DESC',
        [from, toStr]
      );
      produktionen = result.rows;
    } else {
      const result = await pool.query(
        'SELECT * FROM produkte ORDER BY datum DESC'
      );
      produktionen = result.rows;
    }

    const finalResult = [];

    for (const prod of produktionen) {
      const zutatenResult = await pool.query(
        `
        SELECT z.name AS zutat, pz.mhd, pz.chargennummer, pz.marke
        FROM produkt_zutat pz
        JOIN zutaten z ON pz.zutat_id = z.id
        WHERE pz.produkt_id = $1
      `,
        [prod.id]
      );

      finalResult.push({
        id: prod.id,
        produktname: prod.produktname,
        datum: prod.datum,
        erstellt_von: prod.erstellt_von,
        template_key: prod.template_key ?? null,
        zutaten: zutatenResult.rows,
      });
    }

    return new Response(JSON.stringify(finalResult), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
