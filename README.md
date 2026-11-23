# CONRAD Virtual School — Mobile

Aplicativo mobile e web do CONRAD, feito com **React Native + Expo SDK 52 + Expo Router 4**.
O app Mobile usa o mesmo backend e o mesmo banco de dados PostgreSQL/Supabase da versão Web.

## Pré-requisitos

- Node.js 18 ou mais recente
- npm
- Backend Web instalado em `C:\Users\danilo58359996\Conrad-`
- Arquivo `.env` configurado dentro da pasta `Conrad-`
- Celular e computador na mesma rede Wi-Fi, somente para testar pelo Expo Go

O projeto não contém o backend dentro da pasta Mobile. A entrada do backend é:

```text
C:\Users\danilo58359996\Conrad-\JS\server.js
```

## Instalação do projeto Mobile

Abra o terminal na pasta do projeto:

```powershell
cd C:\Users\danilo58359996\Conrad-Mobile
npm install
```

## Como iniciar o servidor local

Abra o primeiro terminal:

```powershell
cd C:\Users\danilo58359996\Conrad-
node JS/server.js
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
cd C:\Users\danilo58359996\Conrad-Mobile
$env:EXPO_PUBLIC_API_URL="http://localhost:3000"
npx expo start --web --clear
```

Abra a aplicação web em:

```text
http://localhost:8081
```

Se a política do PowerShell bloquear `npx`, use `cmd`:

```powershell
cd C:\Users\danilo58359996\Conrad-Mobile
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

## Usar o servidor de produção

Sem `EXPO_PUBLIC_API_URL`, no modo Expo de produção o app utiliza:

```text
https://conrad.onrender.com
```

No Render, a primeira requisição pode demorar até cerca de 1 minuto enquanto o servidor acorda.

## Teste manual de cadastro e login

1. Abra `http://localhost:8081`.
2. Clique em **Criar conta**.
3. Informe nome, e-mail válido, senha com pelo menos 6 caracteres e tipo de usuário.
4. Clique em **Criar conta**.
5. Confirme o redirecionamento para o painel do aluno ou educador.
6. Execute **Sair** e tente entrar novamente com o mesmo e-mail e senha.

Se aparecer `Erro ao conectar com o servidor`, confirme:

- O backend está rodando na porta `3000`.
- `EXPO_PUBLIC_API_URL` aponta para `http://localhost:3000`.
- O navegador foi recarregado sem cache: `Ctrl+Shift+R`.
- O backend permite a origem `http://localhost:8081` nas configurações CORS.
- As credenciais do banco estão corretas no `.env` da pasta `Conrad-`.

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
server      Backend externo em C:\Users\danilo58359996\Conrad-\JS\server.js
```

## Para distribuir o app para outras pessoas

Por padrão, builds de produção usam `https://conrad.onrender.com`. Assim, qualquer pessoa pode acessar o mesmo backend e o mesmo banco sem configurar o IP do seu computador.

Para desenvolvimento local, use opcionalmente:

```powershell
$env:EXPO_PUBLIC_API_URL="http://SEU_IP:3000"
npx expo start --clear
```

Login e cadastro continuam compartilhando o banco do Render. Cada usuário recebe sua própria sessão pelo cookie `conrad.sid`.
