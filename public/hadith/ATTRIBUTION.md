# Hadith data source

**Collection**: An-Nawawi's Forty Hadith (42 hadith, by scholarly convention
— Imam an-Nawawi's famous compilation, one of the most universally taught
hadith collections in Islamic education).

**Content**: Full Arabic text and full English translation for every
hadith, with the narrator chain as given by the compiler.

**Packaged by**: the [`@kazishariar/nawawi-40-hadith-data`](https://www.npmjs.com/package/@kazishariar/nawawi-40-hadith-data)
npm package.

**License**: CC BY 4.0 (confirmed on the npm registry).

## Why this collection and not the full canonical hadith corpus

While researching a full Hadith dataset (Bukhari, Muslim, and the other
canonical collections), the realistic options were either unlicensed
scrapes with no explicit permission to redistribute, or an AGPL-3.0
licensed dataset whose network-copyleft clause would require this whole
app to be open-sourced if shipped with it as-is — a real tradeoff, not
something to inherit by accident.

Nawawi's Forty Hadith is a smaller, extremely well-established, clearly
CC BY 4.0 licensed collection, so it ships as the real starting dataset
here instead. `src/services/hadithService.js` is written so a fuller,
separately-licensed corpus can be swapped in later — see the app's README
for the recommended path (the official Sunnah.com API).
