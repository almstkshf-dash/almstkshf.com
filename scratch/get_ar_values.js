const fs = require('fs');

try {
    const ar = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));
    
    console.log('CaseStudies.styling.form.success:', ar.CaseStudies?.styling?.form?.success);
    console.log('Contact.button:', ar.Contact?.button);
    console.log('MediaPulseDetail.dashboard_grid.positive_sent:', ar.MediaPulseDetail?.dashboard_grid?.positive_sent);
    console.log('MediaPulseDetail.dashboard_grid.top_topics:', ar.MediaPulseDetail?.dashboard_grid?.top_topics);

} catch (e) {
    console.error('Error parsing JSON:', e.message);
}
