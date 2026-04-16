const fs = require('fs');

try {
    const ar = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));
    const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));

    const arGrid = ar.MediaPulseDetail.dashboard_grid;
    const enGrid = en.MediaPulseDetail.dashboard_grid;

    console.log('AR dashboard_grid Keys:', Object.keys(arGrid));
    console.log('EN dashboard_grid Keys:', Object.keys(enGrid));

} catch (e) {
    console.error('Error parsing JSON:', e.message);
}
