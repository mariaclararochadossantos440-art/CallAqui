const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
const canais = ['geral', 'bate-papo', 'projetos', 'avisos'];
const usuarios = new Map();
const historico = Object.create(null);
function fotoValida(foto) { return typeof foto === "string" && foto.length <= 180000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(foto); }
canais.forEach(canal => historico[canal] = []);
function online() { io.emit('usuarios', Array.from(usuarios.values())); }
io.on('connection', socket => {
  socket.on('entrar', (nome, foto) => {
    if (typeof nome !== 'string' || !nome.trim() || nome.length > 30 || usuarios.has(socket.id)) return;
    usuarios.set(socket.id, {id: socket.id, nome: nome.trim(), foto: fotoValida(foto) ? foto : ""});
    socket.emit("grupos", canais);
    socket.join('geral'); socket.data.canal = 'geral';
    socket.emit('canal', {canal: 'geral', mensagens: historico.geral});
    io.emit('aviso', nome.trim() + ' entrou no CallAqui.'); online();
  });
  socket.on('editar foto', foto => {
    if (!usuarios.has(socket.id) || (foto !== '' && !fotoValida(foto))) return;
    usuarios.get(socket.id).foto = foto;
    online();
  });
  socket.on('criar grupo', (nome, resposta) => {
    if (typeof resposta !== 'function') return;
    if (!usuarios.has(socket.id) || typeof nome !== 'string') return resposta({erro:'Entre no chat primeiro.'});
    const grupo = nome.trim().toLowerCase().replace(/\s+/g, '-');
    if (!/^[\p{L}\p{N}_-]{1,30}$/u.test(grupo) || canais.includes(grupo) || canais.length >= 50) return resposta({erro:'Nome inválido, repetido ou limite de grupos atingido.'});
    canais.push(grupo); historico[grupo] = [];
    io.emit('grupos', canais); resposta({grupo});
  });
  socket.on('trocar canal', canal => {
    if (!usuarios.has(socket.id) || !canais.includes(canal)) return;
    socket.leave(socket.data.canal); socket.join(canal); socket.data.canal = canal;
    socket.emit('canal', {canal, mensagens: historico[canal]});
  });
  socket.on('chat message', data => {
    if (!usuarios.has(socket.id) || typeof data?.mensagem !== 'string') return;
    const mensagem = data.mensagem.trim();
    if (!mensagem || mensagem.length > 1000) return;
    const canal = socket.data.canal;
    const dados = {nome: usuarios.get(socket.id).nome, foto: usuarios.get(socket.id).foto, mensagem, canal, hora: new Date().toISOString()};
    historico[canal].push(dados); if (historico[canal].length > 100) historico[canal].shift();
    io.to(canal).emit('chat message', dados);
  });
  socket.on('disconnect', () => {
    if (!usuarios.has(socket.id)) return;
    const nome = usuarios.get(socket.id).nome; usuarios.delete(socket.id);
    io.emit('aviso', nome + ' saiu do CallAqui.'); online();
  });
});
const porta = process.env.PORT || 3000;
http.listen(porta, '0.0.0.0', () => console.log('CallAqui: http://localhost:' + porta));
