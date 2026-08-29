const fs = require('fs');

const inputFile = 'maghagha-menu-default-rtdb-export.json';
const outputFile = 'data_import.sql';

// Read JSON
let data;
try {
  const raw = fs.readFileSync(inputFile, 'utf-8');
  data = JSON.parse(raw);
} catch (e) {
  console.error("Error reading JSON file:", e.message);
  process.exit(1);
}

let sql = `-- Data Import Script for Hostinger\n`;
sql += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\nSTART TRANSACTION;\n\n`;

function escapeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function toJsonStr(val) {
  if (Array.isArray(val) || typeof val === 'object') {
    return escapeString(JSON.stringify(val));
  }
  return escapeString(val);
}

// 1. Captains
if (data.captains && Array.isArray(data.captains)) {
  data.captains.forEach(c => {
    if (!c.id) return;
    const name = escapeString(c.name || '');
    const desc = escapeString(c.description || '');
    const phone = escapeString(c.phone || '');
    const wa = escapeString(c.whatsApp || '');
    const avatar = escapeString(c.avatar || '');
    const isAvail = c.isAvailable === false ? 0 : 1;
    const trips = parseInt(c.tripsCount) || 0;
    const services = toJsonStr(c.serviceTypes || []);
    
    sql += `INSERT IGNORE INTO captains (id, name, description, phone, whatsApp, avatar, isAvailable, tripsCount, serviceTypes) VALUES ('${c.id}', '${name}', '${desc}', '${phone}', '${wa}', '${avatar}', ${isAvail}, ${trips}, '${services}');\n`;
  });
}

// 2. Doctor Categories
if (data.doctor_categories && Array.isArray(data.doctor_categories)) {
  data.doctor_categories.forEach(dc => {
    if (!dc.id) return;
    const name = escapeString(dc.name || '');
    const icon = escapeString(dc.icon || '');
    sql += `INSERT IGNORE INTO doctor_categories (id, name, icon) VALUES ('${dc.id}', '${name}', '${icon}');\n`;
  });
}

// 3. Doctors
if (data.doctors && Array.isArray(data.doctors)) {
  data.doctors.forEach(d => {
    if (!d.id) return;
    const name = escapeString(d.name || '');
    const spec = escapeString(d.specialty || '');
    const specId = escapeString(d.specialtyId || '');
    const phone = escapeString(d.phone || '');
    const address = escapeString(d.address || '');
    const workingDays = escapeString(d.workingDays || '');
    const workingHours = toJsonStr(d.workingHours || '');
    
    sql += `INSERT IGNORE INTO doctors (id, name, specialty, specialtyId, phone, address, workingDays, workingHours) VALUES ('${d.id}', '${name}', '${spec}', '${specId}', '${phone}', '${address}', '${workingDays}', '${workingHours}');\n`;
  });
}

// 4. Calls
if (data.calls) {
  for (const [category, entities] of Object.entries(data.calls)) {
    if (typeof entities === 'object' && entities !== null) {
      for (const [entityId, val] of Object.entries(entities)) {
        let count = 0;
        if (typeof val === 'number') count = val;
        else if (val && typeof val === 'object' && val.total) count = val.total;
        
        sql += `INSERT IGNORE INTO calls (entity_category, entity_id, call_count) VALUES ('${escapeString(category)}', '${escapeString(entityId)}', ${count});\n`;
      }
    }
  }
}

// You can easily extend this script for restaurants, supermarkets, jobs, etc. by following the same pattern above!

sql += `\nCOMMIT;\n`;

fs.writeFileSync(outputFile, sql, 'utf-8');
console.log(`Generated SQL file successfully: ${outputFile}`);
