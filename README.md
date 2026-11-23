# CONRAD Virtual School — Mobile

Aplicativo mobile do CONRAD, feito com **React Native + Expo (SDK 52) + Expo Router 4**.
Ele usa o **mesmo back-end e o mesmo banco** da versão Web (`JS/server.js`, `turmas.js`,
`atividades.js`, `medias.js` e `chat.js`): não há servidor, autenticação nem regras de negócio
próprios no app.

> A documentação completa (Web + Mobile) está em `DOCUMENTACAO_TECNICA_E_GUIA_DE_ESTUDO_WEB_MOBILE.md`.

## Como rodar

```bash
npm install
npx expo start        # abra no Expo Go (celular) ou pressione "a" (Android) / "i" (iOS)
npm run check         # verificação estática: imports, telas registradas e chamadas de API
npm run check -- ../Conrad--main   # idem + confere cada rota de src/api.js contra o servidor Web
```

## Endereço da API

`src/api.js` escolhe o servidor nesta ordem:

1. variável `EXPO_PUBLIC_API_URL` (ex.: `http://10.0.2.2:3000` no emulador Android);
2. campo `extra.apiUrl` do `app.json`;
3. em desenvolvimento: o IP da máquina que serve o Expo, na porta `3000` (celular físico na mesma rede Wi-Fi);
4. produção: `https://conrad.onrender.com` (a mesma de `JS/config.js` e `JS/auth.js` do Web).

> Correção: versões antigas deste README citavam `conrad-virtual-school.onrender.com`, que não existe no código.

Para testar localmente, rode o servidor Web (`npm start` na pasta do Web, porta 3000) e abra o app
no mesmo Wi-Fi. No emulador Android use `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`.

## Estrutura

```text
app/        telas e rotas (Expo Router: um arquivo = uma rota)
src/        api.js, AuthContext.js, ThemeContext.js, theme.js, format.js, components/, ui/, data/
assets/     ícone, splash e imagens
scripts/    check.js (verificação estática)
```

Veja a seção 4 do documento unificado para o detalhamento de cada arquivo.
