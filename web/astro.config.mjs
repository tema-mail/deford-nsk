// Дизайн сайта Дефорда (концепция plastcor.ru, цвета deford-studio.ru). Стенд: /deford-nsk/design/ на Pages.
// Сборка кладёт результат в ../site/design – его выкладывает тот же workflow, что и прототипы.
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://tema-mail.github.io',
  base: '/deford-nsk/design',
  outDir: '../site/design',
  trailingSlash: 'always',
  integrations: [preact()],
  build: { assets: '_a' },
});
