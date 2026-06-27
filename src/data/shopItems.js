/**
 * shopItems.js
 *
 * Defines every cosmetic the player can unlock by leveling up.
 * One item unlocks per level (see MAX_LEVEL in utils/xpCalculator.js),
 * alternating between a wallpaper and a Java-chan outfit.
 *
 * ── ART STATUS ───────────────────────────────────────────────────
 * Wallpapers: all placeholders (CSS gradients, `imageSrc: null`).
 *
 * Outfits: real sprite art lives under /public/sprites/uniforms/<name>/,
 * one PNG per expression (teaching/idle/oops/thinking/frustrated/excited),
 * referenced via `spriteOverrides` — shaped exactly like JavaChan.jsx's
 * SPRITE_MAP ({ idle: { src, blend }, ... }). Real-art outfits also set
 * `filter: 'none'` since the tint was only ever a stand-in.
 *
 *   ✅ outfit-default  (always-equipped base look)
 *   ✅ outfit-hoodie   → /sprites/uniforms/casual/
 *   ✅ outfit-school   → /sprites/uniforms/sailor/
 *   ✅ outfit-magical  → /sprites/uniforms/mage/
 *   ⏳ outfit-hacker   → still a CSS filter tint, no art yet
 *   ⏳ outfit-legendary→ still a CSS filter tint, no art yet
 *
 * ── COMING SOON ITEMS ────────────────────────────────────────────
 * Items with `comingSoon: true` are shown as locked preview cards in
 * the shop — visible but not yet equippable. They do NOT count toward
 * the unlocked tally. Set `spriteOverrides: null` for coming-soon outfits;
 * the card will render a silhouetted preview of the base sprite.
 *
 * ── ADDING REAL ART FOR THE REMAINING OUTFITS ────────────────────
 * 1. Drop 6 PNGs under /public/sprites/uniforms/<name>/, named
 *    teaching/idle/oops/thinking/frustrated/excited.png (matches the
 *    pattern of the default sprites at /public/sprites/).
 * 2. Set that item's `spriteOverrides` to the same shape as the ✅
 *    entries above, and set `filter: 'none'`.
 * That's it — Shop.jsx and JavaChan.jsx both already read
 * `spriteOverrides` automatically, no other file needs to change.
 *
 * Wallpapers follow the same idea: set `imageSrc` to a path under
 * /public/sprites/wallpapers/ once art exists.
 */

