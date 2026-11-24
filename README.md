# Super Jack — em busca de Jean

Jogo de plataforma em pixel art com 5 fases: ajude Jack a atravessar os campos, a masmorra,
o mundo digital e a cidade anime até chegar ao castelo onde Jean, o amor da sua vida, o espera.

## Fases

1. **Os Campos** — fase de aprendizado.
2. **A Masmorra** — escura, com tochas, espinhos e morcegos.
3. **Mundo Digital** — chuva de dados, monstrinhos digitais e vírus voadores.
4. **Cidade Anime** — pôr do sol, portais torii, pétalas de cerejeira e lanternas assombradas.
5. **O Castelo de Jean** — o final ♥

## Como jogar

- **Setas / WASD**: andar
- **↑ / W / Espaço**: pular (segure para pular mais alto)
- **P / Esc**: pausar · **M**: som · **Enter**: começar
- No celular aparecem botões na tela.

Pule em cima dos inimigos, pegue moedas, bata nos blocos `?` e nos blocos de coração (+1 vida).
Cada fase tem checkpoint e tempo limite; o tempo que sobrar vira bônus. O recorde e as fases
liberadas ficam salvos no navegador.

## Desenvolvimento

```sh
bun install
bun run dev
```

## Deploy na Vercel

O projeto já tem `vercel.json`: basta importar o repositório na Vercel. O build roda
`NITRO_PRESET=vercel bun run build`, que gera `.vercel/output` (Build Output API).

Projeto criado com [Lovable](https://lovable.dev).
