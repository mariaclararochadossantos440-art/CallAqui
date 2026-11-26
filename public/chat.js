const socket = io();
const $ = id => document.getElementById(id);
let nome = '', canal = 'geral', foto = '', pendente = '';
try { foto = localStorage.getItem('callaqui-foto') || ''; } catch(e) {} 
const cores = ['#5865f2','#9b59b6','#168b83','#b66b35','#c34e79'];
function avatar(n, foto) { const a = document.createElement('div'); a.className = 'avatar'; a.textContent = n.slice(0,2).toUpperCase(); a.style.background = cores[n.charCodeAt(0)%cores.length]; aplicarFoto(a,n,foto); return a; }
function rolar(){ $('feed').scrollTop = $('feed').scrollHeight; }
function aviso(texto){ const li = document.createElement('li'); li.className = 'notice'; li.textContent = '• '+texto; $('mensagens').appendChild(li); rolar(); }
function mostrar(dados){ const li = document.createElement('li'); li.className='message'; li.appendChild(avatar(dados.nome,dados.foto)); const div=document.createElement('div'); const b=document.createElement('b'); b.textContent=dados.nome; const time=document.createElement('time'); time.textContent=new Date(dados.hora).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); const p=document.createElement('p'); p.textContent=dados.mensagem; div.append(b,time,p); li.appendChild(div); $('mensagens').appendChild(li); rolar(); }
$('login').addEventListener('submit', event => {event.preventDefault(); const valor=$('nome').value.trim(); if(!valor || !socket.connected) return; nome=valor; $('me').textContent=nome; aplicarFoto($('meAvatar'),nome,foto); socket.emit('entrar',nome,foto); $('entrada').hidden=true; $('mensagem').focus();});
$('chat').addEventListener('submit', event => {event.preventDefault(); const mensagem=$('mensagem').value.trim(); if(!nome || !mensagem || !socket.connected) return; socket.emit('chat message',{mensagem}); $('mensagem').value=''; $('mensagem').focus();});
document.querySelectorAll('.channel').forEach(botao=>botao.onclick=()=>{if(nome && socket.connected) socket.emit('trocar canal',botao.dataset.canal);});
socket.on('canal', dados=>{canal=dados.canal; $('titulo').textContent='# '+canal; $('welcome').textContent='Bem-vindo ao #'+canal+'!'; $('mensagem').placeholder='Conversar em #'+canal; $('mensagens').replaceChildren(); document.querySelectorAll('.channel').forEach(b=>b.classList.toggle('active',b.dataset.canal===canal)); dados.mensagens.forEach(mostrar);});
socket.on('chat message', dados=>{if(dados.canal===canal) mostrar(dados);});
socket.on('aviso', texto=>{if(nome) aviso(texto);});
socket.on('usuarios', usuarios=>{$('count').textContent=usuarios.length; $('usuarios').replaceChildren(); usuarios.forEach(u=>{const li=document.createElement('li'); const a=avatar(u.nome,u.foto); a.classList.add('online'); const span=document.createElement('span'); span.textContent=u.nome+(u.id===socket.id?' (você)':''); li.append(a,span); $('usuarios').appendChild(li);});});
socket.on('connect',()=>{$('status').textContent='Disponível'; $('erro').textContent=''; if(nome){socket.emit('entrar',nome,foto); if(canal!=='geral') socket.emit('trocar canal',canal);}});
socket.on('disconnect',()=>{$('status').textContent='Desconectado'; $('erro').textContent='Conexão perdida. Reconectando…';});
$('sair').onclick=()=>location.reload();

function aplicarFoto(el,n,f) {
  el.textContent=n.slice(0,2).toUpperCase();
  if(f && /^data:image\/(jpeg|png|webp);base64,/.test(f)) { const img=document.createElement('img'); img.src=f; img.alt=''; el.replaceChildren(img); }
}
$('meAvatar').onclick=()=>{if(!nome)return; pendente=foto; aplicarFoto($('preview'),nome,foto); $('arquivoFoto').value=''; $('fotoErro').textContent=''; $('perfil').showModal();};
$('arquivoFoto').onchange=()=>{
  const arquivo=$('arquivoFoto').files[0]; if(!arquivo)return;
  if(!['image/jpeg','image/png','image/webp'].includes(arquivo.type)||arquivo.size>10000000){$('fotoErro').textContent='Escolha JPG, PNG ou WebP de até 10 MB.';return;}
  const url=URL.createObjectURL(arquivo), img=new Image(); $('salvarFoto').disabled=true;
  img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const lado=Math.min(img.width,img.height);canvas.getContext('2d').drawImage(img,(img.width-lado)/2,(img.height-lado)/2,lado,lado,0,0,128,128);pendente=canvas.toDataURL('image/jpeg',0.85);aplicarFoto($('preview'),nome,pendente);URL.revokeObjectURL(url);$('salvarFoto').disabled=false;$('fotoErro').textContent='';};
  img.onerror=()=>{URL.revokeObjectURL(url);$('salvarFoto').disabled=false;$('fotoErro').textContent='Não foi possível abrir a imagem.';};img.src=url;
};
function salvarPerfil(f){foto=f;try{localStorage.setItem('callaqui-foto',foto);}catch(e){} aplicarFoto($('meAvatar'),nome,foto);socket.emit('editar foto',foto);$('perfil').close();}
$('salvarFoto').onclick=()=>salvarPerfil(pendente);
$('removerFoto').onclick=()=>salvarPerfil('');
$('novoGrupo').onclick=()=>{if(!nome)return;$('grupoNome').value='';$('grupoErro').textContent='';$('grupoDialog').showModal();};
$('cancelarGrupo').onclick=()=>$('grupoDialog').close();
$('grupoForm').onsubmit=e=>{e.preventDefault();if(!socket.connected){$('grupoErro').textContent='Sem conexão.';return;}socket.timeout(5000).emit('criar grupo',$('grupoNome').value,(erro,r)=>{if(erro||r.erro){$('grupoErro').textContent=erro?'Servidor não respondeu.':r.erro;return;}$('grupoDialog').close();socket.emit('trocar canal',r.grupo);});};
socket.on('grupos',grupos=>{$('listaCanais').replaceChildren();grupos.forEach(g=>{const b=document.createElement('button');b.className='channel';b.classList.toggle('active',g===canal);b.dataset.canal=g;b.textContent='# ';const span=document.createElement('span');span.textContent=g;b.appendChild(span);b.onclick=()=>{if(nome&&socket.connected)socket.emit('trocar canal',g);};$('listaCanais').appendChild(b);});});
