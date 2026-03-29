import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, 'messages', 'en.json');
const arPath = path.join(__dirname, 'messages', 'ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

en.Export = {
  "sheet_name": "Coverage Report",
  "date": "Date",
  "title": "Title",
  "url": "URL",
  "type": "Type",
  "source": "Source",
  "depth": "Depth",
  "country": "Country",
  "sentiment": "Sentiment",
  "reach": "Reach",
  "ave": "AVE ($)",
  "brand_name": "ALMSTKSHF",
  "brand_tagline": "Media Monitoring & Development",
  "footer_url": "www.almstkshf.com",
  "generated_at": "Generated: {date}",
  "page_count": "Page {current} / {total}",
  "report_title": "Media Coverage Report",
  "summary_title": "Executive Summary",
  "sentiment_title": "Sentiment Distribution",
  "ai_recommendation": "AI Recommendation",
  "total_reach": "TOTAL REACH",
  "ad_value": "AD VALUE (AVE)",
  "total_articles": "TOTAL ARTICLES",
  "keyword_label": "Keyword",
  "region_label": "Region",
  "langs_label": "Languages",
  "coverage_log": "Coverage Log",
  "rec_high_neg": "High negative sentiment detected. Recommend activating crisis management protocols immediately.",
  "rec_mod_neg": "Moderate negative coverage. Monitor closely and prepare proactive messaging.",
  "rec_healthy": "Coverage sentiment is healthy. Continue current media strategy."
};

ar.Export = {
  "sheet_name": "تقرير التغطية",
  "date": "التاريخ",
  "title": "العنوان",
  "url": "الرابط",
  "type": "النوع",
  "source": "المصدر",
  "depth": "العمق",
  "country": "الدولة",
  "sentiment": "النبرة",
  "reach": "الوصول",
  "ave": "القيمة الإعلانية ($)",
  "brand_name": "المستكشف",
  "brand_tagline": "رصد وتطوير الإعلام",
  "footer_url": "www.almstkshf.com",
  "generated_at": "تاريخ الإصدار: {date}",
  "page_count": "صفحة {current} / {total}",
  "report_title": "تقرير التغطية الإعلامية",
  "summary_title": "الملخص التنفيذي",
  "sentiment_title": "توزيع النبرة",
  "ai_recommendation": "توصية الذكاء الاصطناعي",
  "total_reach": "إجمالي الوصول",
  "ad_value": "القيمة الإعلانية (AVE)",
  "total_articles": "إجمالي المقالات",
  "keyword_label": "الكلمة المفتاحية",
  "region_label": "المنطقة",
  "langs_label": "اللغات",
  "coverage_log": "سجل التغطية",
  "rec_high_neg": "تم اكتشاف نبرة سلبية عالية. نوصي بتفعيل بروتوكولات إدارة الأزمات فوراً.",
  "rec_mod_neg": "تغطية سلبية متوسطة. راقب عن كثب وقم بإعداد رسائل استباقية.",
  "rec_healthy": "نبرة التغطية صحية. استمر في الاستراتيجية الإعلامية الحالية."
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');

console.log('Localization files updated successfully.');