export const SHOP_ITEMS = [
  {
    id: 'wallpaper-default',
    type: 'wallpaper',
    name: 'Terminal Black',
    requiredLevel: 1,
    emoji: '🖤',
    accent: '#6eb4ff',
    gradient: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
    imageSrc: null,
    description: 'The classic void. Where every student starts.',
  },
  {
    id: 'outfit-default',
    type: 'outfit',
    name: 'Classic Hoodie',
    requiredLevel: 1,
    emoji: '🧡',
    accent: '#ff8c42',
    filter: 'none',
    // The original orange/black hoodie sprites — always equipped by default
    spriteOverrides: {
      idle:         { src: '/sprites/teaching.png',      blend: false },
      'idle-sleep': { src: '/sprites/idle-sleeping.png', blend: true  },
      happy:        { src: '/sprites/oops.png',          blend: true  },
      thinking:     { src: '/sprites/thinking.png',      blend: false },
      sad:          { src: '/sprites/frustrated.png',    blend: false },
      surprised:    { src: '/sprites/excited.png',       blend: true  },
      domain:       { src: '/sprites/excited.png',       blend: true  },
    },
    imageSrc: null,
    description: "Java-chan's signature look. Always with you.",
    isDefault: true, // marks this as the non-equippable base outfit
  },
  {
    id: 'outfit-hoodie',
    type: 'outfit',
    name: 'Casual Hoodie',
    requiredLevel: 2,
    emoji: '🧥',
    accent: '#6eb4ff',
    filter: 'none',
    // Navy blue hoodie + jeans — real casual art
    spriteOverrides: {
      idle:         { src: '/sprites/uniforms/casual/teaching.png',   blend: false },
      'idle-sleep': { src: '/sprites/uniforms/casual/idle.png',       blend: false },
      happy:        { src: '/sprites/uniforms/casual/oops.png',       blend: false },
      thinking:     { src: '/sprites/uniforms/casual/thinking.png',   blend: false },
      sad:          { src: '/sprites/uniforms/casual/frustrated.png', blend: false },
      surprised:    { src: '/sprites/uniforms/casual/excited.png',    blend: false },
      domain:       { src: '/sprites/uniforms/casual/excited.png',    blend: false },
    },
    imageSrc: null,
    description: 'Off the clock, still ready to debug.',
  },
  {
    id: 'wallpaper-sakura',
    type: 'wallpaper',
    name: 'Sakura Study',
    requiredLevel: 3,
    emoji: '🌸',
    accent: '#ffaad4',
    gradient: 'linear-gradient(160deg, #2a1a2e 0%, #4a1a3e 55%, #1a0f1a 100%)',
    imageSrc: null,
    description: 'Java-chan under a cherry blossom tree, textbook in hand.',
  },
  {
    id: 'outfit-school',
    type: 'outfit',
    name: 'School Uniform',
    requiredLevel: 4,
    emoji: '🎀',
    accent: '#b46eff',
    filter: 'none',
    // Sailor uniform real art
    spriteOverrides: {
      idle:         { src: '/sprites/uniforms/sailor/teaching.png',   blend: false },
      'idle-sleep': { src: '/sprites/uniforms/sailor/idle.png',       blend: false },
      happy:        { src: '/sprites/uniforms/sailor/oops.png',       blend: false },
      thinking:     { src: '/sprites/uniforms/sailor/thinking.png',   blend: false },
      sad:          { src: '/sprites/uniforms/sailor/frustrated.png', blend: false },
      surprised:    { src: '/sprites/uniforms/sailor/excited.png',    blend: false },
      domain:       { src: '/sprites/uniforms/sailor/excited.png',    blend: false },
    },
    imageSrc: null,
    description: 'Back to basics, sailor-collar edition.',
  },
  {
    id: 'wallpaper-neon',
    type: 'wallpaper',
    name: 'Neon Night Compile',
    requiredLevel: 5,
    emoji: '🌃',
    accent: '#6eb4ff',
    gradient: 'linear-gradient(160deg, #0a0a1f 0%, #0d1b2a 55%, #1a2e4a 100%)',
    imageSrc: null,
    description: 'Late-night session vibes — city glow, code scrolling.',
  },
  {
    id: 'outfit-magical',
    type: 'outfit',
    name: 'Magical Girl Debugger',
    requiredLevel: 6,
    emoji: '🪄',
    accent: '#ffd700',
    filter: 'none',
    // Real mage art — gold/black sailor-style robe + glowing { / } staff
    spriteOverrides: {
      idle:         { src: '/sprites/uniforms/mage/teaching.png',   blend: false },
      'idle-sleep': { src: '/sprites/uniforms/mage/idle.png',       blend: false },
      happy:        { src: '/sprites/uniforms/mage/oops.png',       blend: false },
      thinking:     { src: '/sprites/uniforms/mage/thinking.png',   blend: false },
      sad:          { src: '/sprites/uniforms/mage/frustrated.png', blend: false },
      surprised:    { src: '/sprites/uniforms/mage/excited.png',    blend: false },
      domain:       { src: '/sprites/uniforms/mage/excited.png',    blend: false },
    },
    imageSrc: null,
    description: 'Transforms bugs into features. Allegedly.',
  },
  {
    id: 'wallpaper-platform-dusk',
    type: 'wallpaper',
    name: 'Platform at Dusk',
    requiredLevel: 7,
    emoji: '🚉',
    accent: '#ffaa44',
    gradient: 'linear-gradient(160deg, #1a0e0a 0%, #3d2210 55%, #2a1508 100%)',
    imageSrc: null,
    description: 'Train pulling in, golden light, the day fading.',
  },
  {
    id: 'outfit-hacker',
    type: 'outfit',
    name: 'Streetwear Hacker',
    requiredLevel: 8,
    emoji: '🕶️',
    accent: '#6effa8',
    filter: 'none',
    spriteOverrides: {
      idle:         { src: '/sprites/uniforms/hacker/teaching.png',   blend: false },
      'idle-sleep': { src: '/sprites/uniforms/hacker/idle.png',       blend: false },
      happy:        { src: '/sprites/uniforms/hacker/oops.png',       blend: false },
      thinking:     { src: '/sprites/uniforms/hacker/thinking.png',   blend: false },
      sad:          { src: '/sprites/uniforms/hacker/frustrated.png', blend: false },
      surprised:    { src: '/sprites/uniforms/hacker/excited.png',    blend: false },
      domain:       { src: '/sprites/uniforms/hacker/excited.png',    blend: false },
    },
    imageSrc: null,
    description: 'All black, except the glowing green cuffs.',
  },
  {
    id: 'wallpaper-goldenhour',
    type: 'wallpaper',
    name: 'Golden Hour Debug',
    requiredLevel: 9,
    emoji: '🌇',
    accent: '#ffcc6e',
    gradient: 'linear-gradient(160deg, #2e1a0a 0%, #4a2e1a 55%, #1a0f0a 100%)',
    imageSrc: null,
    description: 'The build passed at sunset. A perfect moment.',
  },
  {
    id: 'outfit-legendary',
    type: 'outfit',
    name: 'Legendary Kimono',
    requiredLevel: 10,
    emoji: '👘',
    accent: '#ff6eb4',
    filter: 'none',
    spriteOverrides: {
      idle:         { src: '/sprites/uniforms/kimono/teaching.png',   blend: false },
      'idle-sleep': { src: '/sprites/uniforms/kimono/idle.png',       blend: false },
      happy:        { src: '/sprites/uniforms/kimono/oops.png',       blend: false },
      thinking:     { src: '/sprites/uniforms/kimono/thinking.png',   blend: false },
      sad:          { src: '/sprites/uniforms/kimono/frustrated.png', blend: false },
      surprised:    { src: '/sprites/uniforms/kimono/excited.png',    blend: false },
      domain:       { src: '/sprites/uniforms/kimono/excited.png',    blend: false },
    },
    imageSrc: null,
    description: 'For students who reached Level 10. Respect.',
  },
  {
    id: 'wallpaper-track-champion',
    type: 'wallpaper',
    name: 'Track Champion',
    requiredLevel: 11,
    emoji: '🏆',
    accent: '#ffd700',
    gradient: 'linear-gradient(160deg, #1a1a00 0%, #3d2e00 55%, #2a1f00 100%)',
    imageSrc: null,
    description: 'Victory lap, confetti falling, the crowd cheering.',
  },
  {
    id: 'wallpaper-morning-brew',
    type: 'wallpaper',
    name: 'Morning Brew',
    requiredLevel: 13,
    emoji: '☕',
    accent: '#ffaa44',
    gradient: 'linear-gradient(160deg, #1a0e00 0%, #3d2200 55%, #2a1500 100%)',
    imageSrc: null,
    description: 'Café window, early morning, warm steam rising.',
  },
  {
    id: 'wallpaper-convenience-store',
    type: 'wallpaper',
    name: 'Convenience Store Night',
    requiredLevel: 15,
    emoji: '🏪',
    accent: '#ffe066',
    gradient: 'linear-gradient(160deg, #0a0800 0%, #1a1400 55%, #0f0c00 100%)',
    imageSrc: null,
    description: 'Warm konbini light spilling onto a quiet street.',
  },
  {
    id: 'wallpaper-rainy-library',
    type: 'wallpaper',
    name: 'Rainy Afternoon Library',
    requiredLevel: 17,
    emoji: '📚',
    accent: '#cc7744',
    gradient: 'linear-gradient(160deg, #1a0800 0%, #2e1500 55%, #1a0c00 100%)',
    imageSrc: null,
    description: 'Velvet armchair, rain on tall windows, warm lamp light.',
  },
  {
    id: 'wallpaper-beach-day',
    type: 'wallpaper',
    name: 'Beach Day',
    requiredLevel: 19,
    emoji: '🏖️',
    accent: '#ffcc66',
    gradient: 'linear-gradient(160deg, #1a2a3a 0%, #2a4a5a 55%, #1a2a3a 100%)',
    imageSrc: null,
    description: 'Sun, sand, and the sound of waves crashing.',
  },
  {
    id: 'wallpaper-winter-hot-chocolate',
    type: 'wallpaper',
    name: 'Winter Hot Chocolate',
    requiredLevel: 21,
    emoji: '❄️',
    accent: '#a0c8ff',
    gradient: 'linear-gradient(160deg, #0a1020 0%, #0f1830 55%, #080e20 100%)',
    imageSrc: null,
    description: 'Blue-white cold outside, warm amber inside. Fairy lights.',
  },

  // ─── Coming Soon — Outfits ────────────────────────────────────────────────────

  {
    id: 'outfit-barista',
    type: 'outfit',
    name: 'Barista',
    requiredLevel: 2,
    emoji: '☕',
    accent: '#d4956a',
    filter: 'none',
    spriteOverrides: null,
    imageSrc: null,
    description: 'Apron, flower in her hair, latte art shaped like the Java logo. The pun was right there.',
    comingSoon: true,
  },
  {
    id: 'outfit-sports-day',
    type: 'outfit',
    name: 'Sports Day',
    requiredLevel: 4,
    emoji: '🏃',
    accent: '#ff7043',
    filter: 'none',
    spriteOverrides: null,
    imageSrc: null,
    description: 'Track jacket, running shorts, ponytail. Competitive energy.',
    comingSoon: true,
  },
  {
    id: 'outfit-off-the-clock',
    type: 'outfit',
    name: 'Off The Clock',
    requiredLevel: 6,
    emoji: '🌞',
    accent: '#ffcc6e',
    filter: 'none',
    spriteOverrides: null,
    imageSrc: null,
    description: 'Cream/orange sundress, relaxed and fully off the clock.',
    comingSoon: true,
  },
  {
    id: 'outfit-winter-coat',
    type: 'outfit',
    name: 'Winter Coat',
    requiredLevel: 8,
    emoji: '🧣',
    accent: '#a8c4e0',
    filter: 'none',
    spriteOverrides: null,
    imageSrc: null,
    description: 'Long warm coat, scarf, earmuffs. Winter-ready.',
    comingSoon: true,
  },
  {
    id: 'outfit-tshirt-shorts',
    type: 'outfit',
    name: 'T-shirt + Shorts',
    requiredLevel: 10,
    emoji: '👕',
    accent: '#ff8c42',
    filter: 'none',
    spriteOverrides: null,
    imageSrc: null,
    description: 'Orange/black tee, grey shorts, sneakers. Casual and comfy.',
    comingSoon: true,
  },
  {
    id: 'outfit-ripped-crop',
    type: 'outfit',
    name: 'Ripped Jeans + Crop Top',
    requiredLevel: 12,
    emoji: '🧢',
    accent: '#6eb4ff',
    filter: 'none',
    spriteOverrides: null,
    imageSrc: null,
    description: 'Black crop top, ripped jeans, baseball hat. Street style.',
    comingSoon: true,
  },
  {
    id: 'outfit-bikini',
    type: 'outfit',
    name: 'Bikini',
    requiredLevel: 14,
    emoji: '🏊',
    accent: '#ff6b6b',
    filter: 'none',
    spriteOverrides: null,
    imageSrc: null,
    description: 'Orange/black bikini, beach ready. Sunscreen not included.',
    comingSoon: true,
  },
];

