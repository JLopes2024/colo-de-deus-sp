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
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import { auth, db } from '../servicos/firebase.js';

import './admin.css';

const FORMULARIO_INICIAL = {
  nome_evento: '',
  data_evento: '',
  cidade_evento: '',
  estado_evento: '',
  link_ingresso: '',
};

function AdminApp() {
  const [usuario, setUsuario] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    // Observa o estado de autenticação do Firebase.
    // Também recupera automaticamente a sessão após um refresh.
    const cancelarObservacao = onAuthStateChanged(auth, (usuarioAtual) => {
      setUsuario(usuarioAtual);
      setCarregandoSessao(false);
    });

    return cancelarObservacao;
  }, []);

  if (carregandoSessao) {
    return (
      <main className="admin admin--centralizado">
        <p role="status">Carregando...</p>
      </main>
    );
  }

  return usuario
    ? <PainelAdmin usuario={usuario} />
    : <LoginAdmin />;
}

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
        <p className="admin__indice">ADMIN // MISSÃO SP</p>

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

function PainelAdmin({ usuario }) {
  const [eventos, setEventos] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [eventoEditando, setEventoEditando] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

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

  async function carregarEventos() {
    setCarregando(true);
    setErro('');

    try {
      const consulta = query(
        collection(db, 'eventos'),
        orderBy('data_evento', 'asc'),
      );

      const resultado = await getDocs(consulta);

      const eventosCarregados = resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));

      setEventos(eventosCarregados);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);

      setErro('Não foi possível carregar os eventos.');
      setEventos([]);
    } finally {
      setCarregando(false);
    }
  }

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

    if (estado.length !== 2) {
      return 'O estado deve usar a sigla com 2 letras.';
    }

    if (link) {
      try {
        const url = new URL(link);

        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'O link deve começar com http:// ou https://.';
        }
      } catch {
        return 'Informe um link de ingresso válido.';
      }
    }

    return '';
  }

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

    /*
     * Mantemos os mesmos cinco campos utilizados
     * pela versão anterior da agenda.
     *
     * O link vazio é salvo como string vazia.
     * Assim o componente público pode continuar
     * usando uma simples verificação de valor.
     */
    const dadosEvento = {
      nome_evento: formulario.nome_evento.trim(),
      data_evento: formulario.data_evento,
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
          dadosEvento,
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

  async function sair() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair do admin:', error);

      setErro('Não foi possível encerrar a sessão.');
    }
  }

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

            <label className="admin-campo">
              <span>Data *</span>

              <input
                type="date"
                value={formulario.data_evento}
                onChange={(e) => (
                  atualizarCampo('data_evento', e.target.value)
                )}
                required
              />
            </label>

            <div className="admin-form__linha">
              <label className="admin-campo">
                <span>Cidade *</span>

                <input
                  type="text"
                  maxLength="100"
                  value={formulario.cidade_evento}
                  onChange={(e) => (
                    atualizarCampo('cidade_evento', e.target.value)
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
                  atualizarCampo('link_ingresso', e.target.value)
                )}
              />

              <small>
                Opcional. O botão só aparece no site quando este campo estiver preenchido.
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
                disabled={salvando}
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
                  disabled={salvando}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card__cabecalho">
            <p className="admin__indice">
              EVENTOS // CADASTRADOS
            </p>

            <h2>Agenda</h2>
          </div>

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
                const encerrado = evento.data_evento < hoje;

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
                          {formatarData(evento.data_evento)}
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
                      >
                        Editar
                      </button>

                      <button
                        className="admin-botao admin-botao--perigo"
                        type="button"
                        onClick={() => excluirEvento(evento)}
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

export default AdminApp;