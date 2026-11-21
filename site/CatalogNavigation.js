/** Static category groups keep their layout until an explicit filter choice. */
export class CatalogNavigation {
    Start() {
        const buttons = document.querySelectorAll('[data-category]');
        for (const button of buttons) button.addEventListener('click', () => {
            for (const item of buttons) item.setAttribute('aria-pressed',String(item===button));
            for (const group of document.querySelectorAll('[data-group]')) group.hidden=button.dataset.category!=='all'&&group.dataset.group!==button.dataset.category;
        });
        if (new URLSearchParams(location.search).has('missingDemo')) document.querySelector('#catalog-status').hidden=false;
    }
}
