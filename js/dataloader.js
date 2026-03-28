/**
 * dataloader.js
 * Loads all CSV and GeoJSON data files in parallel,
 * auto-parses numeric columns, and logs summaries.
 */

/**
 * Determine which columns in a CSV dataset are numeric.
 * A column is numeric if every non-empty value in the first 20 rows
 * passes !isNaN after trimming whitespace.
 */
function detectNumericColumns(rows) {
  if (!rows || rows.length === 0) return [];

  const columns = rows.columns || Object.keys(rows[0]);
  const sampleRows = rows.slice(0, 20);
  const numericCols = [];

  for (const col of columns) {
    let allNumeric = true;
    let hasValue = false;

    for (const row of sampleRows) {
      const val = (row[col] || '').trim();
      if (val === '') continue; // skip empty
      hasValue = true;
      if (isNaN(val)) {
        allNumeric = false;
        break;
      }
    }

    if (allNumeric && hasValue) {
      numericCols.push(col);
    }
  }

  return numericCols;
}

/**
 * Parse all detected numeric columns in-place using unary +.
 */
function parseNumericColumns(rows, numericCols) {
  for (const row of rows) {
    for (const col of numericCols) {
      const val = (row[col] || '').trim();
      row[col] = val === '' ? null : +val;
    }
  }
}

/**
 * Log a summary of a CSV dataset to the console.
 */
function logCSVSummary(name, rows) {
  const columns = rows.columns || Object.keys(rows[0]);
  const years = rows.map(r => r.YEAR).filter(y => y != null && !isNaN(y));
  const minYear = years.length ? Math.min(...years) : 'N/A';
  const maxYear = years.length ? Math.max(...years) : 'N/A';

  const jurisdictionCol = columns.find(c => c.toUpperCase() === 'JURISDICTION');
  const jurisdictions = jurisdictionCol
    ? [...new Set(rows.map(r => r[jurisdictionCol]).filter(Boolean))]
    : [];

  console.group(`📊 ${name}`);
  console.log(`Rows: ${rows.length}`);
  console.log(`Columns: ${columns.join(', ')}`);
  console.log(`Year range: ${minYear} – ${maxYear}`);
  console.log(`Jurisdictions: ${jurisdictions.join(', ') || 'none found'}`);
  console.groupEnd();
}

/**
 * Load all 5 data files in parallel.
 * Returns { alcoholDrug, breathTests, drugTests, fines, geoJSON }
 */
export async function loadAllData() {
  const [alcoholDrug, breathTests, drugTests, fines, geoJSON] = await Promise.all([
    d3.csv('data/alcohol_drug_tests.csv'),
    d3.csv('data/positive_breath_tests.csv'),
    d3.csv('data/positive_drug_tests.csv'),
    d3.csv('data/fines.csv'),
    d3.json('data/australia.geojson'),
  ]);

  // Auto-detect and parse numeric columns for each CSV
  const csvFiles = [
    { name: 'alcohol_drug_tests.csv', data: alcoholDrug },
    { name: 'positive_breath_tests.csv', data: breathTests },
    { name: 'positive_drug_tests.csv', data: drugTests },
    { name: 'fines.csv', data: fines },
  ];

  for (const file of csvFiles) {
    const numericCols = detectNumericColumns(file.data);
    parseNumericColumns(file.data, numericCols);
    logCSVSummary(file.name, file.data);
  }

  // Log GeoJSON info
  console.group('🗺️ australia.geojson');
  console.log(`Features: ${geoJSON.features.length}`);
  const sampleProps = geoJSON.features[0]?.properties;
  if (sampleProps) {
    console.log(`Property names: ${Object.keys(sampleProps).join(', ')}`);
    console.log(`Sample state: ${JSON.stringify(sampleProps)}`);
  }
  console.groupEnd();

  return { alcoholDrug, breathTests, drugTests, fines, geoJSON };
}
