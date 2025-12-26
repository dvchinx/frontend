import { useState } from 'react';
import './Portfolio.css';
import ProfilePhoto from '../../../assets/Me/Yo.jpeg';
import TasksImage from '../../../assets/Images/Tasks.png';
import TicTacToe from '../../../assets/Images/TicTacToe.png';
import Pizzeria from '../../../assets/Images/Pizzeria.png';
import FractalImage from '../../../assets/Images/Fractal_Gallery.png';
import TrophyIcon from '../../../assets/SVGs/Trophy_Icon.svg';
import TrophyIcon2 from '../../../assets/SVGs/Trophy_Icon2.svg';
import WebIcon from '../../../assets/SVGs/Web_Icon.svg';
import AppIcon from '../../../assets/SVGs/App_Icon.svg';
import DeployIcon from '../../../assets/SVGs/Deploy_Icon.svg';
import PolitecnicoLogo from '../../../assets/Logos/Politecnico.jpg';
import EdutinLogo from '../../../assets/Logos/Edutin.jpg';
import PlatziLogo from '../../../assets/Logos/Platzi.jpg';
import SENA from '../../../assets/Logos/SENA.png';

function Portfolio() {
  const [activeSection, setActiveSection] = useState('home');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    // Validación básica
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Por favor completa todos los campos' 
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Usando Web3Forms (servicio gratuito sin necesidad de registro previo)
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: '0747e6a8-4350-4ca8-b840-8aaf7effeb64',
          name: formData.name,
          email: formData.email,
          message: formData.message,
          to: 'jesus.florezch@gmail.com',
          subject: `Nuevo mensaje de ${formData.name} desde tu portafolio`
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: '¡Mensaje enviado exitosamente! Te contactaré pronto.' 
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Error al enviar el mensaje');
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Hubo un error al enviar el mensaje. Por favor inténtalo de nuevo.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const skills = [
    { name: 'Spring Boot', emoji: '🍃' },
    { name: 'Java 17+', emoji: '☕' },
    { name: 'Python', emoji: '🐍' },
    { name: 'Flask', emoji: '🧪' },
    { name: 'GitHub', emoji: '🐙' },
    { name: 'Cloud', emoji: '☁️' },
    { name: 'RabbitMQ', emoji: '🐰' },
    { name: 'Kafka', emoji: '📨' },
    { name: 'Microservicios', emoji: '🔧' },
  ];

  return (
    <div className="portfolio-container">
      {/* Navigation */}
      <nav className="portfolio-nav">
        <div className="portfolio-nav-brand">
          <span className="brand-text">Portafolio</span>
        </div>
        <div className="portfolio-nav-links">
          <a 
            href="#home" 
            className={activeSection === 'home' ? 'active' : ''}
            onClick={() => setActiveSection('home')}
          >
            Inicio
          </a>
          <a 
            href="#about" 
            className={activeSection === 'about' ? 'active' : ''}
            onClick={() => setActiveSection('about')}
          >
            Sobre mí
          </a>
          <a 
            href="#skills" 
            className={activeSection === 'skills' ? 'active' : ''}
            onClick={() => setActiveSection('skills')}
          >
            Habilidades
          </a>
          <a 
            href="#projects" 
            className={activeSection === 'projects' ? 'active' : ''}
            onClick={() => setActiveSection('projects')}
          >
            Proyectos
          </a>
          <a 
            href="#education" 
            className={activeSection === 'education' ? 'active' : ''}
            onClick={() => setActiveSection('education')}
          >
            Educación
          </a>
          <a 
            href="#contact" 
            className={activeSection === 'contact' ? 'active' : ''}
            onClick={() => setActiveSection('contact')}
          >
            Contacto
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="portfolio-hero">
        {/* Animated background elements */}
        <div className="hero-bg-element hero-bg-1"></div>
        <div className="hero-bg-element hero-bg-2"></div>
        <div className="hero-bg-element hero-bg-3"></div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-greeting">Hola, soy <br />Jesús Flórez</h1>
            <h2 className="hero-title">Desarrollador Back-End</h2>
            <p className="hero-description">
              Creando soluciones back-end robustas, escalables y eficientes
              con pasión y precisión.
            </p>
            <div className="hero-actions">
              <a 
                href="mailto:jesus.florezch@gmail.com" 
                className="btn-hero-primary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" strokeWidth="2"/>
                </svg>
                Contáctame
              </a>
              <a 
                href="https://github.com/dvchinx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-hero-secondary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>
          
          <div className="hero-image-container">
            <div className="hero-image-glow"></div>
            <div className="hero-image">
              <img src={ProfilePhoto} alt="Jesús Flórez" className="profile-photo" />
            </div>
            
            {/* Floating tech icons */}
            <div className="floating-icon icon-1">
              <span>☕</span>
            </div>
            <div className="floating-icon icon-2">
              <span>🍃</span>
            </div>
            <div className="floating-icon icon-3">
              <span>🐳</span>
            </div>
            <div className="floating-icon icon-4">
              <span>🐍</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="portfolio-section">
        <div className="section-content">
          
          <div className="about-container">
            <div className="about-left">
              <div className="about-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-line"></div>
                  <div className="timeline-icon-wrapper">
                    <img src={WebIcon} alt="Web Development" className="timeline-icon" />
                  </div>
                  <div className="timeline-content">
                    <h3 className="timeline-title">Desarrollo Web de Endpoints y Seguridad</h3>
                    <p className="timeline-description">
                      Mediante Spring Framework y sus herramientas, expongo
                      de manera efectiva y segura endpoints consumibles por
                      parte del servidor bajo demanda del Front-End.
                    </p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-line"></div>
                  <div className="timeline-icon-wrapper">
                    <img src={AppIcon} alt="AI Development" className="timeline-icon" />
                  </div>
                  <div className="timeline-content">
                    <h3 className="timeline-title">Consumo y Desarrollo de Modelos de IA</h3>
                    <p className="timeline-description">
                      Usando Spring AI, consumo los MaaS más óptimos para
                      satisfacer la necesidad o en su defecto, creo mi propio
                      modelo implementando Python como microservicio.
                    </p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-icon-wrapper">
                    <img src={DeployIcon} alt="Cloud Deployment" className="timeline-icon" />
                  </div>
                  <div className="timeline-content">
                    <h3 className="timeline-title">Despliegue de Servicios en la Nube</h3>
                    <p className="timeline-description">
                      +1 año de experiencia consumiendo servicios de Cloud
                      tales como: AWS EC2, Amazon RDS y de VPS: Debian
                      con conexión por SSH y despliegue con Docker Compose.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-right">
              <h2 className="section-title">ACERCA DE MÍ</h2>
              <div className="about-intro">
                <p className="about-intro-text">
                  Llevo más de 3 años desarrollando software con Java
                  17+, Spring Framework y Python con Flask/FastAPI.
                </p>
                <p className="about-intro-text">
                  Mi pasión es la construcción de aplicaciones web que
                  resuelvan problemas complejos, me gusta retarme día
                  a día y aprender algo nuevo.
                </p>
                <p className="about-intro-text">
                  Actualmente estoy contribuyendo a proyectos de
                  código abierto (open-source) y participando
                  activamente en programación competitiva.
                </p>
              </div>
              <div className="about-achievements">
                <div className="achievement-item">
                  <img src={TrophyIcon} alt="Trophy Gold" />
                  <p className="achievement-text">Reto Back-End<br />Net&Dev 2025</p>
                </div>
                <div className="achievement-item">
                  <img src={TrophyIcon2} alt="Trophy Silver" />
                  <p className="achievement-text">2°do Puesto<br />CCPL R8 2025</p>
                </div>
              </div>
              <a href="#contact" className="btn-more">Ver más logros →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="portfolio-section">
        <div className="section-content">
          <h2 className="section-title-two">Habilidades y Certificaciones</h2>
          <div className="skills-container">
            <div className="skills-left">
              <h3 className="skills-subtitle">Habilidades Técnicas</h3>
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <div key={index} className="skill-card">
                    <span className="skill-emoji">{skill.emoji}</span>
                    <span className="skill-name">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="skills-right">
              <h3 className="skills-subtitle">Estudios</h3>
              <div className="certifications-list">
                <a 
                  href="https://drive.google.com/file/d/1aj8WNHN-7SqmAPBu-rc0EoQHfsv3ZU4D/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="certification-card"
                >
                  <div className="cert-logo">
                    <img src={SENA} alt="SENA" className="cert-logo-img" />
                  </div>
                  <div className="cert-content">
                    <h4 className="cert-title">Técnico, Sistemas Informáticos</h4>
                    <p className="cert-institution">Servicio Nacional de Aprendizaje (SENA)</p>
                  </div>
                </a>
                <a 
                  href="https://drive.google.com/file/d/1Rdm9Us_WQBkmxIiA80n772RQWHTsFA5s/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="certification-card"
                >
                  <div className="cert-logo">
                    <img src={PolitecnicoLogo} alt="Politécnico" className="cert-logo-img" />
                  </div>
                  <div className="cert-content">
                    <h4 className="cert-title">Diplomado, Programación en Java</h4>
                    <p className="cert-institution">Politécnico de Colombia</p>
                  </div>
                </a>
                <a 
                  href="https://drive.google.com/file/d/1Ksf7ul_87F6EiwHkYXgWvtJ3q_0rnFlJ/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="certification-card"
                >
                  <div className="cert-logo">
                    <img src={EdutinLogo} alt="Edutin" className="cert-logo-img" />
                  </div>
                  <div className="cert-content">
                    <h4 className="cert-title">Diplomado, Metodología SCRUM</h4>
                    <p className="cert-institution">Edutin Academy</p>
                  </div>
                </a>
                <a 
                  href="https://drive.google.com/file/d/1Kvlv1KxFtQCPFv8Cf0ENbFENuclcQUEN/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="certification-card"
                >
                  <div className="cert-logo">
                    <img src={PlatziLogo} alt="Platzi" className="cert-logo-img" />
                  </div>
                  <div className="cert-content">
                    <h4 className="cert-title">Programación de Formación, Back-End con Java</h4>
                    <p className="cert-institution">Platzi</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="portfolio-section">
        <div className="section-content">
          <h2 className="section-title-two">MIS PROYECTOS</h2>
          <div className="projects-timeline">
            
            <div className="project-item">
              <div className="project-content-left">
                <h3 className="project-title">Suite Empresarial (Acceso Público)</h3>
                <div className="project-tags">
                  <span className="project-tag">React.js</span>
                  <span className="project-tag">Spring Framework</span>
                  <span className="project-tag">Flask</span>
                  <span className="project-tag">RabbitMQ</span>
                  <span className="project-tag">Microservicios</span>
                  <span className="project-tag">Kafka</span>
                  <span className="project-tag">Docker</span>
                  <span className="project-tag">MySQL</span>
                </div>
                <p className="project-description">
                  Aplicación web con 3 microservicios:
                </p>
                <ul className="project-features">
                  <li>Mensajería instantánea asíncrona (<b>Kafka</b> + <b>RabbitMQ</b>).</li>
                  <li>Remoción de fondo con IA (<b>Python 3</b> + <b>Flask</b>).</li>
                  <li>Seguimiento de tareas con Drag&Drop (<b>Spring</b>).</li>
                </ul>
                <p className="project-description">
                  Incluye sistema de registro e inicio de sesión con OAuth 2.0 y JWT.
                </p>
                <a href="/" className="project-link-btn">Ver proyecto →</a>
              </div>
              <div className="project-content-right">
                <img src={TasksImage} alt="Suite Empresarial" className="project-image" />
              </div>
            </div>

            <div className="project-item project-item-reverse">
              <div className="project-content-right">
                <img src={FractalImage} alt="Galería de Fractales" className="project-image-two" />
              </div>
              <div className="project-content-right">
                <h3 className="project-title">Galería y Generador de Fractales</h3>
                <div className="project-tags">
                  <span className="project-tag">Python</span>
                  <span className="project-tag">Flask</span>
                  <span className="project-tag">Numba</span>
                  <span className="project-tag">NumPy</span>
                  <span className="project-tag">Matplotlib</span>
                  <span className="project-tag">Pillow</span>
                </div>
                <p className="project-description">
                  Interfaz CLI de Python que permite:
                </p>
                <ul className="project-features">
                  <li>Generar imágenes individuales de fractales.</li>
                  <li>Generar galería de imágenes con los fractales actuales.</li>
                  <li>Parámetros de los fractales personalizables.</li>
                </ul>
                <a href="https://github.com/dvchinx/Fractal-Gallery" target="_blank" rel="noopener noreferrer" className="project-link-btn">Ver proyecto →</a>
              </div>
            </div>

            <div className="project-item">
              <div className="project-content-left">
                <h3 className="project-title">Tic Tac Toe (AI Bot)</h3>
                <div className="project-tags">
                  <span className="project-tag">Java</span>
                  <span className="project-tag">IntelliJ Idea</span>
                  <span className="project-tag">Minimax Algorithm</span>
                  <span className="project-tag">Maven</span>
                </div>
                <p className="project-description">
                  Juego del tres en raya por CLI desarrollado con:
                </p>
                <ul className="project-features">
                  <li>Estructuras de árbol n-ario para estado del juego.</li>
                  <li>Evaluación de mejores movimientos por algoritmo Minimax.</li>
                  <li>Partidas con imposibilidad de ganar contra la IA.</li>
                </ul>
                <a href="https://github.com/dvchinx/TicTacToe-AI" className="project-link-btn">Ver proyecto →</a>
              </div>
              <div className="project-content-right">
                <img src={TicTacToe} alt="TicTacToe" className="project-image-three" />
              </div>
            </div>

            <div className="project-item project-item-reverse">
              <div className="project-content-right">
                <img src={Pizzeria} alt="Pizzeria" className="project-image-two" />
              </div>
              <div className="project-content-right">
                <h3 className="project-title">Backend Monolítico para Pizzeria</h3>
                <div className="project-tags">
                  <span className="project-tag">Java 17+</span>
                  <span className="project-tag">Gradle</span>
                  <span className="project-tag">MySQL</span>
                  <span className="project-tag">Spring Framework</span>
                </div>
                <p className="project-description">
                  Back-end monolítico que permite:
                </p>
                <ul className="project-features">
                  <li>CRUD para clientes, pizzas y ordenes de usuarios.</li>
                  <li>Auditoría y paginación para las ordenes de los usuarios.</li>
                  <li>Persistencia en base de datos relacional.</li>
                </ul>
                <a href="https://github.com/dvchinx/Pizzeria-API" target="_blank" rel="noopener noreferrer" className="project-link-btn">Ver proyecto →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="portfolio-section contact-section">
        <div className="section-content">
          <div className="contact-container">
            <div className="contact-left">
              <h2 className="contact-main-title">
                Pongámonos en contacto<br />
                y trabajemos juntos.
              </h2>
              <p className="contact-subtitle">
                ¿Tienes un proyecto en mente o solo quieres conversar? ¡Conectémonos!
              </p>
            </div>
            <div className="contact-right">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Nombre</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="form-input" 
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Correo</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="form-input" 
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message" className="form-label">Mensaje</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="5" 
                    className="form-input form-textarea" 
                    placeholder="Tu mensaje aquí..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                {submitStatus.message && (
                  <div className={`form-message form-message-${submitStatus.type}`}>
                    {submitStatus.message}
                  </div>
                )}
                <button type="submit" className="form-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="portfolio-footer">
        <div className="footer-content">
          <div className="footer-left">
            <h3 className="footer-name">
              Jesús Flórez
            </h3>
            <p className="footer-copyright">© Todos los derechos reservados.</p>
          </div>
          <div className="footer-right">
            <p className="footer-info">
              Sitio diseñado con Figma. Desarrollado con React.js y Spring Boot.
            </p>
            <div className="footer-socials">
              <a 
                href="https://github.com/dvchinx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="GitHub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/dvchinx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Portfolio;
