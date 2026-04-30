const fs = require('fs');

const filePath = 'c:/Users/ceo/OneDrive/Desktop/projects/almstkshf.com/almstkshf.com/src/lib/engines/textEngine.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = {
    'Ù„Ø§ ØªØªØ±Ø¯Ø¯ Ù ÙŠ': 'لا تتردد في',
    'Ø¥Ù† ÙƒØ§Ù† Ù„Ø¯ÙŠÙƒ Ø£ÙŠ Ø§Ø³ØªÙ Ø³Ø§Ø±': 'إن كان لديك أي استفسار',
    'Ù†Ø£Ù…Ù„ Ø£Ù† ÙŠÙƒÙˆÙ† Ù‡Ø°Ø§ Ù…Ù ÙŠØ¯Ø§Ù‹': 'نأمل أن يكون هذا مفيداً',
    'Ù†ØÙ† Ù‡Ù†Ø§ Ù„Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©': 'نحن هنا للمساعدة',
    'Ù…Ø´ Ø¹Ø§Ø±Ù ': 'مش عارف',
    'ÙˆØ§Ù„Ù„Ù‡': 'والله',
    'Ø§Ù„Ù„ÙŠ Ù Ø§Øª Ù…Ø§Øª': 'اللي فات مات',
    'ÙŠØ¹Ù†ÙŠ': 'يعني',
    'Ø£ÙˆÙ„Ø§Ù‹': 'أولاً',
    'Ø«Ø§Ù†ÙŠØ§Ù‹': 'ثانياً',
    'Ø«Ø§Ù„Ø«Ø§Ù‹': 'ثالثاً',
    'ØŸ': '؟',
    'ØŒ': '،',
    'â€“': '–',
    'â€”': '—',
};

for (const [k, v] of Object.entries(replacements)) {
    content = content.split(k).join(v);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done replacing.');
