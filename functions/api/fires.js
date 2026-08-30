const UA = { "User-Agent": "YouNeeKProRadar/1.0 (fires)" };

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((item) => item.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cols[index];
    });
    return row;
  });
}

export async function onRequestGet() {
  try {
    const [eonetResult, firmsResult] = await Promise.allSettled([
      fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=wildfires", {
        headers: UA,
      }).then((response) => {
        if (!response.ok) throw new Error(`EONET ${response.status}`);
        return response.json();
      }),
      fetch(
        "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_USA_contiguous_and_Hawaii_24h.csv",
        { headers: UA }
      ).then((response) => {
        if (!response.ok) throw new Error(`FIRMS ${response.status}`);
        return response.text();
      }),
    ]);

    const events =
      eonetResult.status === "fulfilled"
        ? (eonetResult.value.events || []).map((event) => {
            const geometry = event.geometry?.[event.geometry.length - 1] || {};
            const coords = geometry.coordinates || [];
            return {
              id: event.id,
              title: event.title,
              lat: Number(coords[1]),
              lon: Number(coords[0]),
              date: geometry.date,
              source: "EONET",
            };
          })
        : [];

    const detections =
      firmsResult.status === "fulfilled"
        ? parseCsv(firmsResult.value)
            .map((row) => ({
              lat: Number(row.latitude),
              lon: Number(row.longitude),
              brightness: Number(row.bright_ti4 || row.brightness),
              frp: Number(row.frp),
              confidence: row.confidence,
              date: row.acq_date,
              time: row.acq_time,
              daynight: row.daynight,
              source: "VIIRS",
            }))
            .filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon))
            .sort((a, b) => (b.frp || 0) - (a.frp || 0))
            .slice(0, 400)
        : [];

    return Response.json(
      {
        events,
        detections,
        updated: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch (error) {
    return Response.json(
      { events: [], detections: [], error: error.message },
      { status: 502 }
    );
  }
}
