import {renderScene} from '../opening/screen.js';
import {discussionOpening} from '../opening/content.js';
import {characterArt} from '../../shared/character-art.js';

export function renderPixelAdviceScene(state, title, text) {
  const scene = {id:'pixel-design-advice',title,part:'Before you begin',speaker:'pixel',dialogue:text,portraits:{pixel:characterArt.pixel.pleasant},board:{title,text}};
  const scenario = {title:'Design with Babbage',characters:{pixel:discussionOpening.characters.pixel},scenes:[scene]};
  const navigation = '<nav class="scene-actions" aria-label="Pixel advice navigation"><button type="button" class="nav-button nav-button--back" data-action="design-back"><span>Back to my work</span></button><span class="navigation-hint">Read Pixel’s advice, then continue to your activity.</span><button type="button" class="primary nav-button nav-button--next" data-action="design-next"><span>Continue</span></button></nav>';
  return renderScene(scenario,scene,state,0,{stage:'dialogue',titleId:'setup-title',className:'pixel-advice-scene',progressLabel:'Step '+(state.designStep+1)+' of 5',navigation});
}
