const fs = require('fs');
const file = 'src/components/media-pulse/DashboardGrid.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const pulseStart = lines.findIndex(l => l.includes('{/* Emotional Pulse Section */}'));
const automateAlertsStart = lines.findIndex((l, idx) => l.includes('<motion.div') && lines[idx+1] && lines[idx+1].includes('whileHover={{ scale: 1.02 }}'));
console.log('pulseStart', pulseStart);
console.log('automateAlertsStart', automateAlertsStart);

const geoEnd = automateAlertsStart - 1; // Empty line before motion.div
console.log('geoEnd', geoEnd);

const toMove = lines.slice(pulseStart, geoEnd + 1);

lines.splice(pulseStart, toMove.length);

const sidebarStart = lines.findIndex(l => l.includes('{/* Sidebar / Stats */}'));
console.log('sidebarStart', sidebarStart);

const geoStartIdxTarget = toMove.findIndex(l => l.includes('{/* Geographic Reach — proper card with ranked bars */}'));

const pulseAndTrend = toMove.slice(0, geoStartIdxTarget);
const geoReach = toMove.slice(geoStartIdxTarget);

const newGridStart = [
  '                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">'
];
const newGridEnd = [
  '                </div>',
  ''
];

const insertedLines = [
  ...newGridStart,
  ...pulseAndTrend,
  ...newGridEnd,
  ...geoReach
];

lines.splice(sidebarStart - 1, 0, ...insertedLines);

fs.writeFileSync(file, lines.join('\n'));
console.log('Done!');
