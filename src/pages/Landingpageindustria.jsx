
import React from 'react';
import logo from '@/assets/logo.webp'; // Verifique se o caminho do seu logo está correto

function LandingPageIndustria() {
  return (
    <>
      {/* A tag <style> com dangerouslySetInnerHTML é mantida como você enviou */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root{
              --bg:#f7fafc;
              --card:#ffffff;
              --text:#0f172a;
              --muted:#475569;
              --brand1:#0ea5e9;
              --brand2:#10b981;
            }
            *{box-sizing:border-box}
            body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;color:var(--text);background:var(--bg);line-height:1.6}
            a{color:inherit;text-decoration:none}
            .container{max-width:1100px;margin:0 auto;padding:24px}
            .header{display:flex;align-items:center;gap:16px;padding:16px 0}
            .header img{height:52px;width:auto;border-radius:12px}
            .brand{font-size:28px;font-weight:800}
            .hero{display:grid;grid-template-columns:1.2fr;gap:24px;background:linear-gradient(135deg,var(--brand2),var(--brand1));color:white;border-radius:24px;padding:36px}
            .hero h1{margin:0 0 8px 0;font-size:36px;line-height:1.15}
            .hero p{margin:0;font-size:18px;opacity:.95}
            .badges{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
            .badge{background:rgba(255,255,255,.15);padding:8px 12px;border-radius:999px;font-weight:600}
            .cta{margin-top:20px;display:flex;gap:12px;flex-wrap:wrap}
            .btn{display:inline-block;padding:14px 18px;border-radius:12px;background:white;color:#0b1220;font-weight:800; transition: transform 0.2s;}
            .btn:hover{transform: scale(1.05);}
            .btn.secondary{background:transparent;border:2px solid rgba(255,255,255,.7);color:white}
            .section{margin-top:28px;background:var(--card);border-radius:20px;padding:24px;box-shadow:0 10px 28px rgba(2, 8, 23, .06)}
            .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
            .card{background:#fcfcfd;border:1px solid #eef2f7;border-radius:16px;padding:18px}
            .card h3{margin:0 0 8px 0}
            .list{padding-left:18px}
            .kicker{color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:700;font-size:12px}
            .footer{margin:22px 0 40px;color:var(--muted);font-size:14px;text-align:center}
            .contact{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:8px}
            .whatsapp{background:linear-gradient(135deg,#25D366,#128C7E);color:white;font-weight:800}
            @media (max-width:900px){
              .grid{grid-template-columns:1fr}
              .hero h1{font-size:28px}
            }
          `
        }}
      />
      <div className="container">
        <header className="header">
          <img src={logo} alt="Logo MedSinai" />
          <div className="brand">MedSinai</div>
        </header>
        <main>
          <section className="hero">
            <div>
              <div className="kicker">Para Indústrias</div>
              <h1>
                Saúde que move sua produção — Indústrias, Agroindústrias e Logística
              </h1>
              <p>
                Telemedicina 24h para sua equipe; mais produtividade, menos
                afastamentos.
              </p>
              <div className="badges">
                <span className="badge">Telemedicina 24h</span>
                <span className="badge">R$30 em Pix</span>
                <span className="badge">Clube de Vantagens</span>
                <span className="badge">Sem coparticipação</span>
              </div>
              <div className="cta">
                <a
                  className="btn whatsapp"
                  href="https://wa.me/5516997481801?text=Ol%C3%A1%20Lucas!%20Quero%20uma%20proposta%20do%20MedSinai%20para%20Saúde que move sua produção - Indústrias, Agroindústrias e Logística."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar no WhatsApp
                </a>
                <a
                  className="btn"
                  href="https://www.medsinai.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visitar o site
                </a>
              </div>
            </div>
          </section>
          <section className="section">
            <h2>Por que MedSinai?</h2>
            <div className="grid">
              <div className="card">
                <h3>Reduza afastamentos</h3>
                <p>Acesso imediato a médicos 24h reduz tempo de espera e faltas.</p>
              </div>
              <div className="card">
                <h3>Cumpra a NR‑01</h3>
                <p>Documentação simples para conformidade ocupacional.</p>
              </div>
              <div className="card">
                <h3>Baixo custo por colaborador</h3>
                <p>Benefício de alto valor percebido com investimento acessível.</p>
              </div>
            </div>
          </section>
          <section className="section">
            <h2>Benefícios inclusos</h2>
            <ul className="list">
              <li>
                Atendimento 24h com Clínico Geral, Pediatra, Ginecologista,
                Dermatologista, Psicólogo, Nutricionista e Treinador Físico
              </li>
              <li>Televeterinária (cães e gatos ) incluída</li>
              <li>
                Clube de Vantagens: até 55% no cinema, descontos exclusivos e 5% de
                cashback
              </li>
              <li>
                <strong>R$ 30 em Pix</strong> para compra de medicamentos
              </li>
              <li>Sem coparticipação e sem burocracia</li>
              <li>
                Conformidade com a <strong>NR‑01</strong>
              </li>
            </ul>
          </section>
        </main>
        <footer className="footer">
          <div>
            📧 <a href="mailto:lucas@medsinai.com.br">lucas@medsinai.com.br</a>{" "}
            &nbsp;•&nbsp; 📞 +55 (16) 99748-1801 &nbsp;•&nbsp; 🌐{" "}
            <a href="https://www.medsinai.com.br" target="_blank" rel="noopener noreferrer">
              https://www.medsinai.com.br
            </a>
          </div>
          <div className="contact" />
        </footer>
      </div>
    </>
   );
}

// Exporta o componente como padrão para que a importação no arquivo de rotas funcione
export default LandingPageIndustria;
