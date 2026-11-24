# CONRAD Virtual School — Mobile

Aplicativo mobile e web do CONRAD, feito com **React Native + Expo SDK 52 + Expo Router 4**.
O app Mobile usa o mesmo backend e o mesmo banco de dados PostgreSQL/Supabase da versão Web.

## Pré-requisitos

- Node.js 18 ou mais recente
- npm
- Backend Web na pasta irmã `Conrad-` (necessário para testes locais)
- Arquivo `.env` configurado dentro da pasta `Conrad-`
- Celular e computador na mesma rede Wi-Fi, somente para testar pelo Expo Go

O projeto não contém o backend dentro da pasta Mobile. A entrada do backend é:

```text
..\Conrad-\JS\server.js
```

## Instalação do projeto Mobile

Abra o terminal na pasta do projeto:

```powershell
cd "$env:USERPROFILE\Conrad-Mobile"
npm install
```

## Como iniciar o servidor local

Abra o primeiro terminal:

```powershell
cd "$env:USERPROFILE\Conrad-"
npm start
```

O backend deve mostrar mensagens semelhantes a:

```text
Servidor rodando na porta 3000
Conectado ao banco de dados PostgreSQL/Supabase.
```

Teste o servidor em outro terminal:

```powershell
curl.exe -i http://localhost:3000/health
curl.exe -i http://localhost:3000/me
```

A rota `/health` deve retornar:

```json
{"status":"ok"}
```

A rota `/me` pode retornar `401` com `{"logado":false}` antes do login. Isso é normal.

## Como iniciar o app Mobile

Abra um segundo terminal:

```powershell
cd "$env:USERPROFILE\Conrad-Mobile"
$env:EXPO_PUBLIC_API_URL = "http://localhost:3000"
npx expo start --web --clear
```

Abra a aplicação web em:

```text
http://localhost:8081
```

Se a política do PowerShell bloquear `npx`, use `cmd`:

```powershell
cd "$env:USERPROFILE\Conrad-Mobile"
cmd /d /c "set EXPO_PUBLIC_API_URL=http://localhost:3000&& npx expo start --web --clear"
```

Também é possível autorizar scripts npm e npx para o usuário atual:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Testar no celular físico

Descubra o endereço IP da máquina no Windows:

```powershell
ipconfig
```

Em um terminal da pasta Mobile, use o IP encontrado:

```powershell
$env:EXPO_PUBLIC_API_URL="http://SEU_IP:3000"
npx expo start --clear
```

Exemplo:

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.0.10:3000"
```

Abra o projeto com Expo Go no celular. Computador e celular precisam estar na mesma rede Wi-Fi.

## Testar no computador usando o backend de produção

O app roda no computador, mas as chamadas de API vão para o Render. Pare qualquer Expo antigo com `Ctrl+C`, abra um terminal na pasta Mobile e defina a URL antes de iniciar:

```powershell
cd "$env:USERPROFILE\Conrad-Mobile"
$env:EXPO_PUBLIC_API_URL = "https://conrad.onrender.com"
npx expo start --web --clear
```

Abra o endereço mostrado pelo Expo, normalmente `http://localhost:8081`. O backend do Render precisa permitir essa origem CORS. A correção precisa estar publicada no serviço antes de atualizar a página. O primeiro acesso ao Render pode demorar até cerca de um minuto.

## Usar o servidor de produção em builds instalados

Sem `EXPO_PUBLIC_API_URL`, um build Expo de produção utiliza:

```text
https://conrad.onrender.com
```

No Render, a primeira requisição pode demorar até cerca de 1 minuto enquanto o servidor acorda.

## CORS no navegador

O navegador bloqueia chamadas entre `http://localhost:8081` e `https://conrad.onrender.com` se o backend não devolver os cabeçalhos CORS corretos. O servidor deve permitir a origem exata e credenciais de sessão; não use `*` com cookies. A lista fica em `JS/server.js` do repositório `Conrad-`.

