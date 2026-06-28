export function getDistrictFillColor(cases: number | undefined): string {
  if (cases === undefined) return '#1c1c1e'; // Muted dark zinc base for zero/null records
  if (cases > 150) return '#ef4444';          // Neon Crimson (Epidemic Limit)
  if (cases > 80)  return '#f97316';          // Muted Orange (Warning Alert)
  if (cases > 40)  return '#eab308';          // Soft Amber (Pre-Alert Threshold)
  return '#27272a';                           // Clean Apple Zinc Gray (Low Transmission base)
}