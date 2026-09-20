// Maps ISO 3166-1 alpha-2 country codes to continents, so we can show
// "countries played" and "continents played" stats under the course map.

const CONTINENT_CODES: Record<string, string> = {
  Europe:
    "AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA XK",
  "North America":
    "AG AI AW BB BL BM BQ BS BZ CA CR CU CW DM DO GD GL GP GT HN HT JM KN KY LC MF MQ MS MX NI PA PM PR SV SX TC TT US VC VG VI",
  "South America": "AR BO BR CL CO EC FK GF GY PE PY SR UY VE",
  Asia:
    "AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE",
  Africa:
    "AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW",
  Oceania:
    "AS AU CK FJ FM GU KI MH MP NC NF NR NU NZ PF PG PW SB TK TO TV VU WF WS",
  Antarctica: "AQ BV GS HM TF",
};

const LOOKUP: Record<string, string> = {};
for (const [continent, codes] of Object.entries(CONTINENT_CODES)) {
  for (const code of codes.split(" ")) LOOKUP[code] = continent;
}

export function continentForCountry(code?: string | null): string | null {
  if (!code) return null;
  return LOOKUP[code.toUpperCase()] ?? null;
}
