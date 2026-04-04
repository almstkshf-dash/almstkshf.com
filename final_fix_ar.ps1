$arPath = 'c:\Users\ceo\OneDrive\Desktop\projects\almstkshf.com\almstkshf.com\messages\ar.json'
$arContent = Get-Content $arPath -Raw
# Check if Reports already exists
if ($arContent -notmatch '"Reports":') {
    # Remove the last two characters (presumably "}\n}")
    $arContent = $arContent.Trim().Substring(0, $arContent.Trim().Length - 1).Trim()
    # If the last char is '}', we need to close Chatbot properly if it wasn't
    if ($arContent -match '}\s*$') {
        $arContent += ","
    }
    $newSection = @"

  "Reports": {
    "pr_title": "تقرير تغطية البيان الصحفي",
    "deep_title": "تقييم مخاطر الشبكة العميقة",
    "osint_title": "الملف الفني للاستخبارات مفتوحة المصدر",
    "summary": "ملخص المقاييس",
    "total_reach": "إجمالي الوصول",
    "total_ave": "القيمة الإعلانية (AVE)",
    "article_count": "إجمالي المقالات",
    "coverage_details": "تفاصيل التغطية",
    "ingestion_logs": "نشاط الاستيعاب (آخر 10 عمليات)",
    "identified_threats": "التهديدات المحددة عالية المخاطر",
    "investigation_target": "هدف التحقيق",
    "technical_details": "السمات الفنية",
    "entity_map": "الكيانات والارتباطات المحددة",
    "investigation_type": "نوع التحقيق",
    "attribute": "السمة",
    "value": "القيمة",
    "entity_name": "اسم الكيان",
    "entity_type": "النوع",
    "relevance": "الأهمية",
    "generated_at": "تاريخ الإنشاء",
    "data_points": "إجمالي نقاط البيانات",
    "col_date": "التاريخ",
    "col_title": "العنوان",
    "col_source": "المصدر",
    "col_reach": "الوصول",
    "col_ave": "AVE ($)",
    "col_status": "الحالة",
    "col_time": "الطابع الزمني",
    "col_count": "المقالات",
    "col_sentiment": "الانطباع",
    "export_pdf": "تصدير PDF",
    "export_excel": "تصدير Excel",
    "export_dossier": "تصدير الملف"
  }
}
"@
    Set-Content -Path $arPath -Value ($arContent + $newSection) -Force
    Write-Output "Successfully updated ar.json"
} else {
    Write-Output "Reports section already exists in ar.json"
}
