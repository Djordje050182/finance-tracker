function parseLine(line) {
  const fields = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(field.trim());
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field.trim());
  return fields;
}

export function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/['"]/g, ''));
  const dateIndex = headers.findIndex((h) => h.includes('date') || h.includes('transaction'));
  const descIndex = headers.findIndex((h) => h.includes('description') || h.includes('merchant') || h.includes('name'));
  const amountIndex = headers.findIndex((h) =>
    h.includes('amount') || h.includes('debit') || h.includes('credit') ||
    h.includes('withdrawal') || h.includes('deposit')
  );

  if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
    throw new Error('Could not find required columns (Date, Description, Amount). Please check your CSV format.');
  }

  const transactions = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const dateStr = values[dateIndex];
    const description = values[descIndex];
    const amountStr = values[amountIndex];
    if (!dateStr || !description || !amountStr) continue;

    const cleanAmount = amountStr
      .replace(/["']/g, '')
      .replace(/\$/g, '')
      .replace(/,/g, '')
      .replace(/\s+/g, '')
      .replace(/[()]/g, '');
    const amount = parseFloat(cleanAmount);
    if (isNaN(amount) || amount === 0) continue;

    let parsedDate;
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        parsedDate = `${year}-${month}-${day}`;
      } else {
        parsedDate = new Date(dateStr).toISOString().split('T')[0];
      }
    } catch {
      parsedDate = new Date().toISOString().split('T')[0];
    }

    transactions.push({ description, amount, date: parsedDate });
  }
  return transactions;
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}