Se o Expo escolher outra porta, confira a origem mostrada no console do navegador. A porta precisa estar na lista CORS do backend e a alteração precisa ser implantada no Render. Após o deploy, faça recarga forçada com `Ctrl+Shift+R`.

Teste o preflight no PowerShell:

```powershell
curl.exe -i -X OPTIONS "https://conrad.onrender.com/login" -H "Origin: http://localhost:8081" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type"
```

O resultado esperado contém HTTP `204`, `Access-Control-Allow-Origin: http://localhost:8081` e `Access-Control-Allow-Credentials: true`.

## Teste manual de cadastro e login

1. Inicie o backend local ou escolha explicitamente o endereço do Render com `EXPO_PUBLIC_API_URL`.
2. Abra o endereço indicado pelo Expo, normalmente `http://localhost:8081`.
3. Clique em **Criar conta**.
4. Informe nome, e-mail válido, senha com pelo menos 6 caracteres e tipo de usuário.
5. Clique em **Criar conta**.
6. Confirme o redirecionamento para o painel do aluno ou educador.
7. Execute **Sair** e tente entrar novamente com o mesmo e-mail e senha.

Se aparecer erro, confira a causa correspondente:

| Sintoma | O que conferir |
|---|---|
| Erro CORS / `No 'Access-Control-Allow-Origin' header` | A origem e porta do navegador estão em `listOrigins` no backend e o commit já foi implantado no Render. |
| `401` em `/me` antes do login | Normal sem sessão; faça login. |
| Erro ao conectar com `localhost:3000` | Inicie o backend local na pasta `Conrad-` ou aponte `EXPO_PUBLIC_API_URL` para o Render. |
| Primeira chamada ao Render demora | Aguarde o serviço acordar (até cerca de um minuto) e tente novamente. |
| Assistente retorna `503` | Confira `GEMINI_API_KEY` e `GEMINI_MODEL` nas variáveis do backend/Render. |

Não coloque `DB_*`, `GEMINI_API_KEY` ou outras credenciais no Mobile nem em variáveis `EXPO_PUBLIC_*`; elas devem ficar no backend ou no Render.

## Testar o Assistente de IA

1. Entre com uma conta de aluno ou educador.
2. Abra o cartão **Assistente de IA** no painel ou o item **Assistente de IA** em **Mais**.
3. Para aluno, experimente “Quantas atividades tenho para entregar?” ou “Quais aulas tenho hoje?”.
4. Para educador, experimente “Quais são as minhas turmas?”.

Use uma conta que tenha dados relevantes para validar as consultas ao banco. Uma conta nova pode receber uma resposta indicando que ainda não há atividades ou turmas. O assistente exige sessão válida; sem login, `/api/agente` retorna `401`.

## Teste rápido pela API

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
Invoke-RestMethod -Uri "http://localhost:3000/me" -Method Get
```

O login pode ser testado com JSON válido:

```powershell
$body = @{ email = "seu-email@teste.com"; senha = "SuaSenha123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/login" -Method Post -ContentType "application/json" -Body $body
```

## Endereço da API

`src/api.js` escolhe o servidor nesta ordem:

1. `EXPO_PUBLIC_API_URL`;
2. campo `extra.apiUrl` do `app.json`;
3. em desenvolvimento, o IP detectado pelo Expo e a porta `3000`;
4. em produção, `https://conrad.onrender.com`.

## Estrutura

```text
app/        Telas e rotas do Expo Router
src/        API, autenticação, temas, componentes e dados
assets/     Imagens e ícones
server      Backend externo em ..\Conrad-\JS\server.js
```

## Para distribuir o app para outras pessoas

Por padrão, builds de produção usam `https://conrad.onrender.com`. Assim, qualquer pessoa pode acessar o mesmo backend e o mesmo banco sem configurar o IP do seu computador.

Para desenvolvimento local, use opcionalmente:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://SEU_IP:3000"
npx expo start --clear
```

Login e cadastro continuam compartilhando o banco do Render. Cada usuário recebe sua própria sessão pelo cookie `conrad.sid`.
