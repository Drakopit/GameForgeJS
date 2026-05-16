import { IMAGE_MAP } from "./config.js";

export function loadImages(onLoad = null, imageMap = IMAGE_MAP) {
    const images = {};

    for (const [name, path] of Object.entries(imageMap)) {
        const image = new Image();
        image.src = path;
        image.onload = () => onLoad?.();
        image.onerror = () => console.warn("Imagem nao carregada", name, path);
        images[name] = image;
    }

    return images;
}
