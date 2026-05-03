from pathlib import Path
import re
root = Path('.')
pattern = re.compile(r'<input\b[^>]*>', re.IGNORECASE)
missing = []
for p in root.rglob('*.*'):
    if p.suffix.lower() not in {'.tsx', '.ts', '.jsx', '.js', '.html', '.mdx'}:
        continue
    try:
        text = p.read_text(encoding='utf-8')
    except Exception:
        continue
    for m in pattern.finditer(text):
        tag = m.group(0)
        if 'name=' not in tag and 'id=' not in tag and ('autocomplete' in tag.lower() or 'autoComplete' in tag):
            missing.append((p, tag))
print('FOUND', len(missing))
for p, tag in missing:
    print(p)
    print(tag)
    print('---')
