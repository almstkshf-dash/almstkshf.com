import { readFileSync, writeFileSync } from 'fs';

// Fix en.json
const enRaw = readFileSync('./messages/en.json', 'utf8');
const en = JSON.parse(enRaw);
if (!en.Dashboard.investigation_engine) {
  en.Dashboard.investigation_engine = 'Investigation Engine';
  writeFileSync('./messages/en.json', JSON.stringify(en, null, 2), 'utf8');
  console.log('✅ Added investigation_engine to en.json');
} else {
  console.log('ℹ️  investigation_engine already exists in en.json:', en.Dashboard.investigation_engine);
}

// Fix ar.json
const arRaw = readFileSync('./messages/ar.json', 'utf8');
const ar = JSON.parse(arRaw);
if (!ar.Dashboard.investigation_engine) {
  ar.Dashboard.investigation_engine = 'محرك التحقيق';
  writeFileSync('./messages/ar.json', JSON.stringify(ar, null, 2), 'utf8');
  console.log('✅ Added investigation_engine to ar.json');
} else {
  console.log('ℹ️  investigation_engine already exists in ar.json:', ar.Dashboard.investigation_engine);
}
