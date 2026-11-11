#!/bin/zsh
# Генерация фото для сайта через Codex imagegen (скилл codex): промт передаётся дословно. Запуск: ./run.sh <имя> "<пропорции>" "<промт>"
export PATH=$HOME/.local/node/bin:$HOME/.local/bin:$PATH
name=$1; ratio=$2; prompt=$3
codex exec -m gpt-5.6-luna -c model_reasoning_effort=low -s workspace-write --skip-git-repo-check -C "$PWD" -o "$name.log" "Сгенерируй одно изображение встроенным imagegen. Пропорции: $ratio.
Скопируй текст между маркерами в imagegen дословно, символ в символ. Не перефразируй, не сокращай, не дополняй, не «улучшай».

=== НАЧАЛО ПРОМТА ===
$prompt
=== КОНЕЦ ПРОМТА ===

Сохрани результат как $PWD/$name.png. API-ключи и scripts/image_gen.py не используй. Затем приведи точную строку, которую передал в imagegen." < /dev/null > "$name.out" 2>&1
ls -la "$name.png" 2>&1
