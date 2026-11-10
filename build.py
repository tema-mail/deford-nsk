# Сборка: прототип главной (kit.css внутрь <style>) + страница разбора → site/, затем тёмная тема (tema.py падает, если страница без темы)
import pathlib, shutil, subprocess, sys
root = pathlib.Path(__file__).parent
kit = (pathlib.Path.home() / '.claude/skills/marketolog/prototip/kit.css').read_text()
out = root / 'site'
shutil.rmtree(out, ignore_errors=True)
out.mkdir()
glav = root / 'src' / 'glavnaya.html'
if glav.exists():
    (out / 'index.html').write_text(glav.read_text().replace('/*KIT*/', kit))
    for extra in (root / 'src').glob('*.json'):
        shutil.copy(extra, out / extra.name)
shutil.copytree(root / 'razbor', out / 'razbor')
(out / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
r = subprocess.run([sys.executable, '-I', str(root / 'tema.py')])
if r.returncode:
    sys.exit('тема не встала')
print('ok', sorted(str(x.relative_to(out)) for x in out.rglob('*') if x.is_file()))
