function plainText(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function alertSummary(feature) {
  const properties = feature?.properties || {};
  return {
    id: String(feature?.id || properties.id || properties.headline || properties.event || "alert"),
    event: properties.event || "Weather alert",
    headline: plainText(properties.headline),
    description: plainText(properties.description),
    instruction: plainText(properties.instruction),
    area: plainText(properties.areaDesc),
    expires: properties.expires || "",
    severity: properties.severity || "",
    sender: properties.senderName || "National Weather Service",
  };
}

export function warningFeatures(collection) {
  return (collection?.features || []).filter((feature) => /warning/i.test(feature?.properties?.event || ""));
}
