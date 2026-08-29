export async function onRequestGet() {
  try {
    const response = await fetch("https://www.nhc.noaa.gov/CurrentStorms.json", {
      headers: { "User-Agent": "YouNeeKProRadar/1.0" },
    });
    if (!response.ok) {
      return Response.json({ activeStorms: [], error: `NHC ${response.status}` });
    }
    const data = await response.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ activeStorms: [], error: err.message });
  }
}
