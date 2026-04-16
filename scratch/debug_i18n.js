const fs = require('fs');

try {
    const ar = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));
    const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));

    console.log('AR Top Level Keys:', Object.keys(ar));
    console.log('EN Top Level Keys:', Object.keys(en));

    // Check MediaPulseDetail specifically
    if (ar.MediaPulseDetail) {
        console.log('AR MediaPulseDetail Keys:', Object.keys(ar.MediaPulseDetail));
    }
    if (en.MediaPulseDetail) {
        console.log('EN MediaPulseDetail Keys:', Object.keys(en.MediaPulseDetail));
    } else {
        console.log('EN MediaPulseDetail is missing');
    }

} catch (e) {
    console.error('Error parsing JSON:', e.message);
}
