import {
  BarChart3,
  CalendarDays,
  Cog,
  Image,
  Lightbulb,
  Mic,
  Plus,
  Send,
  Sparkles,
  Target,
  Video
} from "lucide-react";

const planningItems = [
  {
    day: "Segunda-feira",
    title: "Post de Carrossel",
    description: "5 dicas para aumentar o engajamento no Instagram.",
    status: "Planejado",
    icon: <Image size={16} />
  },
  {
    day: "Quarta-feira",
    title: "Post de Imagem",
    description: "Arte institucional para reforçar posicionamento da marca.",
    status: "Em revisão",
    icon: <Target size={16} />
  },
  {
    day: "Sexta-feira",
    title: "Vídeo Curto",
    description: "Roteiro rápido com tendência da semana para Reels.",
    status: "Rascunho",
    icon: <Video size={16} />
  }
];

export default function Home() {
  return (
    <main className="page">
      <aside className="leftPanel card">
        <div>
          <div className="logoBadge">
            <Sparkles size={20} />
          </div>
          <h2>Assistente de Marketing IA</h2>
          <p>Seu copiloto para criar estratégias, posts e resultados.</p>
        </div>

        <nav className="menu">
          <button className="menuItem active">
            <Target size={18} />
            Visão geral
          </button>
          <button className="menuItem">
            <CalendarDays size={18} />
            Campanhas
          </button>
          <button className="menuItem">
            <BarChart3 size={18} />
            Insights
          </button>
        </nav>

        <button className="menuItem config">
          <Cog size={18} />
          Configurações
        </button>
      </aside>

      <section className="content">
        <h1>Olá 👋</h1>

        <div className="chatBar card">
          <Sparkles size={18} />
          <input
            aria-label="Pergunte ao assistente"
            placeholder="Peça uma arte + legenda + data de publicação..."
          />
          <button aria-label="Falar">
            <Mic size={16} />
          </button>
          <button aria-label="Enviar" className="sendBtn">
            <Send size={16} />
          </button>
        </div>

        <section className="planner card">
          <div className="plannerHeader">
            <div>
              <h3>Planejador de Conteúdo</h3>
              <p>Converse com a IA e aprove conteúdos para agendar automaticamente.</p>
            </div>
            <button className="weekSelector">
              <CalendarDays size={16} /> Esta semana
            </button>
          </div>

          <div className="grid">
            {planningItems.map((item) => (
              <article key={item.day} className="planCard">
                <span className="chip">{item.day}</span>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <footer>
                  <span>{item.icon} {item.status}</span>
                </footer>
              </article>
            ))}
          </div>

          <button className="addButton">
            <Plus size={16} /> Novo item de planejamento
          </button>
        </section>
      </section>

      <aside className="rightPanel">
        <section className="card summary">
          <h3>Resumo da semana</h3>
          <ul>
            <li>
              <strong>3</strong>
              <span>Conteúdos planejados</span>
            </li>
            <li>
              <strong>1</strong>
              <span>Em revisão</span>
            </li>
            <li>
              <strong>0</strong>
              <span>Publicados</span>
            </li>
          </ul>
        </section>

        <section className="card suggestion">
          <h3>
            <Lightbulb size={18} /> Sugestão da IA
          </h3>
          <p>
            Que tal um carrossel mostrando bastidores da sua empresa para humanizar sua marca esta semana?
          </p>
          <button>Gerar ideia</button>
        </section>
      </aside>
    </main>
  );
}
