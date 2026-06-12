# Soulprint Design Token Package

Built from the Soulprint World Class Brand Book.

## Included files

- `soulprint.design-tokens.json` - full source-of-truth token file.
- `soulprint.tokens.css` - CSS custom properties and Tailwind v4 theme bridge.
- `soulprint.components.css` - optional starter component utility classes.
- `tailwind.config.ts` - Tailwind v3/v4 compatible config extension.
- `soulprint.tokens.ts` - TypeScript token helper for React/Next.js components.
- `Soulprint_Design_Token_Install_Guide.pdf` - step-by-step installation guide.

## Fast install

1. Copy `soulprint.tokens.css` and `soulprint.components.css` into `src/styles/`.
2. Copy `soulprint.design-tokens.json` and `soulprint.tokens.ts` into `src/theme/`.
3. Merge the included `tailwind.config.ts` values into your existing Tailwind config.
4. Import the CSS in your global stylesheet:

```css
@import "../styles/soulprint.tokens.css";
@import "../styles/soulprint.components.css";
```

5. Add the recommended fonts through `next/font/google` or your preferred font loader:
   - Cormorant Garamond
   - Fraunces
   - Plus Jakarta Sans
   - Caveat or Allura

## Brand hierarchy

Use this hierarchy consistently:

```txt
Soulprint - Memories Live On
Created by Chasdo Creative Worldwide LLC
```

For product language, use `Soulprint Profile` in authenticated/admin contexts and `Soulprint` in public-facing customer copy.
