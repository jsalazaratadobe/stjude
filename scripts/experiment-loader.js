/**
 * Experiment Loader - Handles experimentation engine and UI loading
 * Separates concerns between core experiment logic (always needed) and UI (environment-specific)
 * EDS: legacy overlay before add support on Sidekick
 * XWalk: Universal Editor provides UI loader
 */

import { inUniversalEditor } from './utils.js';

let experimentModule;
let isExperimentationEnabled;

/**
 * Initialize experimentation detection and module loading
 */
async function initExperimentation() {
  isExperimentationEnabled = document.head.querySelector('[name^="experiment"],[name^="campaign-"],[name^="audience-"],[property^="campaign:"],[property^="audience:"]')
    || [...document.querySelectorAll('.section-metadata div')].some((d) => d.textContent.match(/Experiment|Campaign|Audience/i));
  
  if (isExperimentationEnabled) {
    // eslint-disable-next-line import/no-relative-packages
    experimentModule = await import('../plugins/experimentation/src/index.js');
  }
}

/**
 * Load experimentation engine + set up dev MFE communication
 * @param {Document} doc - The document
 * @param {Object} config - Experimentation configuration
 */
export async function loadExperimentationEager(doc, config) {
  await initExperimentation();
  
  if (experimentModule && experimentModule.loadEager) {
    await experimentModule.loadEager(doc, config);
  }
}

/**
 * Load experimentation UI (EDS: legacy overlay before add support on Sidekick)
 * @param {Document} doc - The document  
 * @param {Object} config - Experimentation configuration
 */
export async function loadExperimentationLazy(doc, config) {
  if (!experimentModule || !experimentModule.loadLazy) {
    return;
  }

  // XWalk: Universal Editor provides UI loader
  if (inUniversalEditor()) {
    return;
  }

  // EDS: Load the sidekick UI overlay
  await experimentModule.loadLazy(doc, config);
}
