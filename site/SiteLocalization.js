/** Small site-local catalog loader; rendering and game modules do not depend on it. */
export class SiteLocalization {
    constructor(root = document, storage) {
        this.root = root;
        try { this.storage = storage ?? globalThis.localStorage; }
        catch { this.storage = null; }
        this.catalogs = new Map();
        this.supported = ['pt-BR', 'en'];
    }

    async Start() {
        await Promise.all(this.supported.map(async locale => {
            const response = await fetch(new URL(`./locales/${locale}.json`, import.meta.url));
            if (!response.ok) throw new Error(`Unable to load site language: ${locale}`);
            this.catalogs.set(locale, await response.json());
        }));
        let preference;
        try { preference = this.storage?.getItem('gameforgejs.site.language'); } catch { /* Private storage may be unavailable. */ }
        const query = new URL(location.href).searchParams.get('lang');
        this.Apply(this.supported.includes(query) ? query : this.supported.includes(preference) ? preference : 'pt-BR');
        this.root.querySelector('#site-language').addEventListener('change', event => this.Apply(event.target.value, true));
        this.root.documentElement.dataset.localeReady = 'true';
    }

    Apply(locale, persist = false) {
        const messages = this.catalogs.get(locale);
        if (!messages) return;
        for (const element of this.root.querySelectorAll('[data-i18n]')) {
            element.textContent = messages[element.dataset.i18n];
        }
        for (const attribute of ['alt', 'aria-label']) {
            for (const element of this.root.querySelectorAll(`[data-i18n-${attribute}]`)) {
                element.setAttribute(attribute, messages[element.getAttribute(`data-i18n-${attribute}`)]);
            }
        }
        this.root.documentElement.lang = locale;
        this.root.title = messages['page.title'];
        this.root.querySelector('meta[name="description"]').content = messages['page.description'];
        this.root.querySelector('#site-language').value = locale;
        if (persist) {
            try { this.storage?.setItem('gameforgejs.site.language', locale); } catch { /* URL still preserves the choice. */ }
            const url = new URL(location.href);
            url.searchParams.set('lang', locale);
            history.replaceState(null, '', url);
        }
    }
}
