'use client';

import { useState, useCallback } from 'react';
import {
  IconUser, IconCancelado,
  IconVacancia, IconAposentadoria,
  IconAposentadoria as IconCompulsoria, IconInvalidez,
  IconAutopatrocinio, IconBPD, IconPortabilidade, IconResgate,
  IconRestart, IconEmail, IconPhone, IconWhatsapp,
  IconCopy, IconCheckSm, IconCheckWhite, IconCheckCopied,
  IconDownload, IconBack,
} from './icons';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Status    = 'participante' | 'cancelado' | null;
type Tipo      = 'vacancia'     | 'aposentadoria' | null;
type TipoApos  = 'compulsoria'  | 'invalidez' | null;
type StepId    = 'step1' | 'step2' | 'step3apos' | 'step4' | 'resultado';

interface AppState {
  status:    Status;
  tipo:      Tipo;
  tipoApos:  TipoApos;
  meses:     number;
}

type Opcao = 'Autopatrocínio' | 'BPD' | 'Portabilidade' | 'Resgate';

interface Termo { arquivo: string; opcoes: Opcao[]; }

// ─── Dados ────────────────────────────────────────────────────────────────────
const descricoes: Record<Opcao, React.ReactNode> = {
  'Autopatrocínio': <><strong>Permanece no plano e assume todas as contribuições,</strong> continuando a acumular saldo e manter o benefício.</>,
  'BPD':            <><strong>Mantém o saldo investido e o direito ao benefício,</strong> mas deixa de contribuir e passa a pagar uma taxa mensal.</>,
  'Portabilidade':  <><strong>Transfere todo o saldo acumulado</strong> para outro plano de previdência.</>,
  'Resgate':        <><strong>Recebe parte do saldo acumulado,</strong> à vista ou parcelado, conforme o tempo de vínculo.</>,
};

