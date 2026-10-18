// Minimal ICS (iCalendar) parser: supports VEVENT only.
// Handles the common cases in Google Calendar, Apple Calendar, and Outlook exports.
// Returns an array of { summary, start (Date), end (Date?), description?, location? }.

export function parseICS(text) {
  const events = [];
  // Unfold long lines per RFC 5545: lines beginning with a space/tab continue the previous line.
  const unfolded = text.replace(/\r?\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);

  let current = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current && current.summary && current.start) {
        events.push(current);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const left = line.slice(0, colon);
    const value = line.slice(colon + 1);
    // Strip parameters (e.g. DTSTART;TZID=America/New_York:20240101)
    const field = left.split(';')[0];
    const params = left.includes(';') ? left.slice(left.indexOf(';') + 1) : '';

    switch (field) {
      case 'SUMMARY':
        current.summary = unescapeICS(value);
        break;
      case 'DESCRIPTION':
        current.description = unescapeICS(value);
        break;
      case 'LOCATION':
        current.location = unescapeICS(value);
        break;
      case 'DTSTART':
        current.start = parseICSDate(value, params);
        break;
      case 'DTEND':
        current.end = parseICSDate(value, params);
        break;
      default:
        break;
    }
  }

  return events;
}

function unescapeICS(s) {
  return s
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\');
}

function parseICSDate(value, params) {
  // All-day: YYYYMMDD
  if (/^\d{8}$/.test(value)) {
    const y = +value.slice(0, 4);
    const m = +value.slice(4, 6) - 1;
    const d = +value.slice(6, 8);
    return new Date(y, m, d);
  }
  // UTC: YYYYMMDDTHHMMSSZ
  if (/^\d{8}T\d{6}Z$/.test(value)) {
    return new Date(
      +value.slice(0, 4),
      +value.slice(4, 6) - 1,
      +value.slice(6, 8),
      +value.slice(9, 11),
      +value.slice(11, 13),
      +value.slice(13, 15)
    );
  }
  // Local: YYYYMMDDTHHMMSS
  if (/^\d{8}T\d{6}$/.test(value)) {
    return new Date(
      +value.slice(0, 4),
      +value.slice(4, 6) - 1,
      +value.slice(6, 8),
      +value.slice(9, 11),
      +value.slice(11, 13),
      +value.slice(13, 15)
    );
  }
  return null;
}