const HEADER_LINE = /^(?:ZCZC|NNNN|\$\$)\b|^(?:WWUS|WOUS|FXUS|ACUS|NWUS|WHUS|AWUS|WFUS)\d{2}\b|^[A-Z]{4}\d{2}\s+K[A-Z]{3}\b|^SPC\s+AC\b|^DAY[1-8]\b/i;

export function stripSpcHeader(text) {
  return String(text || "")
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(".")) return false;
      return !HEADER_LINE.test(trimmed);
    })
    .join("\n")
    .trim();
}