const optionIcons: Record<Opcao, React.ReactNode> = {
  'Autopatrocínio': <IconAutopatrocinio />,
  'BPD':            <IconBPD />,
  'Portabilidade':  <IconPortabilidade />,
  'Resgate':        <IconResgate />,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mascaraData(v: string): string {
  v = v.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
  if (v.length > 5) v = v.slice(0, 5) + '/' + v.slice(5);
  return v.slice(0, 10);
}

function parseDataBR(str: string): Date | null {
  const p = str.split('/');
  if (p.length !== 3 || p[2].length !== 4) return null;
  const d = parseInt(p[0], 10), m = parseInt(p[1], 10) - 1, y = parseInt(p[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  const dt = new Date(y, m, d);
  return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d ? dt : null;
}

function calcularMeses(a: Date, d: Date): number {
  return Math.max(0, (d.getFullYear() - a.getFullYear()) * 12 + (d.getMonth() - a.getMonth()));
}

function resolverTermo(state: AppState): Termo {
  const { status, tipo, meses } = state;
  const cancelado    = status === 'cancelado';
  const isAposentado = tipo === 'aposentadoria';

  if (isAposentado) {
    if (cancelado) {
      return meses < 6
        ? { arquivo: 'TERMO DE OPÇÃO - RESGATE.pdf',                                  opcoes: ['Resgate'] }
        : { arquivo: 'TERMO DE OPÇÃO - PORTABILIDADE - RESGATE.pdf',                  opcoes: ['Portabilidade', 'Resgate'] };
    } else {
      return meses < 6
        ? { arquivo: 'TERMO DE OPÇÃO - AUTOPATROCÍNIO - RESGATE.pdf',                 opcoes: ['Autopatrocínio', 'Resgate'] }
        : { arquivo: 'TERMO DE OPÇÃO - AUTOPATROCÍNIO - PORTABILIDADE - RESGATE.pdf', opcoes: ['Autopatrocínio', 'Portabilidade', 'Resgate'] };
    }
  } else {
    if (cancelado) {
      return meses < 6
        ? { arquivo: 'TERMO DE OPÇÃO - RESGATE.pdf',                                  opcoes: ['Resgate'] }
        : { arquivo: 'TERMO DE OPÇÃO - BPD - PORTABILIDADE - RESGATE.pdf',            opcoes: ['BPD', 'Portabilidade', 'Resgate'] };
    } else {
      return meses < 6
        ? { arquivo: 'TERMO DE OPÇÃO - AUTOPATROCÍNIO - RESGATE.pdf',                 opcoes: ['Autopatrocínio', 'Resgate'] }
        : { arquivo: 'TERMO DE OPÇÃO - COMPLETO.pdf',                                 opcoes: ['Autopatrocínio', 'BPD', 'Portabilidade', 'Resgate'] };
    }
  }
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function CopyButton({ texto }: { texto: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(texto).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
      {copied ? <IconCheckCopied /> : <IconCopy />}
    </button>
  );
}

function ContactList() {
  return (
    <div className="contact-list">
      <div className="contact-row">
        <div className="contact-icon-wrap"><IconEmail /></div>
        <div className="contact-label">
          Email: <a href="mailto:sap@funprespjud.com.br" className="contact-link"><strong>sap@funprespjud.com.br</strong></a>
        </div>
        <CopyButton texto="sap@funprespjud.com.br" />
      </div>
      <div className="contact-row">
        <div className="contact-icon-wrap"><IconPhone /></div>
        <div className="contact-label">Telefone: <strong>(61) 3029-5070</strong></div>
        <CopyButton texto="(61) 3029-5070" />
      </div>
      <div className="contact-row">
        <div className="contact-icon-wrap"><IconWhatsapp /></div>
        <div className="contact-label">
          Whatsapp:{' '}
          <a href="https://api.whatsapp.com/send/?phone=556140425515&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" className="contact-link">
            <strong>(61) 4042-5515</strong>
          </a>
        </div>
        <CopyButton texto="(61) 4042-5515" />
      </div>
    </div>
  );
}

function NovaConsultaBtn({ onReset }: { onReset: () => void }) {
  return (
    <button className="btn-nova" onClick={onReset}>
      <IconRestart /> Fazer nova consulta
    </button>
  );
}

function ResultadoBeneficio({ onReset }: { onReset: () => void }) {
  return (
    <div className="result-body">
      <div className="success-banner">
        <div className="success-check"><IconCheckWhite /></div>
        <div>
          <div className="success-title">Você tem direito ao benefício!</div>
          <div className="success-subtitle" style={{ marginTop: '0.375rem' }}>
            Para dar continuidade ao processo, <strong>entre em contato</strong> através dos nossos canais de atendimento e envie os documentos necessários.
          </div>
        </div>
      </div>

      <hr className="result-divider" />

      <div className="result-title">Como solicitar o benefício</div>
      <div className="result-subtitle">Siga o passo a passo abaixo para solicitar o benefício.</div>

      <div className="step-list">
        <div className="step-item">
          <div className="step-num">1</div>
          <div className="step-content">
            <p><strong>Reúna</strong> os documentos (portaria de aposentadoria e identidade).</p>
            <div className="check-list">
              <div className="check-item">
                <div className="check-circle"><IconCheckSm /></div>
                <span>Portaria de aposentadoria</span>
              </div>
              <div className="check-item">
                <div className="check-circle"><IconCheckSm /></div>
                <span>Identidade</span>
              </div>
            </div>
          </div>
        </div>
        <div className="step-item">
          <div className="step-num">2</div>
          <div className="step-content">
            <p><strong>Envie o requerimento</strong> para Funpresp-JUD através de um dos canais abaixo:</p>
            <ContactList />
          </div>
        </div>
      </div>

      <NovaConsultaBtn onReset={onReset} />
    </div>
  );
}

function ResultadoInstitutos({ termo, onReset }: { termo: Termo; onReset: () => void }) {
  const baixarPDF = (nome: string) => {
    const a = document.createElement('a');
    a.href     = '/pdfs/' + encodeURIComponent(nome);
    a.download = nome;
    a.target   = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => alert('Download iniciado!\n\nArquivo: ' + nome), 500);
  };

  return (
    <div className="result-body">
      <div className="result-title">O que você pode fazer com seu plano</div>
      <div className="result-subtitle">Veja abaixo as opções disponíveis para você.</div>

      <div className="option-cards">
        {termo.opcoes.map((op) => (
          <div key={op} className="option-card">
            <div className="icon-circle icon-blue">{optionIcons[op]}</div>
            <div>
              <div className="opt-title">{op === 'BPD' ? 'Benefício Proporcional Diferido (BPD)' : op}</div>
              <div className="opt-desc">{descricoes[op]}</div>
            </div>
          </div>
        ))}
      </div>

      <hr className="result-divider" />

      <div className="result-title">Seleção de instituto</div>
      <div className="result-subtitle">Siga o passo a passo abaixo para selecionar seu instituto.</div>

      <div className="step-list">
        <div className="step-item">
          <div className="step-num">1</div>
          <div className="step-content">
            <p><strong>Baixe</strong> o termo de opção clicando no botão abaixo:</p>
            <button className="btn-download" onClick={() => baixarPDF(termo.arquivo)}>
              <IconDownload /> Baixar termo de opção
            </button>
          </div>
        </div>
        <div className="step-item">
          <div className="step-num">2</div>
          <div className="step-content">
            <p><strong>Preencha</strong> com seus dados, <strong>escolha</strong> uma das opções disponíveis e <strong>assine</strong> o documento.</p>
          </div>
        </div>
        <div className="step-item">
          <div className="step-num">3</div>
          <div className="step-content">
            <p><strong>Envie-o</strong> para Funpresp-JUD através de um dos canais abaixo:</p>
            <ContactList />
          </div>
        </div>
      </div>

      <NovaConsultaBtn onReset={onReset} />
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function GuiaVacancia() {
  const [step,      setStep]      = useState<StepId>('step1');
  const [progress,  setProgress]  = useState(15);
  const [appState,  setAppState]  = useState<AppState>({ status: null, tipo: null, tipoApos: null, meses: 0 });

  // inputs controlados
  const [selectedStatus,    setSelectedStatus]    = useState<Status>(null);
  const [selectedTipo,      setSelectedTipo]      = useState<Tipo>(null);
  const [selectedTipoApos,  setSelectedTipoApos]  = useState<TipoApos>(null);
  const [dataAdesao,        setDataAdesao]        = useState('');
  const [dataDesligamento,  setDataDesligamento]  = useState('');

  // resultado calculado
  const [resultado, setResultado] = useState<'beneficio' | 'institutos' | null>(null);
  const [termo,     setTermo]     = useState<Termo | null>(null);

  const reset = useCallback(() => {
    setStep('step1');
    setProgress(15);
    setAppState({ status: null, tipo: null, tipoApos: null, meses: 0 });
    setSelectedStatus(null);
    setSelectedTipo(null);
    setSelectedTipoApos(null);
    setDataAdesao('');
    setDataDesligamento('');
    setResultado(null);
    setTermo(null);
  }, []);

  // ── Navegação ──
  function proximoPasso1() {
    if (!selectedStatus) return;
    setAppState(s => ({ ...s, status: selectedStatus }));
    setProgress(33);
    setStep('step2');
  }

  function proximoPasso2() {
    if (!selectedTipo) return;
    setAppState(s => ({ ...s, tipo: selectedTipo }));
    if (selectedTipo === 'aposentadoria' && selectedStatus !== 'cancelado') {
      setProgress(66);
      setStep('step3apos');
    } else {
      setProgress(90);
      setStep('step4');
    }
  }

  function proximoPasso3apos() {
    if (!selectedTipoApos) return;
    setAppState(s => ({ ...s, tipoApos: selectedTipoApos }));
    if (selectedTipoApos === 'invalidez') {
      setProgress(100);
      setResultado('beneficio');
      setStep('resultado');
    } else {
      setProgress(90);
      setStep('step4');
    }
  }

  function voltar(de: StepId) {
    if (de === 'step2') { setProgress(15); setStep('step1'); }
    else if (de === 'step3apos') { setProgress(33); setStep('step2'); }
    else if (de === 'step4') {
      if (appState.tipo === 'aposentadoria' && appState.status !== 'cancelado') {
        setProgress(66); setStep('step3apos');
      } else {
        setProgress(33); setStep('step2');
      }
    }
  }

  function calcularResultado() {
    if (!dataAdesao || !dataDesligamento) { alert('Por favor, preencha ambas as datas'); return; }
    const adesao       = parseDataBR(dataAdesao);
    const desligamento = parseDataBR(dataDesligamento);
    if (!adesao)       { alert('Data de adesão inválida. Use dd/mm/aaaa'); return; }
    if (!desligamento) { alert('Data de desligamento inválida. Use dd/mm/aaaa'); return; }
    if (desligamento <= adesao) { alert('A data de desligamento deve ser posterior à data de adesão'); return; }

    const meses = calcularMeses(adesao, desligamento);
    const finalState: AppState = { ...appState, tipoApos: selectedTipoApos, meses };
    setAppState(finalState);
    setProgress(100);

    const participante  = finalState.status === 'participante';
    const aposentadoria = finalState.tipo === 'aposentadoria';
    const compulsoria   = finalState.tipoApos === 'compulsoria';

    if (participante && aposentadoria && compulsoria && meses >= 60) {
      setResultado('beneficio');
    } else {
      const t = resolverTermo(finalState);
      setTermo(t);
      setResultado('institutos');
    }
    setStep('resultado');
  }

  const isResult   = step === 'resultado';
  const barClass   = `progress-fill${progress >= 100 ? ' complete' : ''}`;

  return (
    <div className="container">

      {/* HEADER */}
      {!isResult && (
        <div className="card-header">
          <h1>Guia de vacância</h1>
          <p className="subtitle">Com poucas perguntas descubra quais os direitos e opções do seu plano.</p>
          <div className="progress-track">
            <div className={barClass} style={{ width: `${progress}%` }} />
            <div className="progress-track-bg" />
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="card-body" style={isResult ? { padding: 0 } : undefined}>

        {/* PASSO 1 */}
        {step === 'step1' && (
          <div>
            <div className="question">Qual é o seu status atual no plano?</div>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio" id="participante" name="status" value="participante"
                  checked={selectedStatus === 'participante'}
                  onChange={() => setSelectedStatus(s => s === 'participante' ? null : 'participante')}
                />
                <label htmlFor="participante" className="radio-label">
                  <div className="icon-circle icon-teal"><IconUser /></div>
                  <div className="radio-text">
                    <strong>Minha inscrição e repasse de contribuições estão regulares</strong>
                  </div>
                </label>
              </div>
              <div className="radio-option">
                <input
                  type="radio" id="cancelado" name="status" value="cancelado"
                  checked={selectedStatus === 'cancelado'}
                  onChange={() => setSelectedStatus(s => s === 'cancelado' ? null : 'cancelado')}
                />
                <label htmlFor="cancelado" className="radio-label">
                  <div className="icon-circle icon-red"><IconCancelado /></div>
                  <div className="radio-text">
                    <strong>Cancelei minha inscrição e tenho saldo na Funpresp-Jud</strong>
                  </div>
                </label>
              </div>
            </div>
            <div className="nav-buttons">
              <button className="btn btn-continue" onClick={proximoPasso1} disabled={!selectedStatus}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2 */}
        {step === 'step2' && (
          <div>
            <div className="question">Qual tipo de cessação do vínculo?</div>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio" id="vacancia" name="tipo" value="vacancia"
                  checked={selectedTipo === 'vacancia'}
                  onChange={() => setSelectedTipo(t => t === 'vacancia' ? null : 'vacancia')}
                />
                <label htmlFor="vacancia" className="radio-label">
                  <div className="icon-circle icon-blue"><IconVacancia /></div>
                  <div className="radio-text">
                    <strong>Vacância por exoneração, demissão, posse em outro cargo inacumulável, etc.</strong>
                  </div>
                </label>
              </div>
              <div className="radio-option">
                <input
                  type="radio" id="aposentadoria" name="tipo" value="aposentadoria"
                  checked={selectedTipo === 'aposentadoria'}
                  onChange={() => setSelectedTipo(t => t === 'aposentadoria' ? null : 'aposentadoria')}
                />
                <label htmlFor="aposentadoria" className="radio-label">
                  <div className="icon-circle icon-blue"><IconAposentadoria /></div>
                  <div className="radio-text">
                    <strong>Aposentadoria pelo RGPS ou RPPS</strong>
                  </div>
                </label>
              </div>
            </div>
            <div className="nav-buttons">
              <button className="btn btn-back" onClick={() => voltar('step2')}>
                <IconBack /> Voltar
              </button>
              <button className="btn btn-continue" onClick={proximoPasso2} disabled={!selectedTipo}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3 */}
        {step === 'step3apos' && (
          <div>
            <div className="question">Qual o tipo de aposentadoria?</div>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio" id="compulsoria" name="tipoApos" value="compulsoria"
                  checked={selectedTipoApos === 'compulsoria'}
                  onChange={() => setSelectedTipoApos(t => t === 'compulsoria' ? null : 'compulsoria')}
                />
                <label htmlFor="compulsoria" className="radio-label">
                  <div className="icon-circle icon-blue"><IconCompulsoria /></div>
                  <div className="radio-text">
                    <strong>Aposentadoria Compulsória ou voluntária.</strong>
                  </div>
                </label>
              </div>
              <div className="radio-option">
                <input
                  type="radio" id="invalidez" name="tipoApos" value="invalidez"
                  checked={selectedTipoApos === 'invalidez'}
                  onChange={() => setSelectedTipoApos(t => t === 'invalidez' ? null : 'invalidez')}
                />
                <label htmlFor="invalidez" className="radio-label">
                  <div className="icon-circle icon-blue"><IconInvalidez /></div>
                  <div className="radio-text">
                    <strong>Invalidez</strong>
                  </div>
                </label>
              </div>
            </div>
            <div className="nav-buttons">
              <button className="btn btn-back" onClick={() => voltar('step3apos')}>
                <IconBack /> Voltar
              </button>
              <button className="btn btn-continue" onClick={proximoPasso3apos} disabled={!selectedTipoApos}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* PASSO 4 */}
        {step === 'step4' && (
          <div>
            <div className="question">Por quanto tempo você contribuiu para o plano?</div>
            <div className="date-row">
              <div className="date-group">
                <label htmlFor="dataAdesao">Data de adesão:</label>
                <input
                  type="text" id="dataAdesao" className="input-field"
                  placeholder="Ex: 20/11/2013" maxLength={10}
                  value={dataAdesao}
                  onChange={e => setDataAdesao(mascaraData(e.target.value))}
                />
              </div>
              <div className="date-group">
                <label htmlFor="dataDesligamento">Data de desligamento:</label>
                <input
                  type="text" id="dataDesligamento" className="input-field"
                  placeholder="Ex: 20/11/2017" maxLength={10}
                  value={dataDesligamento}
                  onChange={e => setDataDesligamento(mascaraData(e.target.value))}
                />
              </div>
            </div>
            <div className="date-divisor" />
            <div className="nav-buttons">
              <button className="btn btn-back" onClick={() => voltar('step4')}>
                <IconBack /> Voltar
              </button>
              <button className="btn btn-continue" onClick={calcularResultado}>
                Ver resultado
              </button>
            </div>
          </div>
        )}

        {/* RESULTADO */}
        {step === 'resultado' && resultado === 'beneficio' && (
          <ResultadoBeneficio onReset={reset} />
        )}
        {step === 'resultado' && resultado === 'institutos' && termo && (
          <ResultadoInstitutos termo={termo} onReset={reset} />
        )}

      </div>
    </div>
  );
}
