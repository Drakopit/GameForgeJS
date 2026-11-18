import { SiteLocalization } from './SiteLocalization.js';

const localization = new SiteLocalization();
localization.Start().catch(error => {
    // The authored Portuguese page remains usable if catalog delivery fails.
    document.querySelector('#site-language').disabled = true;
    document.documentElement.dataset.localeReady = 'failed';
    console.error(error);
});
