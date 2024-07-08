# bnpm

`bnpm build` - применяет npm run build ко всем пакетам в корневой папке.

`bnpm install` - применяет npm i ко всем пакетам в корневой папке.

`bnpm version` - применяет npm version ко всем пакетам в корневой папке.

`bnpm pack` - применяет npm pack ко всем пакетам в корневой папке.

По умолчанию в качестве корневого каталога используется `./npm`. Для иземенения корневого католога исполльзуйте env переменную `NPM_PATH`.

Пример: `"npm:install": "cross-env NPM_PATH=custom_dir bnpm-build install"`