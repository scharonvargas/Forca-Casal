# Forca Casal

codex/add-readme.md-with-project-documentation

 codex/add-test-runner-and-example-test
This project contains a client built with Vite and a Node.js server.

## Running Tests

Install dependencies then run:

```bash
npm test
```

This uses [Vitest](https://vitest.dev/) to run unit tests located under the `client` directory.
=======

Jogo da forca voltado para casais. Utiliza React + Vite no frontend e Express no backend.

## Requisitos
- **Node.js** 20 ou superior
- **npm** 9 ou superior (instalado junto com o Node)

## Comandos principais
- `npm run dev` &mdash; inicia o servidor de desenvolvimento com recarregamento automático.
- `npm run build` &mdash; gera a versão de produção do cliente e do servidor.
- `./build.sh` &mdash; reorganiza a pasta `dist/` após o build para facilitar o deploy.

Para um build completo execute:

```bash
npm run build && ./build.sh
```

## Modos de jogo
- **Solo** &mdash; palavras aleatórias e castigos quando o jogador perde.
- **Casal** &mdash; um parceiro escolhe a palavra secreta enquanto o outro tenta adivinhar. A cada rodada os papéis se alternam e o placar é mantido.

## Variáveis de ambiente
- `DATABASE_URL` &mdash; string de conexão com o PostgreSQL usada pelo Drizzle.
- `PORT` &mdash; porta utilizada pelo Express (`5000` por padrão).
- `NODE_ENV` &mdash; define o modo de execução (`development` ou `production`).
- `VITE_ADMIN_PASSWORD` &mdash; senha para acessar o painel administrativo no frontend.

codex/add-readme.md-with-project-documentation
main
