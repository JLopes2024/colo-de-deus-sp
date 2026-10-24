
import { useEffect, useMemo, useState } from 'react';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import { auth, db } from '../servicos/firebase.js';

import './admin.css';

// =========================================================
// CONFIGURAÇÃO
// =========================================================

const ADMIN_UID = 'IY48rYU8wDSceya8DsKTPDjRVKF3';

const FORMULARIO_INICIAL = {
  nome_evento: '',
  data_evento: '',
  data_fim_evento: '',
  cidade_evento: '',
  estado_evento: '',
  link_ingresso: '',
};

const CAMPOS_EVENTO = [
  'nome_evento',
  'data_evento',
  'cidade_evento',
  'estado_evento',
  'link_ingresso',
];

const LIMITE_EVENTOS_BACKUP = 400;
const TAMANHO_MAXIMO_BACKUP = 2 * 1024 * 1024;

// =========================================================
// VALIDAÇÕES E BACKUP
// =========================================================

function validarData(data) {
  if (
    typeof data !== 'string'
    || !/^\d{4}-\d{2}-\d{2}$/.test(data)
  ) {
    return false;
  }

  const dataConvertida = new Date(`${data}T12:00:00Z`);

  return (
    !Number.isNaN(dataConvertida.getTime())
    && dataConvertida.toISOString().slice(0, 10) === data
  );
}

function validarEventoBackup(evento, indice) {
  const numero = indice + 1;

  if (
    !evento
    || typeof evento !== 'object'
    || Array.isArray(evento)
  ) {
    throw new Error(`Evento ${numero}: registro inválido.`);
  }

  const camposObrigatorios = ['id', ...CAMPOS_EVENTO];
  const camposPermitidos = [
    ...camposObrigatorios,
    'data_fim_evento',
  ];
  const camposRecebidos = Object.keys(evento);

  if (
    !camposObrigatorios.every((campo) => (
      Object.prototype.hasOwnProperty.call(evento, campo)
    ))
    || !camposRecebidos.every((campo) => (
      camposPermitidos.includes(campo)
    ))
  ) {
    throw new Error(
      `Evento ${numero}: os campos não correspondem ao formato do backup.`,
    );
  }

  if (
    typeof evento.id !== 'string'
    || !/^[A-Za-z0-9_-]{1,128}$/.test(evento.id)
  ) {
    throw new Error(`Evento ${numero}: ID inválido.`);
  }

  if (
    typeof evento.nome_evento !== 'string'
    || !evento.nome_evento.trim()
    || evento.nome_evento.length > 120
  ) {
    throw new Error(`Evento ${numero}: nome inválido.`);
  }

  if (!validarData(evento.data_evento)) {
    throw new Error(`Evento ${numero}: data inicial inválida.`);
  }

  if (
    Object.prototype.hasOwnProperty.call(
      evento,
      'data_fim_evento',
    )
    && (
      !validarData(evento.data_fim_evento)
      || evento.data_fim_evento < evento.data_evento
    )
  ) {
    throw new Error(`Evento ${numero}: data final inválida.`);
  }

  if (
    typeof evento.cidade_evento !== 'string'
    || !evento.cidade_evento.trim()
    || evento.cidade_evento.length > 100
  ) {
    throw new Error(`Evento ${numero}: cidade inválida.`);
  }

  if (
    typeof evento.estado_evento !== 'string'
    || !/^[A-Z]{2}$/.test(evento.estado_evento)
  ) {
    throw new Error(`Evento ${numero}: UF inválida.`);
  }

  if (
    typeof evento.link_ingresso !== 'string'
    || evento.link_ingresso.length > 2048
  ) {
    throw new Error(`Evento ${numero}: link inválido.`);
  }

  if (evento.link_ingresso) {
    try {
      const url = new URL(evento.link_ingresso);

      if (
        !['http:', 'https:'].includes(url.protocol)
        || /\s/.test(evento.link_ingresso)
        || !url.hostname
      ) {
        throw new Error('Link inválido');
      }
    } catch {
      throw new Error(
        `Evento ${numero}: link de ingresso inválido.`,
      );
    }
  }

  return {
    id: evento.id,
    nome_evento: evento.nome_evento,
    data_evento: evento.data_evento,
    ...(evento.data_fim_evento
      ? { data_fim_evento: evento.data_fim_evento }
      : {}),
    cidade_evento: evento.cidade_evento,
    estado_evento: evento.estado_evento,
    link_ingresso: evento.link_ingresso,
  };
}

