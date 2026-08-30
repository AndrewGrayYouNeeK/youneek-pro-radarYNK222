const UA = { "User-Agent": "YouNeeKProRadar/1.0 (outlook)" };

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");

  try {
    const requests = [
      fetch("https://www.spc.noaa.gov/products/outlook/day1otlk.txt", { headers: UA }).then((response) =>
        response.ok ? response.text() : ""
      ),
    ];

    if (lat && lon) {
      requests.push(
        fetch(`https://mesonet.agron.iastate.edu/json/spcoutlook.py?lat=${lat}&lon=${lon}`, {
          headers: UA,
        }).then((response) => (response.ok ? response.json() : null))
      );
    } else {
      requests.push(Promise.resolve(null));
    }

    const [text, point] = await Promise.all(requests);
    const category =
      point?.outlooks?.[0]?.threshold ||
      point?.threshold ||
      point?.outlook ||
      point?.data?.[0]?.threshold ||
      null;

    return Response.json(
      {
        category,
        point: point || null,
        discussion: String(text || "").slice(0, 4000),
        updated: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch (error) {
    return Response.json({ category: null, discussion: "", error: error.message }, { status: 502 });
  }
}
