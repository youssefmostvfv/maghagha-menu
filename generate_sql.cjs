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

// تفريغ الجداول أولاً لعدم تكرار البيانات أو حدوث تداخل
const tablesToTruncate = [
  'captains', 'doctors', 'doctor_categories', 'restaurants', 
  'restaurant_categories', 'supermarkets', 'pharmacies', 
  'gov_services', 'job_seekers', 'job_vacancies', 
  'calls', 'ratings', 'site_visits'
];
tablesToTruncate.forEach(tbl => {
  sql += `TRUNCATE TABLE \`${tbl}\`;\n`;
});
sql += `\n`;

function escapeString(str) {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') return str;
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function toJsonStr(val) {
  if (val === null || val === undefined) return '[]';
  if (Array.isArray(val) || typeof val === 'object') {
    return escapeString(JSON.stringify(val));
  }
  return escapeString(val);
}

// 1. Captains
if (data.captains && Array.isArray(data.captains)) {
  data.captains.forEach(c => {
    if (!c || !c.id) return;
    sql += `INSERT INTO captains (id, name, description, phone, whatsApp, avatar, isAvailable, tripsCount, serviceTypes) VALUES ('${c.id}', '${escapeString(c.name)}', '${escapeString(c.description)}', '${escapeString(c.phone)}', '${escapeString(c.whatsApp)}', '${escapeString(c.avatar)}', ${c.isAvailable === false ? 0 : 1}, ${parseInt(c.tripsCount) || 0}, '${toJsonStr(c.serviceTypes || [])}');\n`;
  });
}

// 2. Doctor Categories
if (data.doctor_categories && Array.isArray(data.doctor_categories)) {
  data.doctor_categories.forEach(dc => {
    if (!dc || !dc.id) return;
    sql += `INSERT INTO doctor_categories (id, name, icon) VALUES ('${dc.id}', '${escapeString(dc.name)}', '${escapeString(dc.icon)}');\n`;
  });
}

// 3. Doctors
if (data.doctors && Array.isArray(data.doctors)) {
  data.doctors.forEach(d => {
    if (!d || !d.id) return;
    sql += `INSERT INTO doctors (id, name, specialty, specialtyId, phone, address, workingDays, workingHours) VALUES ('${d.id}', '${escapeString(d.name)}', '${escapeString(d.specialty)}', '${escapeString(d.specialtyId)}', '${escapeString(d.phone)}', '${escapeString(d.address)}', '${escapeString(d.workingDays)}', '${toJsonStr(d.workingHours)}');\n`;
  });
}

// 4. Restaurant Categories
if (data.restaurant_categories && Array.isArray(data.restaurant_categories)) {
  data.restaurant_categories.forEach(rc => {
    if (!rc || !rc.id) return;
    sql += `INSERT INTO restaurant_categories (id, name, icon) VALUES ('${rc.id}', '${escapeString(rc.name)}', '${escapeString(rc.icon)}');\n`;
  });
}

// 5. Restaurants
if (data.restaurants && Array.isArray(data.restaurants)) {
  data.restaurants.forEach(r => {
    if (!r || !r.id) return;
    sql += `INSERT INTO restaurants (id, name, category, description, logo, phones, whatsApp, deliveryFee, address, workingHours, menuImages) VALUES ('${r.id}', '${escapeString(r.name)}', '${escapeString(r.category)}', '${escapeString(r.description)}', '${escapeString(r.logo)}', '${toJsonStr(r.phones || [])}', '${escapeString(r.whatsApp)}', '${escapeString(r.deliveryFee)}', '${escapeString(r.address)}', '${toJsonStr(r.workingHours)}', '${toJsonStr(r.menuImages || [])}');\n`;
  });
}

// 6. Supermarkets
if (data.supermarkets && Array.isArray(data.supermarkets)) {
  data.supermarkets.forEach(s => {
    if (!s || !s.id) return;
    sql += `INSERT INTO supermarkets (id, name, logo, phones, whatsApp, address, workingHours, menuImages) VALUES ('${s.id}', '${escapeString(s.name)}', '${escapeString(s.logo)}', '${toJsonStr(s.phones || [])}', '${escapeString(s.whatsApp)}', '${escapeString(s.address)}', '${toJsonStr(s.workingHours)}', '${toJsonStr(s.menuImages || [])}');\n`;
  });
}

// 7. Pharmacies
if (data.pharmacies && Array.isArray(data.pharmacies)) {
  data.pharmacies.forEach(p => {
    if (!p || !p.id) return;
    sql += `INSERT INTO pharmacies (id, name, phone, whatsApp, address) VALUES ('${p.id}', '${escapeString(p.name)}', '${escapeString(p.phone)}', '${escapeString(p.whatsApp)}', '${escapeString(p.address)}');\n`;
  });
}

// 8. Gov Services
if (data.gov_services && Array.isArray(data.gov_services)) {
  data.gov_services.forEach(g => {
    if (!g || !g.id) return;
    sql += `INSERT INTO gov_services (id, name, number) VALUES ('${g.id}', '${escapeString(g.name)}', '${escapeString(g.number)}');\n`;
  });
}

// 9. Job Seekers
if (data.job_seekers && Array.isArray(data.job_seekers)) {
  data.job_seekers.forEach(js => {
    if (!js || !js.id) return;
    sql += `INSERT INTO job_seekers (id, name, jobTitle, phone, experience, education) VALUES ('${js.id}', '${escapeString(js.name)}', '${escapeString(js.jobTitle)}', '${escapeString(js.phone)}', '${escapeString(js.experience)}', '${escapeString(js.education)}');\n`;
  });
}

// 10. Job Vacancies
if (data.job_vacancies && Array.isArray(data.job_vacancies)) {
  data.job_vacancies.forEach(jv => {
    if (!jv || !jv.id) return;
    sql += `INSERT INTO job_vacancies (id, title, company, phone, requirements, salary) VALUES ('${jv.id}', '${escapeString(jv.title)}', '${escapeString(jv.company)}', '${escapeString(jv.phone)}', '${escapeString(jv.requirements)}', '${escapeString(jv.salary)}');\n`;
  });
}

// 11. Calls (من calls و restaurant_calls و trips)
if (data.calls) {
  for (const [category, entities] of Object.entries(data.calls)) {
    if (typeof entities === 'object' && entities !== null) {
      for (const [entityId, val] of Object.entries(entities)) {
        let count = 0;
        if (typeof val === 'number') count = val;
        else if (val && typeof val === 'object' && val.total) count = val.total;
        sql += `INSERT INTO calls (entity_category, entity_id, call_count) VALUES ('${escapeString(category)}', '${escapeString(entityId)}', ${count}) ON DUPLICATE KEY UPDATE call_count = ${count};\n`;
      }
    }
  }
}

if (data.restaurant_calls) {
  for (const [resId, val] of Object.entries(data.restaurant_calls)) {
    let count = 0;
    if (typeof val === 'number') count = val;
    else if (val && typeof val === 'object') count = val.total || 0;
    sql += `INSERT INTO calls (entity_category, entity_id, call_count) VALUES ('restaurants', '${escapeString(resId)}', ${count}) ON DUPLICATE KEY UPDATE call_count = ${count};\n`;
  }
}

if (data.trips) {
  for (const [captainId, val] of Object.entries(data.trips)) {
    let count = parseInt(val) || 0;
    sql += `INSERT INTO calls (entity_category, entity_id, call_count) VALUES ('trips', '${escapeString(captainId)}', ${count}) ON DUPLICATE KEY UPDATE call_count = ${count};\n`;
  }
}

// 12. Ratings
if (data.ratings) {
  for (const [resId, val] of Object.entries(data.ratings)) {
    if (val && typeof val === 'object') {
      const sum = parseFloat(val.sum) || 0;
      const count = parseInt(val.count) || 0;
      sql += `INSERT INTO ratings (entity_category, entity_id, rating_score, rating_count) VALUES ('restaurants', '${escapeString(resId)}', ${sum}, ${count}) ON DUPLICATE KEY UPDATE rating_score = ${sum}, rating_count = ${count};\n`;
    }
  }
}

// 13. Site Visits
if (data.site_visits && data.site_visits.daily) {
  for (const [date, count] of Object.entries(data.site_visits.daily)) {
    const visitsCount = parseInt(count) || 0;
    sql += `INSERT INTO site_visits (date, visits_count) VALUES ('${escapeString(date)}', ${visitsCount}) ON DUPLICATE KEY UPDATE visits_count = ${visitsCount};\n`;
  }
}

sql += `\nCOMMIT;\n`;

fs.writeFileSync(outputFile, sql, 'utf-8');
console.log(`Generated SQL file successfully: ${outputFile}`);