function validarArquivoBackup(conteudo) {
  let backup;

  try {
    backup = JSON.parse(conteudo);
  } catch {
    throw new Error('O arquivo não contém um JSON válido.');
  }

  if (
    !backup
    || typeof backup !== 'object'
    || Array.isArray(backup)
    || ![1, 2].includes(backup.versao)
    || backup.colecao !== 'eventos'
    || !Array.isArray(backup.eventos)
  ) {
    throw new Error(
      'Formato de backup incompatível. Selecione um JSON exportado pela Agenda.',
    );
  }

  if (backup.eventos.length === 0) {
    throw new Error('O backup não contém eventos.');
  }

  if (backup.eventos.length > LIMITE_EVENTOS_BACKUP) {
    throw new Error(
      `O limite desta importação é de ${LIMITE_EVENTOS_BACKUP} eventos.`,
    );
  }

  const eventosValidados = backup.eventos.map(
    validarEventoBackup,
  );

  const ids = eventosValidados.map((evento) => evento.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error(
      'O backup contém IDs duplicados. Nenhum evento foi importado.',
    );
  }

  return eventosValidados;
}

function obterDadosEvento(evento) {
  return {
    nome_evento: evento.nome_evento,
    data_evento: evento.data_evento,
    ...(evento.data_fim_evento
      ? { data_fim_evento: evento.data_fim_evento }
      : {}),
    cidade_evento: evento.cidade_evento,
    estado_evento: evento.estado_evento,
    link_ingresso: evento.link_ingresso,
  };
}

// =========================================================
// CONTROLE DE ACESSO
// =========================================================

function AdminApp() {
  const [usuario, setUsuario] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    const cancelarObservacao = onAuthStateChanged(
      auth,
      (usuarioAtual) => {
        setUsuario(usuarioAtual);
        setCarregandoSessao(false);
      },
      (error) => {
        console.error('Erro ao verificar sessão:', error);
        setUsuario(null);
        setCarregandoSessao(false);
      },
    );

    return cancelarObservacao;
  }, []);

  if (carregandoSessao) {
    return (
      <main className="admin admin--centralizado">
        <p role="status">Carregando...</p>
      </main>
    );
  }

  if (!usuario) {
    return <LoginAdmin />;
  }

  if (usuario.uid !== ADMIN_UID) {
    return <AcessoNegado />;
  }

  return <PainelAdmin usuario={usuario} />;
}

// =========================================================
// ACESSO NEGADO
// =========================================================

function AcessoNegado() {
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState('');

  async function sair() {
    setSaindo(true);
    setErro('');

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      setErro('Não foi possível encerrar a sessão.');
    } finally {
      setSaindo(false);
    }
  }

  return (
    <main className="admin admin--centralizado">
      <section
        className="admin-login"
        aria-labelledby="acesso-negado-titulo"
      >
        <p className="admin__indice">
          ADMIN // MISSÃO SP
        </p>

        <h1 id="acesso-negado-titulo">
          Acesso restrito
        </h1>

        <p className="admin-login__apoio">
          Esta conta não possui autorização para
          administrar a Agenda.
        </p>

        {erro && (
          <p
            className="admin__mensagem admin__mensagem--erro"
            role="alert"
          >
            {erro}
          </p>
        )}

        <button
          className="admin-botao admin-botao--principal"
          type="button"
          onClick={sair}
          disabled={saindo}
        >
          {saindo ? 'Saindo...' : 'Sair desta conta'}
        </button>
      </section>
    </main>
  );
}

// =========================================================
// LOGIN
// =========================================================

