import pool from "@/lib/db";

export async function DELETE(req) {
  const { searchParams } = new URL(req.url, "http://localhost");
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Keine ID angegeben" }), {
      status: 400,
    });
  }

  try {
    // 1. zuerst Verknüpfungen löschen
    await pool.query("DELETE FROM produkt_zutat WHERE produkt_id = $1", [id]);

    // 2. dann Produkt selbst löschen
    await pool.query("DELETE FROM produkte WHERE id = $1", [id]);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Fehler beim Löschen:", error);
    return new Response(JSON.stringify({ error: "Fehler beim Löschen" }), {
      status: 500,
    });
  }
}
