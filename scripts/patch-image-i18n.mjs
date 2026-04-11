/**
 * Patches both en.json and ar.json with Image Engine specific signal, checklist and verdict keys.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else if (!(key in target)) {
      target[key] = source[key];
    }
  }
  return target;
}

const enPatch = {
  AiInspector: {
    image: {
      verdict_likely_ai: "Likely AI Generated",
      verdict_possibly_ai: "Possibly AI Generated",
      verdict_likely_edited: "Likely Human / Edited",
      verdict_likely_human: "Likely Human Photo",

      signal_smooth_texture_name: "Unnaturally smooth texture / skin",
      signal_smooth_texture_desc: "AI images lack camera sensor noise; skin in AI portraits is airbrushed-perfect.",
      signal_low_sat_name: "Low saturation variance",
      signal_low_sat_desc: "Human photos have chaotic, uneven colour across regions — AI flattens it.",
      signal_symmetry_name: "Suspicious bilateral symmetry",
      signal_symmetry_desc: "AI faces and compositions trend toward near-perfect symmetry — real life doesn't.",
      signal_uniform_color_name: "Over-uniform color distribution",
      signal_uniform_color_desc: "Real photos have varied R/G/B distribution; AI flattens it uniformly.",
      signal_uniform_lighting_name: "Unnaturally uniform lighting",
      signal_uniform_lighting_desc: "Real scenes have uneven light (shadows, reflections, highlights). AI lighting is studio-perfect.",
      signal_bg_separation_name: "Artificial subject / background separation",
      signal_bg_separation_desc: "AI aggressively isolates subjects from backgrounds with unnatural bokeh-like blur.",
      signal_blurred_edges_name: "Blurred / dissolving edge detail",
      signal_blurred_edges_desc: "Hair edges, fingers, background transitions — AI smears fine detail.",
      signal_ai_aspect_ratio_name: "Suspicious common AI aspect ratio",
      signal_ai_aspect_ratio_desc: "Midjourney, DALL-E, Stable Diffusion default to specific ratios.",
      signal_round_mp_name: "Suspiciously round megapixel count",
      signal_round_mp_desc: "AI generators output exact round megapixel counts — cameras don't.",
      signal_no_exif_name: "No EXIF / camera metadata",
      signal_no_exif_desc: "Real camera photos embed EXIF data, making files larger relative to resolution.",
      signal_vibrant_palette_name: "Synthetic / Vibrant color palette",
      signal_vibrant_palette_desc: "AI models often default to vibrant, high-contrast 'Instagram-style' color mapping.",
      signal_uniform_focus_name: "Suspiciously uniform edge focus",
      signal_uniform_focus_desc: "Real lenses have focus falloff; AI often sharpens the entire frame uniformly.",
      signal_biometric_anomalies_name: "Biometric / Anatomy anomalies",
      signal_biometric_anomalies_desc: "Detected impossible anatomy or structural biological errors.",
      signal_garbled_text_name: "Garbled / Unreadable text artifacts",
      signal_garbled_text_desc: "Presence of nonsensical or distorted text patterns.",
      signal_ai_watermark_name: "Identified AI signature / Watermark",
      signal_ai_watermark_desc: "Found hardcoded pixel patterns matching AI generator signatures.",

      check_noise_label: "Natural sensor noise present",
      check_noise_note: "Noise: {val} (>=16 = real camera)",
      check_skin_label: "Skin texture has imperfection",
      check_skin_note: "Skin smoothness: {val}% (<=82% = natural)",
      check_lighting_label: "Uneven lighting across scene",
      check_lighting_note: "Zone contrast variance: {val}",
      check_edge_label: "Natural edge detail at periphery",
      check_edge_note: "Background blur ratio: {val}%",
      check_symmetry_label: "Asymmetric composition",
      check_symmetry_note: "Symmetry: {val}%",
      check_saturation_label: "Rich saturation variance",
      check_saturation_note: "Sat variance: {val}",
      check_sharpness_label: "Sharp fine detail",
      check_sharpness_note: "Edge sharpness: {val}"
    }
  }
};

const arPatch = {
  AiInspector: {
    image: {
      verdict_likely_ai: "ذكاء اصطناعي محتمل جداً",
      verdict_possibly_ai: "احتمال وجود ذكاء اصطناعي",
      verdict_likely_edited: "بشري غالباً / معدل",
      verdict_likely_human: "صورة بشرية حقيقية",

      signal_smooth_texture_name: "ملمس / بشرة ناعمة بشكل غير طبيعي",
      signal_smooth_texture_desc: "صور الذكاء الاصطناعي تفتقر لضجيج المستشعر؛ البشرة تبدو مثالية بشكل مبالغ فيه.",
      signal_low_sat_name: "تباين تشبع منخفض",
      signal_low_sat_desc: "الصور البشرية لها ألوان عشوائية وغير متساوية - الذكاء الاصطناعي يسويها.",
      signal_symmetry_name: "تماثل ثنائي مريب",
      signal_symmetry_desc: "الوجوه والتكوينات في الذكاء الاصطناعي تميل للتماثل المثالي - الحياة الواقعية عكس ذلك.",
      signal_uniform_color_name: "توزيع لوني موحد للغاية",
      signal_uniform_color_desc: "الصور الحقيقية لها توزيع R/G/B متنوع؛ الذكاء الاصطناعي يسطحه بشكل موحد.",
      signal_uniform_lighting_name: "إضاءة موحدة بشكل غير طبيعي",
      signal_uniform_lighting_desc: "المشاهد الحقيقية لها إضاءة غير متساوية. إضاءة الذكاء الاصطناعي تبدو مثالية كإضاءة الاستوديو.",
      signal_bg_separation_name: "عزل اصطناعي بين الهدف والخلفية",
      signal_bg_separation_desc: "الذكاء الاصطناعي يعزل الأهداف بقوة مع ضبابية خلفية غير طبيعية.",
      signal_blurred_edges_name: "تفاصيل حواف ضبابية / ذائبة",
      signal_blurred_edges_desc: "حواف الشعر، الأصابع، انتقالات الخلفية - الذكاء الاصطناعي يشوه التفاصيل الدقيقة.",
      signal_ai_aspect_ratio_name: "نسبة عرض إلى ارتفاع شائعة للذكاء الاصطناعي",
      signal_ai_aspect_ratio_desc: "النماذج الافتراضية لـ Midjourney و DALL-E تستخدم نسباً محددة.",
      signal_round_mp_name: "عدد ميجابكسل دائري بشكل مثير للريبة",
      signal_round_mp_desc: "مولدات الذكاء الاصطناعي تخرج أرقام ميجابكسل دقيقة - الكاميرات لا تفعل ذلك.",
      signal_no_exif_name: "لا توجد بيانات EXIF / كاميرا",
      signal_no_exif_desc: "صور الكاميرا الحقيقية تحتوي بيانات EXIF تجعل الملفات أكبر بالنسبة للدقة.",
      signal_vibrant_palette_name: "لوحة ألوان اصطناعية / نابضة",
      signal_vibrant_palette_desc: "نماذج الذكاء الاصطناعي تميل لألوان عالية التباين على طراز 'إنستغرام'.",
      signal_uniform_focus_name: "تركيز حواف موحد بشكل مريب",
      signal_uniform_focus_desc: "العدسات الحقيقية لها تلاشي تركيز؛ الذكاء الاصطناعي غالباً ما يوضح الإطار بالكامل.",
      signal_biometric_anomalies_name: "تشوهات حيوية / تشريحية",
      signal_biometric_anomalies_desc: "تم اكتشاف تشريح مستحيل أو أخطاء بيولوجية هيكلية.",
      signal_garbled_text_name: "تشوهات نصية غير مقروءة",
      signal_garbled_text_desc: "وجود أنماط نصية غير منطقية أو مشوهة.",
      signal_ai_watermark_name: "علامة مائية / توقيع ذكاء اصطناعي معروف",
      signal_ai_watermark_desc: "تم العثور على أنماط بكسل تطابق توقيعات مولدات الذكاء الاصطناعي.",

      check_noise_label: "ضجيج المستشعر الطبيعي موجود",
      check_noise_note: "مستوى الضجيج: {val} (>=16 = كاميرا حقيقية)",
      check_skin_label: "نسيج الجلد يحتوي على عيوب",
      check_skin_note: "نعومة البشرة: {val}% (<=82% = طبيعي)",
      check_lighting_label: "إضاءة غير متساوية في المشهد",
      check_lighting_note: "تباين الإضاءة في المنطقة: {val}",
      check_edge_label: "تفاصيل حواف طبيعية عند الأطراف",
      check_edge_note: "نسبة ضبابية الخلفية: {val}%",
      check_symmetry_label: "تكوين غير متماثل",
      check_symmetry_note: "التماثل: {val}%",
      check_saturation_label: "تباين تشبع غني",
      check_saturation_note: "تباين التشبع: {val}",
      check_sharpness_label: "تفاصيل دقيقة حادة",
      check_sharpness_note: "حدة الحواف: {val}"
    }
  }
};

for (const [lang, patch] of [['en', enPatch], ['ar', arPatch]]) {
  const filePath = resolve(root, 'messages', `${lang}.json`);
  const json = JSON.parse(readFileSync(filePath, 'utf8'));
  deepMerge(json, patch);
  writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`✅ Patched ${lang}.json for advanced image forensics keys`);
}
