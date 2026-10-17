const STORAGE_KEY = 'tarefas';
let tarefas = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const $ = id => document.getElementById(id);
const isNative = () => window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();

function localNotifications() {
  return window.Capacitor?.Plugins?.LocalNotifications;
}

async function prepararNotificacoes() {
  if (!isNative()) {
    $('status').textContent = 'No navegador, o alerta com o app fechado não é garantido. No Android instalado, use as notificações locais.';
    return;
  }
  const LN = localNotifications();
  if (!LN) return;
  let perm = await LN.checkPermissions();
  if (perm.display !== 'granted') perm = await LN.requestPermissions();
  $('status').textContent = perm.display === 'granted'
    ? '🔔 Alertas Android ativados.'
    : '⚠️ Permita notificações para receber os alarmes.';
}

async function agendarAlarme(tarefa) {
  if (!isNative()) return;
  const LN = localNotifications();
  if (!LN) return;
  const quando = new Date(`${tarefa.data}T${tarefa.hora}:00`);
  await LN.schedule({
    notifications: [{
      id: tarefa.id,
      title: '⏰ Hora da tarefa!',
      body: tarefa.texto,
      schedule: { at: quando, allowWhileIdle: true },
      sound: 'beep.wav',
      extra: { tarefaId: tarefa.id }
    }]
  });
}

async function cancelarAlarme(id) {
  if (!isNative()) return;
  const LN = localNotifications();
  if (!LN) return;
  try { await LN.cancel({ notifications: [{ id }] }); } catch (_) {}
}

async function adicionarTarefa() {
  const texto = $('tarefa').value.trim();
  const data = $('data').value;
  const hora = $('hora').value;
  if (!texto) return alert('Digite uma tarefa.');
  if (!data) return alert('Escolha uma data.');
  if (!hora) return alert('Escolha um horário.');

  const quando = new Date(`${data}T${hora}:00`);
  if (quando.getTime() <= Date.now()) return alert('Escolha uma data e horário futuros.');

  // IDs de notificações Android precisam ser inteiros de 32 bits.
  let id = Math.floor(Date.now() % 2000000000);
  while (tarefas.some(t => t.id === id)) id++;
  const tarefa = { id, texto, data, hora, concluida: false };
  tarefas.push(tarefa);
  salvar();

  try {
    await agendarAlarme(tarefa);
    $('status').textContent = isNative() ? '✅ Tarefa e alarme agendados.' : '✅ Tarefa salva.';
  } catch (e) {
    console.error(e);
    $('status').textContent = '⚠️ Tarefa salva, mas não foi possível agendar a notificação.';
  }

  $('tarefa').value = '';
  $('data').value = '';
  $('hora').value = '';
  $('tarefa').focus();
}

function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
  mostrarTarefas();
}

async function concluirTarefa(id) {
  const tarefa = tarefas.find(t => t.id === id);
  if (!tarefa) return;
  tarefa.concluida = !tarefa.concluida;
  if (tarefa.concluida) await cancelarAlarme(id);
  else if (new Date(`${tarefa.data}T${tarefa.hora}:00`) > new Date()) await agendarAlarme(tarefa);
  salvar();
}

async function removerTarefa(id) {
  if (!confirm('Deseja realmente remover esta tarefa?')) return;
  await cancelarAlarme(id);
  tarefas = tarefas.filter(t => t.id !== id);
  salvar();
}

function formatarData(data) {
  const [a,m,d] = data.split('-');
  return `${d}/${m}/${a}`;
}

function mostrarTarefas() {
  const lista = $('listaTarefas');
  lista.innerHTML = '';
  $('contador').textContent = `${tarefas.length} ${tarefas.length === 1 ? 'tarefa' : 'tarefas'}`;
  if (!tarefas.length) {
    lista.innerHTML = '<div class="vazio">📭 Nenhuma tarefa adicionada.</div>';
    return;
  }
  tarefas.sort((a,b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`));
  for (const tarefa of tarefas) {
    const card = document.createElement('article');
    card.className = 'tarefa';
    if (tarefa.concluida) card.classList.add('concluida');
    if (!tarefa.concluida && new Date(`${tarefa.data}T${tarefa.hora}`) < new Date()) card.classList.add('vencida');

    const info = document.createElement('div'); info.className = 'tarefa-info';
    const h3 = document.createElement('h3'); h3.textContent = (tarefa.concluida ? '✅ ' : '') + tarefa.texto;
    const p = document.createElement('p'); p.textContent = `📅 ${formatarData(tarefa.data)}  ⏰ ${tarefa.hora}`;
    info.append(h3,p);

    const botoes = document.createElement('div'); botoes.className = 'botoes';
    const concluir = document.createElement('button'); concluir.className='btn-concluir'; concluir.textContent=tarefa.concluida?'↩️ Desmarcar':'✔ Concluída'; concluir.onclick=()=>concluirTarefa(tarefa.id);
    const remover = document.createElement('button'); remover.className='btn-remover'; remover.textContent='🗑 Remover'; remover.onclick=()=>removerTarefa(tarefa.id);
    botoes.append(concluir,remover); card.append(info,botoes); lista.append(card);
  }
}

$('btnAdicionar').addEventListener('click', adicionarTarefa);
$('tarefa').addEventListener('keydown', e => { if (e.key === 'Enter') adicionarTarefa(); });
mostrarTarefas();
prepararNotificacoes();
