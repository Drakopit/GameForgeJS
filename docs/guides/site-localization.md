# Presentation-page languages

The landing page supports Portuguese (pt-BR) and English (en). Choose a language
in the header or share `?lang=en` / `?lang=pt-BR`. An explicit URL wins over the
stored preference. With neither set, the authored Portuguese page is used.

SiteLocalization loads site/locales/pt-BR.json and en.json and applies textContent
to data-i18n labels. It also updates document language, title, description, image
alternatives and accessible navigation names. Code examples and product names stay
unchanged. Language choices are stored locally; blocked storage still permits the
URL and selector to work. If catalog loading fails, the authored page stays usable.

To add a language, create a catalog with the same keys, register its locale in
SiteLocalization.supported and add its named option to the header selector. Keep
the Portuguese fallback in index.html when editing copy. No framework renderer or
game initialization depends on site translation code. This does not translate the
games or the English-canonical documentation.

Catalog tests verify key coverage. Browser checks exercise both languages on desktop
and mobile, changing/persisting preferences, URL override, image loading and layout.