export const WALLPAPERS = SHOP_ITEMS.filter((i) => i.type === 'wallpaper');
export const OUTFITS = SHOP_ITEMS.filter((i) => i.type === 'outfit' && !i.isDefault);
export const DEFAULT_OUTFIT = SHOP_ITEMS.find((i) => i.isDefault);

/**
 * DOWNLOADABLE_WALLPAPERS
 *
 * These are standalone art pieces the player can save to their device
 * (phone/desktop wallpaper). They are NOT equipped — they have no
 * effect on the app's appearance. The Shop renders a "Download" button
 * that triggers a native download of the image file.
 *
 * Art lives under /public/wallpapers/<filename>.png (or .jpg).
 * Set `imageSrc: null` until real art is ready — the card will show
 * a gradient placeholder with the emoji centered.
 *
 * Fields:
 *   id           – unique string
 *   name         – display name
 *   emoji        – shown in placeholder thumbnail
 *   gradient     – CSS gradient for the placeholder background
 *   accent       – glow / tint color
 *   imageSrc     – path to the downloadable image (null = placeholder)
 *   fileName     – suggested download filename (e.g. "javachan-sakura.png")
 *   description  – flavor text
 *   requiredLevel – unlock gate (same system as themes / outfits)
 *   comingSoon   – if true, shown as a preview card only (not yet downloadable)
 *
 * Design rule: Java-chan belongs in warm worlds. Golden light, lived-in
 * spaces, and ordinary moments that feel like home. When the world is
 * cool, she's the warmth inside it.
 */
