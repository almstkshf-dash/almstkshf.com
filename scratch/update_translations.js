const fs = require('fs');

const pathEn = 'messages/en.json';
const dataEn = JSON.parse(fs.readFileSync(pathEn, 'utf8'));
dataEn.PressReleasePanel.existing_keyword_matches = "All {count} matching articles for \"{keyword}\" are already saved in your database.";
dataEn.PressReleasePanel.sync_success_already_ingested = "Sync complete. All {count} matching articles were already saved in your database.";
dataEn.PressReleasePanel.feed_saved_only = "+{saved}";
dataEn.PressReleasePanel.feed_saved_with_total = "+{saved} ({total} found)";
fs.writeFileSync(pathEn, JSON.stringify(dataEn, null, 2), 'utf8');

const pathAr = 'messages/ar.json';
const dataAr = JSON.parse(fs.readFileSync(pathAr, 'utf8'));
dataAr.PressReleasePanel.existing_keyword_matches = "جميع المقالات المطابقة الـ {count} لـ «{keyword}» محفوظة بالفعل في قاعدة البيانات.";
dataAr.PressReleasePanel.sync_success_already_ingested = "اكتملت المزامنة. جميع المقالات المطابقة الـ {count} محفوظة بالفعل في قاعدة البيانات.";
dataAr.PressReleasePanel.feed_saved_only = "+{saved}";
dataAr.PressReleasePanel.feed_saved_with_total = "+{saved} ({total} مطابقة)";
fs.writeFileSync(pathAr, JSON.stringify(dataAr, null, 2), 'utf8');

console.log('Successfully updated translation files.');
