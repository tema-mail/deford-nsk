# Сборка: прототипы (kit.css внутрь <style>) + разбор → site/, оглавление прототипов /karta/, затем тёмная тема (tema.py падает без неё)
# Главная – src/glavnaya.html → site/index.html; остальные – src/pages/<адрес>/index.html → site/<адрес>/index.html (json рядом копируется)
import html, pathlib, re, shutil, subprocess, sys
root = pathlib.Path(__file__).parent
kit = (pathlib.Path.home() / '.claude/skills/marketolog/prototip/kit.css').read_text()
out = root / 'site'
shutil.rmtree(out, ignore_errors=True)
out.mkdir()
pages = []

def put(src, dst, adres):
    text = src.read_text()
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(text.replace('/*KIT*/', kit))
    for extra in src.parent.glob('*.json'):
        shutil.copy(extra, dst.parent / extra.name)
    m = re.search(r'<title>(.*?)</title>', text, re.S)
    pages.append((adres, m.group(1).strip() if m else adres))

glav = root / 'src' / 'glavnaya.html'
if glav.exists():
    put(glav, out / 'index.html', '/')
for src in sorted((root / 'src' / 'pages').rglob('index.html')):
    rel = src.parent.relative_to(root / 'src' / 'pages')
    put(src, out / rel / 'index.html', f'/{rel.as_posix()}/')

shutil.copytree(root / 'razbor', out / 'razbor')
# Дизайн (Astro, web/) → site/design/ – до оглавления, чтобы попал в /karta/
import os
env = dict(os.environ, PATH=str(pathlib.Path.home() / '.local/node/bin') + os.pathsep + os.environ.get('PATH', ''))
if subprocess.run(['npm', 'run', 'build'], cwd=root / 'web', env=env).returncode:
    sys.exit('сборка дизайна упала')
design = []
for f in sorted((out / 'design').rglob('index.html')):
    m = re.search(r'<title>(.*?)</title>', f.read_text(), re.S)
    design.append(('/design/' + f.parent.relative_to(out / 'design').as_posix() + '/', html.unescape(m.group(1)) if m else ''))
drows = '\n'.join(f'<li><a href="..{a}">{html.escape(a)}</a> – {html.escape(t)}</li>' for a, t in design)
rows = '\n'.join(f'<li><a href="..{a}">{html.escape(a)}</a> – {html.escape(t)}</li>' for a, t in pages)
(out / 'karta').mkdir()
(out / 'karta' / 'index.html').write_text(f'''<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Прототипы страниц – Дефорд Новосибирск</title>
<style>:root{{--bg:#fff;--fg:#141414;--mut:#666}}body{{background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif;margin:0;padding:24px 16px}}
main{{max-width:760px;margin:0 auto}}a{{color:inherit}}li{{margin:6px 0}}p{{color:var(--mut)}}</style></head><body><main>
<h1>Прототипы страниц</h1><p>Чёрно-белые прототипы для согласования. Логика страниц – docs/marketing/2026-11-11-logika-stranic.md. Разбор донора – <a href="../razbor/">/razbor/</a>.</p>
<h2>Дизайн</h2><p>Страницы в дизайне по концепции plastcor.ru, цвета deford-studio.ru.</p>
<ul>
{drows}
</ul>
<h2>Прототипы</h2>
<ul>
{rows}
</ul></main></body></html>''')
(out / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
r = subprocess.run([sys.executable, '-I', str(root / 'tema.py')])
if r.returncode:
    sys.exit('тема не встала')
print('ok', len(pages), 'страниц:', ', '.join(a for a, _ in pages))
