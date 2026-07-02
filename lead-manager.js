const fs  = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'leads.json');

function loadLeads() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function saveLeads(leads) {
  fs.writeFileSync(FILE, JSON.stringify(leads, null, 2));
}

function importCSV(csvText) {
  const lines    = csvText.trim().split('\n');
  const headers  = lines[0].split(',').map(h => h.trim());
  const existing = loadLeads();
  const phones   = new Set(existing.map(l => l.phone));
  const newLeads = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const lead   = {};
    headers.forEach((h, j) => lead[h] = values[j] || '');

    if (!lead.phone || phones.has(lead.phone)) continue;

    lead.status   = 'pending';
    lead.attempts = 0;
    lead.addedAt  = new Date().toISOString();
    newLeads.push(lead);
    phones.add(lead.phone);
  }

  saveLeads([...existing, ...newLeads]);
  console.log(`Imported ${newLeads.length} new leads`);
  return newLeads;
}

function updateLead(phone, updates) {
  const leads = loadLeads();
  const idx   = leads.findIndex(l => l.phone === phone);
  if (idx === -1) return;
  leads[idx] = { ...leads[idx], ...updates };
  saveLeads(leads);
}

function getPending(limit = 5) {
  return loadLeads()
    .filter(l => l.status === 'pending' && l.attempts < 3)
    .slice(0, limit);
}

function getRetry(limit = 5) {
  const fourHrs = 4 * 60 * 60 * 1000;
  return loadLeads()
    .filter(l =>
      l.status    === 'no_answer' &&
      l.attempts   <  3 &&
      l.last_called &&
      Date.now() - new Date(l.last_called).getTime() > fourHrs
    )
    .slice(0, limit);
}

module.exports = { loadLeads, saveLeads, importCSV, updateLead, getPending, getRetry };