function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function entrar(evento) {
    evento.preventDefault();

    setEnviando(true);
    setErro('');

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        senha,
      );
    } catch (error) {
      console.error('Erro no login do admin:', error);
      setErro('Não foi possível entrar. Confira e-mail e senha.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="admin admin--centralizado">
      <section
        className="admin-login"
        aria-labelledby="admin-login-titulo"
      >
        <p className="admin__indice">
          ADMIN // MISSÃO SP
        </p>

        <h1 id="admin-login-titulo">
          Agenda
        </h1>

        <p className="admin-login__apoio">
          Acesso restrito para gerenciamento dos eventos.
        </p>

        <form
          className="admin-form"
          onSubmit={entrar}
        >
          <label className="admin-campo">
            <span>E-mail</span>

            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="admin-campo">
            <span>Senha</span>

            <input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>

          {erro && (
            <p
              className="admin__mensagem admin__mensagem--erro"
              role="alert"
            >
              {erro}
            </p>
          )}

          <button
            className="admin-botao admin-botao--principal"
            type="submit"
            disabled={enviando}
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}

// =========================================================
// PAINEL ADMINISTRATIVO
// =========================================================

function PainelAdmin({ usuario }) {
  const [eventos, setEventos] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [eventoEditando, setEventoEditando] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [exportandoBackup, setExportandoBackup] = useState(false);
  const [analisandoBackup, setAnalisandoBackup] = useState(false);
  const [importandoBackup, setImportandoBackup] = useState(false);

  const [previaBackup, setPreviaBackup] = useState(null);

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const [mensagemBackup, setMensagemBackup] = useState('');
  const [erroBackup, setErroBackup] = useState('');

  const hoje = useMemo(() => {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }, []);

  useEffect(() => {
    carregarEventos();
  }, []);

  // =======================================================
  // CARREGAR EVENTOS
  // =======================================================

  async function carregarEventos() {
    setCarregando(true);
    setErro('');

    try {
      const consulta = query(
        collection(db, 'eventos'),
        orderBy('data_evento', 'asc'),
      );

      const resultado = await getDocs(consulta);

      const eventosCarregados = resultado.docs.map(
        (documento) => ({
          id: documento.id,
          ...documento.data(),
        }),
      );

      setEventos(eventosCarregados);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setErro('Não foi possível carregar os eventos.');
      setEventos([]);
    } finally {
      setCarregando(false);
    }
  }

  // =======================================================
  // EXPORTAR BACKUP
  // =======================================================

  async function exportarBackup() {
    if (exportandoBackup || importandoBackup) {
      return;
    }

    setExportandoBackup(true);
    setMensagemBackup('');
    setErroBackup('');

    try {
      const consulta = query(
        collection(db, 'eventos'),
        orderBy('data_evento', 'asc'),
      );

      const resultado = await getDocs(consulta);

      const backup = {
        versao: 2,
        colecao: 'eventos',
        exportado_em: new Date().toISOString(),
        eventos: resultado.docs.map((documento) => ({
          id: documento.id,
          ...obterDadosEvento(documento.data()),
        })),
      };

      const arquivo = new Blob(
        [JSON.stringify(backup, null, 2)],
        {
          type: 'application/json;charset=utf-8',
        },
      );

      const agora = new Date();

      const dataArquivo = [
        agora.getFullYear(),
        String(agora.getMonth() + 1).padStart(2, '0'),
        String(agora.getDate()).padStart(2, '0'),
      ].join('-');

      const urlArquivo = URL.createObjectURL(arquivo);

      const linkDownload = document.createElement('a');

      linkDownload.href = urlArquivo;
      linkDownload.download = `backup-agenda-${dataArquivo}.json`;

      document.body.appendChild(linkDownload);
      linkDownload.click();
      linkDownload.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(urlArquivo);
      }, 1000);

      setMensagemBackup(
        `Backup gerado com ${backup.eventos.length} evento(s). `
        + 'Confira o arquivo na pasta de downloads.',
      );
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      setErroBackup('Não foi possível exportar o backup.');
    } finally {
      setExportandoBackup(false);
    }
  }

  // =======================================================
  // SELECIONAR E VALIDAR BACKUP
  // =======================================================

  async function selecionarBackup(evento) {
    const arquivo = evento.target.files?.[0];

    // Permite selecionar novamente o mesmo arquivo.
    evento.target.value = '';

    setPreviaBackup(null);
    setMensagemBackup('');
    setErroBackup('');

    if (!arquivo) {
      return;
    }

    if (importandoBackup || analisandoBackup) {
      return;
    }

    setAnalisandoBackup(true);

    try {
      if (!arquivo.name.toLowerCase().endsWith('.json')) {
        throw new Error('Selecione um arquivo com extensão .json.');
      }

      if (arquivo.size > TAMANHO_MAXIMO_BACKUP) {
        throw new Error('O arquivo excede o limite de 2 MB.');
      }

      const conteudo = await arquivo.text();
      const eventosBackup = validarArquivoBackup(conteudo);

      // Verifica quais IDs já existem no Firestore.
      const resultado = await getDocs(
        collection(db, 'eventos'),
      );

      const idsExistentes = new Set(
        resultado.docs.map((documento) => documento.id),
      );

      const quantidadeSubstituir = eventosBackup.filter(
        (item) => idsExistentes.has(item.id),
      ).length;

      setPreviaBackup({
        nomeArquivo: arquivo.name,
        eventos: eventosBackup,
        quantidadeCriar:
          eventosBackup.length - quantidadeSubstituir,
        quantidadeSubstituir,
      });

      setMensagemBackup(
        'Arquivo validado. Confira a pré-visualização antes de importar.',
      );
    } catch (error) {
      console.error('Erro ao analisar backup:', error);

      setErroBackup(
        error instanceof Error
          ? error.message
          : 'Não foi possível analisar o arquivo.',
      );
    } finally {
      setAnalisandoBackup(false);
    }
  }

  function cancelarImportacao() {
    if (importandoBackup) {
      return;
    }

    setPreviaBackup(null);
    setMensagemBackup('');
    setErroBackup('');
  }

  // =======================================================
  // IMPORTAR BACKUP
  // =======================================================

  async function importarBackup() {
    if (
      !previaBackup
      || importandoBackup
      || analisandoBackup
    ) {
      return;
    }

    const {
      eventos: eventosBackup,
      quantidadeCriar,
      quantidadeSubstituir,
    } = previaBackup;

    const confirmou = window.confirm(
      'CONFIRMAR RESTAURAÇÃO DA AGENDA\n\n'
      + `${quantidadeCriar} evento(s) serão criados.\n`
      + `${quantidadeSubstituir} evento(s) serão substituídos.\n\n`
      + 'Os eventos existentes com o mesmo ID terão '
      + 'seus dados sobrescritos pelos valores do backup.\n\n'
      + 'Eventos fora do backup NÃO serão excluídos.\n\n'
      + 'Deseja continuar?',
    );

    if (!confirmou) {
      return;
    }

    setImportandoBackup(true);
    setMensagemBackup('');
    setErroBackup('');

    try {
      // Confere novamente o banco antes da gravação.
      const resultadoAtual = await getDocs(
        collection(db, 'eventos'),
      );

      const idsAtuais = new Set(
        resultadoAtual.docs.map((documento) => documento.id),
      );

      const substituirAgora = eventosBackup.filter(
        (item) => idsAtuais.has(item.id),
      ).length;

      if (substituirAgora !== quantidadeSubstituir) {
        throw new Error(
          'A Agenda mudou desde a pré-visualização. '
          + 'Selecione o backup novamente antes de importar.',
        );
      }

      // Uma operação atômica para todos os registros.
      const lote = writeBatch(db);

      for (const item of eventosBackup) {
        const referencia = doc(db, 'eventos', item.id);

        // O ID permanece como ID do documento,
        // não como campo armazenado.
        lote.set(
          referencia,
          obterDadosEvento(item),
        );
      }

      await lote.commit();

      setPreviaBackup(null);

      setMensagemBackup(
        `Restauração concluída: ${quantidadeCriar} criado(s) `
        + `e ${quantidadeSubstituir} substituído(s).`,
      );

      await carregarEventos();
    } catch (error) {
      console.error('Erro ao importar backup:', error);

      setErroBackup(
        error instanceof Error
          ? error.message
          : 'Não foi possível importar o backup.',
      );
    } finally {
      setImportandoBackup(false);
    }
  }

  // =======================================================
  // FORMULÁRIO
  // =======================================================

  function atualizarCampo(nome, valor) {
    setFormulario((atual) => ({
      ...atual,
      [nome]: valor,
    }));
  }

  function iniciarEdicao(evento) {
    setEventoEditando(evento.id);

    setFormulario({
      nome_evento: evento.nome_evento ?? '',
      data_evento: evento.data_evento ?? '',
      data_fim_evento: evento.data_fim_evento ?? '',
      cidade_evento: evento.cidade_evento ?? '',
      estado_evento: evento.estado_evento ?? '',
      link_ingresso: evento.link_ingresso ?? '',
    });

    setMensagem('');
    setErro('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function cancelarEdicao() {
    setEventoEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setMensagem('');
    setErro('');
  }

  // =======================================================
  // VALIDAÇÃO DO FORMULÁRIO
  // =======================================================

  function validarFormulario() {
    const estado = formulario.estado_evento
      .trim()
      .toUpperCase();

    const link = formulario.link_ingresso.trim();

    if (
      !formulario.nome_evento.trim()
      || !formulario.data_evento
      || !formulario.cidade_evento.trim()
      || !estado
    ) {
      return 'Preencha todos os campos obrigatórios.';
    }

    if (!validarData(formulario.data_evento)) {
      return 'Informe uma data inicial válida.';
    }

    if (
      formulario.data_fim_evento
      && (
        !validarData(formulario.data_fim_evento)
        || formulario.data_fim_evento < formulario.data_evento
      )
    ) {
      return 'A data final deve ser válida e não pode ser anterior à inicial.';
    }

    if (!/^[A-Z]{2}$/.test(estado)) {
      return 'O estado deve usar a sigla com 2 letras.';
    }

    if (link) {
      try {
        const url = new URL(link);

        if (
          !['http:', 'https:'].includes(url.protocol)
          || /\s/.test(link)
          || !url.hostname
        ) {
          return 'Informe um link de ingresso válido.';
        }
      } catch {
        return 'Informe um link de ingresso válido.';
      }
    }

    return '';
  }

  // =======================================================
  // CRIAR / EDITAR EVENTO
  // =======================================================

  async function salvarEvento(evento) {
    evento.preventDefault();

    const erroValidacao = validarFormulario();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSalvando(true);
    setMensagem('');
    setErro('');

    const dadosEvento = {
      nome_evento: formulario.nome_evento.trim(),
      data_evento: formulario.data_evento,
      ...(formulario.data_fim_evento
        ? { data_fim_evento: formulario.data_fim_evento }
        : {}),
      cidade_evento: formulario.cidade_evento.trim(),
      estado_evento: formulario.estado_evento
        .trim()
        .toUpperCase(),
      link_ingresso: formulario.link_ingresso.trim(),
    };

    try {
      if (eventoEditando) {
        const referenciaEvento = doc(
          db,
          'eventos',
          eventoEditando,
        );

        await updateDoc(
          referenciaEvento,
          {
            ...dadosEvento,
            ...(!formulario.data_fim_evento
              ? { data_fim_evento: deleteField() }
              : {}),
          },
        );

        setMensagem('Evento atualizado.');
      } else {
        await addDoc(
          collection(db, 'eventos'),
          dadosEvento,
        );

        setMensagem('Evento criado.');
      }

      setEventoEditando(null);
      setFormulario(FORMULARIO_INICIAL);

      await carregarEventos();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      setErro('Não foi possível salvar o evento.');
    } finally {
      setSalvando(false);
    }
  }

  // =======================================================
  // EXCLUIR EVENTO
  // =======================================================

  async function excluirEvento(evento) {
    const confirmou = window.confirm(
      `Excluir definitivamente "${evento.nome_evento}"?`,
    );

    if (!confirmou) {
      return;
    }

    setMensagem('');
    setErro('');

    try {
      await deleteDoc(
        doc(db, 'eventos', evento.id),
      );

      setMensagem('Evento excluído.');

      await carregarEventos();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      setErro('Não foi possível excluir o evento.');
    }
  }

  // =======================================================
  // ENCERRAR SESSÃO
  // =======================================================

  async function sair() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair do admin:', error);
      setErro('Não foi possível encerrar a sessão.');
    }
  }

  // =======================================================
  // INTERFACE
  // =======================================================

  return (
    <main className="admin">
      <header className="admin-topo">
        <div>
          <p className="admin__indice">
            ADMIN // MISSÃO SP
          </p>

          <h1>Agenda</h1>
        </div>

        <div className="admin-topo__acoes">
          <span>{usuario.email}</span>

          <button
            className="admin-botao admin-botao--secundario"
            type="button"
            onClick={sair}
          >
            Sair
          </button>
        </div>
      </header>

      <div className="admin-grid">
        {/* ===============================================
            FORMULÁRIO DE EVENTOS
            =============================================== */}

        <section className="admin-card">
          <div className="admin-card__cabecalho">
            <p className="admin__indice">
              {eventoEditando ? 'EDITAR' : 'NOVO'} // EVENTO
            </p>

            <h2>
              {eventoEditando ? 'Editar evento' : 'Nova data'}
            </h2>
          </div>

          <form
            className="admin-form"
            onSubmit={salvarEvento}
          >
            <label className="admin-campo">
              <span>Nome do evento *</span>

              <input
                type="text"
                maxLength="120"
                value={formulario.nome_evento}
                onChange={(e) => (
                  atualizarCampo('nome_evento', e.target.value)
                )}
                required
              />
            </label>

            <div className="admin-form__linha">
              <label className="admin-campo">
                <span>Data inicial *</span>

                <input
                  type="date"
                  value={formulario.data_evento}
                  onChange={(e) => (
                    atualizarCampo('data_evento', e.target.value)
                  )}
                  required
                />
              </label>

              <label className="admin-campo">
                <span>Data final (opcional)</span>

                <input
                  type="date"
                  min={formulario.data_evento || undefined}
                  value={formulario.data_fim_evento}
                  onChange={(e) => (
                    atualizarCampo(
                      'data_fim_evento',
                      e.target.value,
                    )
                  )}
                />

                <small>
                  Preencha apenas se o evento durar
                  mais de um dia.
                </small>
              </label>
            </div>

            <div className="admin-form__linha">
              <label className="admin-campo">
                <span>Cidade *</span>

                <input
                  type="text"
                  maxLength="100"
                  value={formulario.cidade_evento}
                  onChange={(e) => (
                    atualizarCampo(
                      'cidade_evento',
                      e.target.value,
                    )
                  )}
                  required
                />
              </label>

              <label className="admin-campo">
                <span>UF *</span>

                <input
                  type="text"
                  maxLength="2"
                  value={formulario.estado_evento}
                  onChange={(e) => (
                    atualizarCampo(
                      'estado_evento',
                      e.target.value.toUpperCase(),
                    )
                  )}
                  required
                />
              </label>
            </div>

            <label className="admin-campo">
              <span>Link de ingresso</span>

              <input
                type="url"
                placeholder="https://..."
                value={formulario.link_ingresso}
                onChange={(e) => (
                  atualizarCampo(
                    'link_ingresso',
                    e.target.value,
                  )
                )}
              />

              <small>
                Opcional. O link só aparece no site
                quando este campo estiver preenchido.
              </small>
            </label>

            {erro && (
              <p
                className="admin__mensagem admin__mensagem--erro"
                role="alert"
              >
                {erro}
              </p>
            )}

            {mensagem && (
              <p
                className="admin__mensagem admin__mensagem--sucesso"
                role="status"
              >
                {mensagem}
              </p>
            )}

            <div className="admin-form__acoes">
              <button
                className="admin-botao admin-botao--principal"
                type="submit"
                disabled={salvando || importandoBackup}
              >
                {salvando
                  ? 'Salvando...'
                  : eventoEditando
                    ? 'Salvar alterações'
                    : 'Criar evento'}
              </button>

              {eventoEditando && (
                <button
                  className="admin-botao admin-botao--secundario"
                  type="button"
                  onClick={cancelarEdicao}
                  disabled={salvando || importandoBackup}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ===============================================
            LISTAGEM E BACKUP
            =============================================== */}

        <section className="admin-card">
          <div className="admin-card__cabecalho">
            <p className="admin__indice">
              EVENTOS // CADASTRADOS
            </p>

            <h2>Agenda</h2>
          </div>

          {/* EXPORTAÇÃO */}

          <div className="admin-form__acoes">
            <button
              className="admin-botao admin-botao--secundario"
              type="button"
              onClick={exportarBackup}
              disabled={exportandoBackup || importandoBackup}
            >
              {exportandoBackup
                ? 'Exportando...'
                : 'Exportar backup'}
            </button>
          </div>

          {/* IMPORTAÇÃO */}

          <div className="admin-form">
            <label className="admin-campo">
              <span>Importar backup da Agenda</span>

              <input
                type="file"
                accept=".json,application/json"
                onChange={selecionarBackup}
                disabled={
                  analisandoBackup || importandoBackup
                }
              />

              <small>
                Selecione um JSON exportado pelo painel.
                Nenhum evento será alterado antes da confirmação.
              </small>
            </label>
          </div>

          {analisandoBackup && (
            <p role="status">
              Analisando arquivo de backup...
            </p>
          )}

          {erroBackup && (
            <p
              className="admin__mensagem admin__mensagem--erro"
              role="alert"
            >
              {erroBackup}
            </p>
          )}

          {mensagemBackup && (
            <p
              className="admin__mensagem admin__mensagem--sucesso"
              role="status"
            >
              {mensagemBackup}
            </p>
          )}

          {/* PRÉ-VISUALIZAÇÃO DO BACKUP */}

          {previaBackup && (
            <section aria-labelledby="backup-previa-titulo">
              <div className="admin-card__cabecalho">
                <p className="admin__indice">
                  BACKUP // PRÉ-VISUALIZAÇÃO
                </p>

                <h3 id="backup-previa-titulo">
                  Conferir restauração
                </h3>
              </div>

              <p>
                <strong>Arquivo:</strong>{' '}
                {previaBackup.nomeArquivo}
              </p>

              <p>
                <strong>Total:</strong>{' '}
                {previaBackup.eventos.length} evento(s)
              </p>

              <p>
                <strong>Serão criados:</strong>{' '}
                {previaBackup.quantidadeCriar}
              </p>

              <p>
                <strong>Serão substituídos:</strong>{' '}
                {previaBackup.quantidadeSubstituir}
              </p>

              <p>
                Eventos que não estiverem no backup
                permanecerão no Firestore.
              </p>

              <div className="admin-eventos">
                {previaBackup.eventos.slice(0, 10).map(
                  (item) => (
                    <article
                      className="admin-evento"
                      key={item.id}
                    >
                      <div>
                        <h3>{item.nome_evento}</h3>

                        <p>
                          {formatarPeriodo(item)}
                          {' // '}
                          {item.cidade_evento}
                          {' // '}
                          {item.estado_evento}
                        </p>
                      </div>
                    </article>
                  ),
                )}
              </div>

              {previaBackup.eventos.length > 10 && (
                <p>
                  Exibindo os primeiros 10 de{' '}
                  {previaBackup.eventos.length} eventos.
                </p>
              )}

              <div className="admin-form__acoes">
                <button
                  className="admin-botao admin-botao--principal"
                  type="button"
                  onClick={importarBackup}
                  disabled={importandoBackup}
                >
                  {importandoBackup
                    ? 'Restaurando...'
                    : 'Confirmar restauração'}
                </button>

                <button
                  className="admin-botao admin-botao--secundario"
                  type="button"
                  onClick={cancelarImportacao}
                  disabled={importandoBackup}
                >
                  Cancelar
                </button>
              </div>
            </section>
          )}

          {/* LISTAGEM ATUAL */}

          {carregando && (
            <p role="status">
              Carregando eventos...
            </p>
          )}

          {!carregando && eventos.length === 0 && (
            <p>Nenhum evento cadastrado.</p>
          )}

          {!carregando && eventos.length > 0 && (
            <div className="admin-eventos">
              {eventos.map((evento) => {
                const encerrado = (
                  evento.data_fim_evento
                  || evento.data_evento
                ) < hoje;

                return (
                  <article
                    className={`admin-evento ${
                      encerrado
                        ? 'admin-evento--encerrado'
                        : ''
                    }`}
                    key={evento.id}
                  >
                    <div>
                      <div className="admin-evento__meta">
                        <time dateTime={evento.data_evento}>
                          {formatarPeriodo(evento)}
                        </time>

                        {encerrado && (
                          <span className="admin-evento__selo">
                            Encerrado
                          </span>
                        )}

                        {evento.link_ingresso && (
                          <span className="admin-evento__selo">
                            Ingresso
                          </span>
                        )}
                      </div>

                      <h3>{evento.nome_evento}</h3>

                      <p>
                        {evento.cidade_evento}
                        {' // '}
                        {evento.estado_evento}
                      </p>
                    </div>

                    <div className="admin-evento__acoes">
                      <button
                        className="admin-botao admin-botao--secundario"
                        type="button"
                        onClick={() => iniciarEdicao(evento)}
                        disabled={importandoBackup}
                      >
                        Editar
                      </button>

                      <button
                        className="admin-botao admin-botao--perigo"
                        type="button"
                        onClick={() => excluirEvento(evento)}
                        disabled={importandoBackup}
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// =========================================================
// FORMATAÇÃO DE DATA
// =========================================================

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(`${data}T12:00:00`))
    .replace('.', '')
    .toUpperCase();
}

function formatarPeriodo(evento) {
  const inicio = formatarData(evento.data_evento);
  const fim = evento.data_fim_evento;

  if (!fim || fim === evento.data_evento) {
    return inicio;
  }

  return `${inicio} — ${formatarData(fim)}`;
}

export default AdminApp;
