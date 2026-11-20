// Compatibility routing only. New catalog links open a game directly, with no
// intermediate list rendering, iframe or engine/canvas initialization.
const params = new URLSearchParams(location.search), requested = params.get('demo');
try {
    const response = await fetch(new URL('../catalog.json', import.meta.url));
    if (!response.ok)
        throw new Error('Catalog unavailable.');
    const catalog = await response.json();
    const entry = catalog.find(item => item.id === requested || item.aliases?.includes(requested));
    const destination = entry ? new URL('../' + entry.path, import.meta.url) : new URL('../../index.html', import.meta.url);
    params.delete('demo');
    if (!entry && requested && requested !== 'admin')
        params.set('missingDemo', requested);
    destination.search = params.toString();
    destination.hash = entry ? location.hash : '#jogos';
    location.replace(destination.href);
}
catch {
    const link = document.createElement('a');
    link.href = new URL('../../index.html#jogos', import.meta.url).href;
    link.textContent = 'Open the GameForgeJS catalog';
    document.body.append(link);
}
