# CallAqui
Chat acadêmico inspirado no Discord. Node.js, Express, HTTP e Socket.io.

## Local
Execute `npm install` e `npm start`. Abra http://localhost:3000 em duas abas e entre com apelidos diferentes. Envie mensagens e troque de canal para testar.

## GitHub e Render
Crie um repositório no GitHub e envie os arquivos desta pasta (sem node_modules). No Render, crie um Web Service conectado ao repositório, runtime Node, Build Command `npm ci`, Start Command `npm start`. Abra a URL fornecida pelo Render e compartilhe com a turma.

## Limitações
Demonstração sem autenticação: qualquer pessoa com o link pode entrar. Use apelidos e mensagens fictícias. Histórico de até 100 mensagens por canal em memória, perdido ao reiniciar. Não inclui mensagens privadas ou chamadas de voz.

## Perfil e grupos
Clique no avatar no rodapé para escolher, salvar ou remover uma foto. A foto fica no navegador e é compartilhada com os usuários conectados. Use uma imagem não sensível. Clique em + junto aos canais para criar um grupo público. Grupos e mensagens ficam em memória e são perdidos quando o servidor reinicia. Mensagens antigas conservam o avatar do momento do envio.
