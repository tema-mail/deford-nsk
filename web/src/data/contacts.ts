// Контакты Дефорда – одно место для всех страниц. WhatsApp не используем (правило владельца).
export const C = {
  tel: '+79537777891', telText: '+7 953 777-78-91',
  tg: 'https://t.me/Artem1Galimov',
  max: 'https://max.ru/u/f9LHodD0cOKS6C3PPXRh8eHyRKrJiSTUcpsOsnbQDl6Cp3LSE-Xu-dNig7c',
  vk: 'https://vk.ru/deford_studio',
  vkVideo: (id: string) => `https://vk.ru/video-126157776_${id}`,
};
// Базовый путь стенда и прототипы, которые ещё не в дизайне
export const B = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const P = '/deford-nsk/';
