const reshaper = require('arabic-persian-reshaper');

const isArabic = (text) => {
    return /[\u0600-\u06FF]/.test(text);
};

const fixArabicForPDF = (text) => {
    if (!text || !isArabic(text)) return text;
    
    if (text.includes('\n')) {
        return text.split('\n').map(line => fixArabicForPDF(line)).join('\n');
    }
    
    const shaped = reshaper.ArabicShaper.convertArabic(text);
    const words = shaped.split(/(\s+)/);
    
    const processedWords = words.map((w) => {
        if (!/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(w)) {
            return w;
        }
        
        // Split word into Arabic and non-Arabic segments
        const segments = w.split(/([\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/);
        const processedSegments = segments.map((seg) => {
            if (/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(seg)) {
                return seg.split('').reverse().join('');
            }
            
            // For non-Arabic (numbers/punctuation), swap brackets
            let cleanSeg = '';
            for (let i = 0; i < seg.length; i++) {
                const char = seg[i];
                if (char === '(') cleanSeg += ')';
                else if (char === ')') cleanSeg += '(';
                else if (char === '[') cleanSeg += ']';
                else if (char === ']') cleanSeg += '[';
                else if (char === '{') cleanSeg += '}';
                else if (char === '}') cleanSeg += '{';
                else if (char === '<') cleanSeg += '>';
                else if (char === '>') cleanSeg += '<';
                else cleanSeg += char;
            }
            return cleanSeg;
        });
        
        return processedSegments.reverse().join('');
    });
    
    return processedWords.reverse().join('');
};

const testText = '"تحقيق أمنية" تطلق الدورة الـ15 من "سوق أمنيات عيد الأضحى"';
console.log("Original:", testText);
console.log("Processed:", fixArabicForPDF(testText));