export const DOWNLOADABLE_WALLPAPERS = [
  {
    id: 'dl-wallpaper-sakura-study',
    name: 'Java-chan: Sakura Study',
    emoji: '🌸',
    gradient: 'linear-gradient(160deg, #2a1a2e 0%, #4a1a3e 60%, #1a0f1a 100%)',
    accent: '#ffaad4',
    imageSrc: '/wallpapers/sakura-study.png',
    fileName: 'javachan-sakura-study.png',
    description: 'Java-chan under a cherry blossom tree, textbook in hand.',
    requiredLevel: 1,
    outfitUsed: 'Kimono Study',
    hasArt: true,
  },
  {
    id: 'dl-wallpaper-neon-night',
    name: 'Neon Night Compile',
    emoji: '🌃',
    gradient: 'linear-gradient(160deg, #0a0a1f 0%, #0d1b2a 55%, #1a2e4a 100%)',
    accent: '#6eb4ff',
    imageSrc: '/wallpapers/neon-night-compile.png',
    fileName: 'javachan-neon-night.png',
    description: 'Late-night session vibes — city glow, code scrolling.',
    requiredLevel: 3,
    outfitUsed: 'Floral Coding Jacket',
    hasArt: true,
  },
  {
    id: 'dl-wallpaper-platform-dusk',
    name: 'Platform at Dusk',
    emoji: '🚉',
    gradient: 'linear-gradient(160deg, #1a0e0a 0%, #3d2210 55%, #2a1508 100%)',
    accent: '#ffaa44',
    imageSrc: '/wallpapers/Platform at Dusk.png',
    fileName: 'Platform at Dusk.png',
    description: 'Train pulling in, golden light, the day fading.',
    requiredLevel: 5,
    outfitUsed: 'T-shirt + Shorts',
    hasArt: false,
    comingSoon: false,
  },
  {
    id: 'dl-wallpaper-golden-hour',
    name: 'Golden Hour Debug',
    emoji: '🌇',
    gradient: 'linear-gradient(160deg, #2e1a0a 0%, #4a2e1a 55%, #1a0f0a 100%)',
    accent: '#ffcc6e',
    imageSrc: '/wallpapers/Golden Hour Debug.png',
    fileName: 'Golden Hour Debug.png',
    description: 'The build passed at sunset. A perfect moment.',
    requiredLevel: 7,
    outfitUsed: 'Off The Clock',
    hasArt: false,
    comingSoon: false,
  },
  {
    id: 'dl-wallpaper-track-champion',
    name: 'Track Champion',
    emoji: '🏆',
    gradient: 'linear-gradient(160deg, #1a1a00 0%, #3d2e00 55%, #2a1f00 100%)',
    accent: '#ffd700',
    imageSrc: '/wallpapers/Track Champion.png',
    fileName: 'Track Champion.png',
    description: 'Victory lap, confetti falling, the crowd cheering.',
    requiredLevel: 9,
    outfitUsed: 'Sports Day',
    hasArt: false,
    comingSoon: false,
  },
  {
    id: 'dl-wallpaper-morning-brew',
    name: 'Morning Brew',
    emoji: '☕',
    gradient: 'linear-gradient(160deg, #1a0e00 0%, #3d2200 55%, #2a1500 100%)',
    accent: '#ffaa44',
    imageSrc: '/wallpapers/Morning Brew.png',
    fileName: 'Morning Brew.png',
    description: 'Café window, early morning, warm steam rising.',
    requiredLevel: 6,
    outfitUsed: 'Barista',
    hasArt: false,
    comingSoon: false,
  },
  {
    id: 'dl-wallpaper-convenience-store',
    name: 'Convenience Store Night',
    emoji: '🏪',
    gradient: 'linear-gradient(160deg, #0a0800 0%, #1a1400 55%, #0f0c00 100%)',
    accent: '#ffe066',
    imageSrc: '/wallpapers/Convenience Store Night.png',
    fileName: 'Convenience Store Night.png',
    description: 'Warm konbini light spilling onto a quiet street.',
    requiredLevel: 7,
    outfitUsed: 'Ripped Jeans + Crop Top + Hat',
    hasArt: true,
    comingSoon: false,
  },
  {
    id: 'dl-wallpaper-rainy-library',
    name: 'Rainy Afternoon Library',
    emoji: '📚',
    gradient: 'linear-gradient(160deg, #1a0800 0%, #2e1500 55%, #1a0c00 100%)',
    accent: '#cc7744',
    imageSrc: '/wallpapers/Rainy Afternoon Library.png',
    fileName: 'Rainy Afternoon Library.png',
    description: 'Velvet armchair, rain on tall windows, warm lamp light.',
    requiredLevel: 8,
    outfitUsed: 'Default Hoodie',
    hasArt: false,
    comingSoon: false,
  },
  {
    id: 'dl-wallpaper-beach-day',
    name: 'Beach Day',
    emoji: '🏖️',
    gradient: 'linear-gradient(160deg, #1a2a3a 0%, #2a4a5a 55%, #1a2a3a 100%)',
    accent: '#ffcc66',
    imageSrc: '/wallpapers/Beach Day.png',
    fileName: 'Beach Day.png',
    description: 'Sun, sand, and the sound of waves crashing.',
    requiredLevel: 9,
    outfitUsed: 'Bikini',
    hasArt: false,
    comingSoon: false,
  },
  {
    id: 'dl-wallpaper-winter-hot-chocolate',
    name: 'Winter Hot Chocolate',
    emoji: '❄️',
    gradient: 'linear-gradient(160deg, #0a1020 0%, #0f1830 55%, #080e20 100%)',
    accent: '#a0c8ff',
    imageSrc: '/wallpapers/Winter Hot Chocolate.png',
    fileName: 'Winter Hot Chocolate.png',
    description: 'Blue-white cold outside, warm amber inside. Fairy lights.',
    requiredLevel: 10,
    outfitUsed: 'Winter Coat',
    hasArt: false,
    comingSoon: false,
  },
];

export function getShopItem(id) {
  return SHOP_ITEMS.find((i) => i.id === id) || null;
}