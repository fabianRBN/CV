window.CV_DATA = {"stages": [{"name": "Estrategia", "short": "Del reto a la solución.", "strength": "Traduzco necesidades en una propuesta técnica.", "proof": "Preventa técnica · RFP / RFI bancarios", "tools": ["azure", "amazonwebservices"], "tags": ["RFP / RFI"], "glyph": "strategy"}, {"name": "Arquitectura", "short": "Una base para crecer.", "strength": "Diseño soluciones cloud, conectadas y seguras.", "proof": "Score360 · arquitectura en Azure", "tools": ["azure", "amazonwebservices", "terraform"], "tags": [], "glyph": "architecture"}, {"name": "Desarrollo", "short": "De la idea al código.", "strength": "Conecto interfaces, servicios y datos.", "proof": "Aplicaciones web, móviles y software bancario", "tools": ["java", "spring", "react", "flutter"], "tags": [], "glyph": "code"}, {"name": "Integración", "short": "Cada cambio, conectado.", "strength": "Automatizo la entrega desde Git.", "proof": "Pipelines YAML · GitFlow · contenedores", "tools": ["git", "azuredevops", "docker"], "tags": [], "glyph": "integration"}, {"name": "Calidad", "short": "Confianza antes de salir.", "strength": "Integro pruebas, análisis y seguridad.", "proof": "Análisis de código · dependencias · pruebas de carga", "tools": ["sonarqube", "snyk"], "tags": ["OWASP"], "glyph": "quality"}, {"name": "Despliegue", "short": "Infraestructura repetible.", "strength": "Llevo código e infraestructura a la nube.", "proof": "Score360 · Terraform + Container Apps", "tools": ["terraform", "azure", "docker"], "tags": [], "glyph": "deploy"}, {"name": "Operación", "short": "Visibilidad para actuar.", "strength": "Diagnostico con métricas, logs y trazas.", "proof": "AppDynamics · Log Analytics · gestión de secretos", "tools": ["azure"], "tags": ["AppDynamics", "Log Analytics"], "glyph": "observe"}, {"name": "Mejora", "short": "El siguiente ciclo empieza.", "strength": "Automatizo tareas y conecto capacidades de IA.", "proof": "Agentes · embeddings · flujos con n8n", "tools": ["n8n", "python", "postgresql"], "tags": ["Azure AI Foundry"], "glyph": "improve"}], "tools": {"azure": "Azure", "amazonwebservices": "AWS", "terraform": "Terraform", "azuredevops": "Azure DevOps", "git": "Git", "github": "GitHub", "docker": "Docker", "java": "Java", "spring": "Spring Boot", "react": "React", "angular": "Angular", "vuejs": "Vue", "flutter": "Flutter", "python": "Python", "javascript": "JavaScript", "dotnetcore": ".NET", "php": "PHP", "postgresql": "PostgreSQL", "microsoftsqlserver": "SQL Server", "firebase": "Firebase", "sonarqube": "SonarQube", "snyk": "Snyk", "n8n": "n8n"}};
(() => {
  'use strict';
  const {stages, tools} = window.CV_DATA;
  const $ = s => document.querySelector(s);
  const tabs = [...document.querySelectorAll('[data-stage]')];
  const panel = $('.panel-content');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const range = $('#stage-range');
  const path = $('#cycle-path');
  const marker = $('#traveler');
  const duration = 6000;
  let active = 0, playing = !media.matches, visible = true, elapsed = 0, last = 0, raf = 0;

  // Mirror details below the route on phones so labels and touch targets stay readable.
  const mobileDetail = document.createElement('div');
  mobileDetail.className = 'mobile-detail';
  $('.cycle-controls').before(mobileDetail);
  const phone = window.matchMedia('(max-width: 650px)');
  function placeDetails() {
    const target = phone.matches ? mobileDetail : panel;
    target.append($('#stage-tools'), $('#stage-proof'));
    mobileDetail.hidden = !phone.matches;
  }
  phone.addEventListener('change', placeDetails);
  placeDetails();

  function logo(k) {
    const wrap = document.createElement('span');
    wrap.className = 'stage-tool';
    const img = document.createElement('img');
    img.src = `assets/icons/${k}.svg`; img.alt = ''; img.width = 36; img.height = 36;
    const name = document.createElement('span'); name.textContent = tools[k];
    wrap.append(img,name); return wrap;
  }
  function details(stage) {
    const list = $('#stage-tools');
    list.replaceChildren(...stage.tools.map(logo));
    for (const tag of stage.tags) {
      const el = document.createElement('span');el.className = 'tool-tag';el.textContent = tag;list.append(el);
    }
    $('#stage-proof').textContent = stage.proof;
  }
  function placeMarker(progress) {
    const angle = (-135 + (active + progress) * 45) * Math.PI / 180;
    marker.setAttribute('transform', `translate(${450+333*Math.cos(angle)} ${300+222*Math.sin(angle)})`);
  }
  function select(index, manual=false) {
    active = (index + stages.length) % stages.length;
    elapsed = 0;
    const stage = stages[active];
    tabs.forEach((tab,i) => {
      tab.classList.toggle('is-active',i === active);
      tab.setAttribute('aria-selected',String(i === active));
      tab.tabIndex = i === active ? 0 : -1;
    });
    $('#stage-title').textContent = stage.name;
    $('#stage-strength').textContent = stage.strength;
    $('#stage-panel').setAttribute('aria-labelledby',`stage-${active}`);
    range.value = String(active); range.setAttribute('aria-valuetext', stage.name);
    $('#stage-count').textContent = `${active+1} / ${stages.length}`;
    details(stage); placeMarker(0);
    panel.classList.remove('is-changing');
    requestAnimationFrame(() => panel.classList.add('is-changing'));
    if(manual) {
      setPlaying(false);
      $('#cycle-announcement').textContent = `${stage.name}. ${stage.strength} ${stage.proof}.`;
    }
  }
  function setPlaying(value) {
    playing = value && !media.matches;
    $('#play').setAttribute('aria-pressed',String(playing));
    $('#play-label').textContent = playing ? 'Pausar' : 'Reproducir';
    $('#play-icon').textContent = playing ? 'Ⅱ' : '▷';
    $('#play').disabled = media.matches;
    $('#play').title = media.matches ? 'Movimiento reducido activado: usa las etapas o las flechas.' : '';
    last = 0;
    if(playing) schedule();
    else {cancelAnimationFrame(raf);raf=0;}
  }
  function schedule() {if(!raf && playing && visible && !document.hidden) raf=requestAnimationFrame(tick);}
  function tick(now) {
    raf=0;
    if(!playing || !visible || document.hidden) {last=0;return;}
    if(last) elapsed += Math.min(now-last,100);
    last=now;
    if(elapsed >= duration) select(active+1);
    placeMarker(elapsed/duration);
    schedule();
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener('click',()=>select(i,true));
    tab.addEventListener('keydown',event => {
      let target;
      if(event.key === 'ArrowRight' || event.key === 'ArrowDown') target = active+1;
      else if(event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = active-1;
      else if(event.key === 'Home') target=0;
      else if(event.key === 'End') target=stages.length-1;
      if(target !== undefined) {event.preventDefault();select(target,true);tabs[active].focus();}
    });
  });
  $('#previous').addEventListener('click',()=>select(active-1,true));
  $('#next').addEventListener('click',()=>select(active+1,true));
  range.addEventListener('input',()=>select(Number(range.value),true));
  $('#play').addEventListener('click',()=>setPlaying(!playing));
  $('#start-tour').addEventListener('click',()=>{select(0);setPlaying(true);$('#ciclo').focus({preventScroll:true});});
  media.addEventListener('change',()=>setPlaying(!media.matches));
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else schedule();});
  const visibility = new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;last=0;
    if(visible) schedule(); else {cancelAnimationFrame(raf);raf=0;}
  },{threshold:.15});
  visibility.observe($('#ciclo'));

  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const category=button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('is-active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    let count=0;
    document.querySelectorAll('.tool').forEach(item=>{item.hidden=category!=='all' && item.dataset.category!==category;if(!item.hidden) count++;});
    $('#filter-announcement').textContent=`${count} herramientas. ${button.textContent}.`;
  }));

  const reveal = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('has-entered');reveal.unobserve(entry.target);}
  }),{threshold:.12});
  document.querySelectorAll('[data-reveal]').forEach((el,i)=>{el.style.setProperty('--reveal-delay',`${i%4*70}ms`);reveal.observe(el);});
  select(0);setPlaying(playing);
})();
