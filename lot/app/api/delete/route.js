import db from '@/lib/db';

export async function DELETE(req) {
  const { searchParams } = new URL(req.url, "http://localhost");
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Keine ID angegeben" }), { status: 400 });
  }

  // zuerst Zutaten-Einträge löschen (wegen Foreign Key)
  db.prepare('DELETE FROM produkt_zutat WHERE produkt_id = ?').run(id);
  // dann Produkt selbst löschen
  db.prepare('DELETE FROM produkte WHERE id = ?').run(id);

  return new Response(JSON.stringify({ success: true }));
}
