import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  MessageCircle,
  Send,
  Sparkles,
  TrendingUp
} from "lucide-react";

const planningItems = [
  {
    date: "27",
    day: "SEGUNDA-FEIRA",
    month: "ABRIL",
    tag: "CARROSSEL",
    title: "Dicas para aumentar o engajamento",
    description: "Postagem com 5 slides sobre melhores práticas.",
    status: "PLANEJADO"
  },
  {
    date: "29",
    day: "QUARTA-FEIRA",
    month: "ABRIL",
    tag: "IMAGEM",
    title: "Benefícios do Marketing",
    description: "Infográfico mostrando o ROI de estratégias.",
    status: "PLANEJADO"
  },
  {
    date: "21",
    day: "DIA 21",
    month: "ABRIL",
    tag: "IMAGEM",
    title: "Promoção Melzinho 2x1",
    description: "Post promocional da campanha compre 1 leve 2.",
    status: "PLANEJADO"
  }
];

export default function Home() {
  return (
    <main className="page">
      <section className="mainArea">
        <p className="eyebrow">ASSISTENTE VIRTUAL</p>

        <div className="chatBar card">
          <div className="chatPrompt">
            <Sparkles size={20} />
            <span>O que vamos criar hoje para sua marca?</span>
          </div>
          <button className="generateBtn">
            Gerar Arte <Send size={16} />
          </button>
        </div>

        <section className="calendar card">
          <header className="calendarTop">
            <div>
              <h1>Calendário da Semana</h1>
              <p>Aqui está o seu plano de conteúdo estratégico.</p>
            </div>

            <div className="calendarActions">
              <button className="weekBtn">
                <CalendarDays size={16} /> ESTA SEMANA <ChevronDown size={16} />
              </button>
              <div className="monthNav">
                <span>ABRIL 2026</span>
                <button aria-label="Voltar mês">
                  <ChevronLeft size={16} />
                </button>
                <button aria-label="Próximo mês">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </header>

          <div className="cardsGrid">
            {planningItems.map((item) => (
              <article key={`${item.date}-${item.title}`} className="planCard">
                <header>
                  <div className="dateBall">{item.date}</div>
                  <div>
                    <strong>{item.day}</strong>
                    <p>{item.month}</p>
                  </div>
                </header>
                <span className="tag">{item.tag}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <footer>
                  <span>{item.status}</span>
                  <button aria-label="Mais opções">•••</button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="rightPanel">
        <section className="card panelCard">
          <h3>ANÁLISE DE PERFORMANCE</h3>
          <div className="performanceChart">
            <div className="chartHeader">
              <span>Alcance Semanal</span>
              <strong>+14%</strong>
            </div>
            <div className="fakeLine" />
          </div>

          <ul className="statsList">
            <li>
              <CalendarDays size={16} /> <b>3</b> CONTEÚDOS PLANEJADOS
            </li>
            <li>
              <Sparkles size={16} /> <b>1</b> EM RASCUNHO
            </li>
            <li>
              <TrendingUp size={16} /> <b>0</b> PUBLICADOS
            </li>
          </ul>
        </section>

        <section className="card eventCard">
          <h3>EVENTOS SUGERIDOS</h3>
          <div className="eventBox">
            <div className="eventIcon">
              <Flame size={18} />
            </div>
            <div>
              <strong>Black Friday</strong>
              <p>Faltam 12 dias. Prepare seu carrossel de ofertas agora!</p>
            </div>
          </div>
        </section>

        <section className="card tipCard">
          <h3>
            <Sparkles size={16} /> DICA DA IA
          </h3>
          <p>
            "Baseado no seu público, posts com fotos de bastidores performam 40% melhor às terças-feiras."
          </p>
        </section>

        <section className="card notifyCard">
          <p>
            <MessageCircle size={15} /> Novo comentário no Instagram
          </p>
        </section>
      </aside>
    </main>
  );
}
