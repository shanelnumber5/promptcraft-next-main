import { campusSignature } from '../shared/lab-visuals.js';
import { rememberPath } from '../features/workspace/storage.js';
import { infoPages, renderInfoNavigation } from '../features/entry/info-screen.js';
const params = new URLSearchParams(window.location.search);
const requested = params.get('view');
const view = ['home', 'play', 'lab', 'workspace', 'scenario', 'guide', ...infoPages.map(([id]) => id)].includes(requested) ? requested : 'home';
document.body.dataset.appView = view==='scenario' ? 'workspace' : view;
const app = document.getElementById('app');
if (['home', 'guide', ...infoPages.map(([id]) => id)].includes(view)) document.body.dataset.infoReader = '';
if (['home', 'guide'].includes(view) || infoPages.some(([id]) => id === view)) {
  document.querySelector('.header-actions a[href="?view=home"]').hidden = true;
  document.querySelector('.header-actions').insertAdjacentHTML('beforeend', campusSignature());
  app.insertAdjacentHTML('beforebegin', renderInfoNavigation(view));
  // Switch information tabs in place instead of loading a second page/menu.
  // Keep normal navigation for other experiences and modified clicks.
  document.querySelector('.info-nav-select')?.addEventListener('change', event => {
    const destination = new URL(window.location.href);
    destination.searchParams.set('view', event.target.value);
    const matchingLink = document.querySelector(`.info-nav a[href="?view=${event.target.value}"]`);
    if (matchingLink && infoPages.some(([id]) => id === event.target.value) && infoPages.some(([id]) => id === document.body.dataset.appView)) matchingLink.click();
    else window.location.href = destination.href;
  });
}
const restart = document.querySelector('[data-action="restart-module"]');
if (params.get('mockBabbage') === '1') document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="?"]');
  if (!link) return;
  const url = new URL(link.href);
  url.searchParams.set('mockBabbage', '1');
  link.href = url.href;
});
if (restart) restart.hidden = view !== 'play';
document.querySelector('.skip-link')?.setAttribute('href', view === 'play' ? '#scene-title' : ['workspace','scenario'].includes(view) ? '#setup-title' : '#entry-title');
if (view === 'play') {
  rememberPath('play');
  const {readScenarioStudio}=await import('../features/workspace/scenario-storage.js');
  const scenarioState=readScenarioStudio();
  if(!scenarioState.needsIntro || scenarioState.error) {
    const destination=new URL(window.location.href);destination.searchParams.set('view','scenario');
    window.location.replace(destination);
  } else await import('./app.js');
} else if (view === 'workspace' || view === 'scenario') {
  rememberPath(view==='scenario'?'play':'workspace');
  const { mountWorkspace } = await import('../features/workspace/controller.js');
  mountWorkspace(app, params,{scenario:view==='scenario'});
} else {
  const references = document.querySelector('[data-action="open-references"]');
  if (references) references.hidden = true;
  if (view === 'guide') {
    const { mountCourseGuide } = await import('../features/entry/guide-screen.js');
    mountCourseGuide(app);
  } else if (infoPages.some(([id]) => id === view) || view === 'home') {
    const { mountInformation } = await import('../features/entry/controller.js');
    mountInformation(app, view);
  }
  else {
    const { mountIdeaLab } = await import('../features/idea-lab/controller.js');
    mountIdeaLab(app, params);
  }
}

const pageHeading = app.querySelector('h1');
if (pageHeading) document.title = `PromptCraft | ${pageHeading.textContent.trim()}`;
