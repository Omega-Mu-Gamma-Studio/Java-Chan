/**
 * shopItems.js
 *
 * Defines every cosmetic the player can unlock by leveling up.
 * One item unlocks per level (see MAX_LEVEL in utils/xpCalculator.js),
 * alternating between a wallpaper and a Java-chan outfit.
 *
 * ── PLACEHOLDER ART ──────────────────────────────────────────────
 * `imageSrc` is null for every item below — there's no real art yet.
 *
 *   Wallpapers: the Shop and AppLayout fall back to the CSS `gradient`
 *   string whenever imageSrc is missing.
 *
 *   Outfits: there's no sprite art yet either, so instead of a broken
 *   <img>, both the Shop and JavaChan.jsx apply the outfit's CSS
 *   `filter` (hue-rotate/saturate/etc.) on top of her EXISTING
 *   sprites as a stand-in "alt costume" tint. `spriteOverrides` is
 *   reserved for real art later — shaped like JavaChan's SPRITE_MAP,
 *   e.g. { idle: '/sprites/outfits/hoodie/teaching.png', ... }.
 *
 * ── SWAPPING IN REAL ART LATER ───────────────────────────────────
 * Wallpaper:  set `imageSrc` to a path under /public/sprites/wallpapers/
 * Outfit:     set `spriteOverrides` to a full sprite map (see above)
 *             — once set, it takes priority over the CSS `filter`.
 * No other file needs to change.
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
      idle:         { src: '/sprites/uniforms/casual/teaching.png',   blend: false }, // hands-open presenting = confident idle
      'idle-sleep': { src: '/sprites/uniforms/casual/idle.png',       blend: false }, // hand-on-cheek = sleepy/waiting
      happy:        { src: '/sprites/uniforms/casual/oops.png',       blend: false }, // wave + squiggle = sheepish "almost!"
      thinking:     { src: '/sprites/uniforms/casual/thinking.png',   blend: false }, // finger-to-lip ? = hint mode
      sad:          { src: '/sprites/uniforms/casual/frustrated.png', blend: false }, // double fists + scribble = wrong answer rage
      surprised:    { src: '/sprites/uniforms/casual/excited.png',    blend: false }, // double fist pump = correct!
      domain:       { src: '/sprites/uniforms/casual/excited.png',    blend: false }, // fist pump fullscreen
    },
    imageSrc: null,
    description: 'Off the clock, still ready to debug.',
  },
  {
    id: 'wallpaper-sakura',
    type: 'wallpaper',
    name: 'Sakura Compile',
    requiredLevel: 3,
    emoji: '🌸',
    accent: '#ffaad4',
    gradient: 'linear-gradient(160deg, #2a1a2e 0%, #4a1a3e 55%, #1a0f1a 100%)',
    imageSrc: null,
    description: 'Cherry blossoms drifting past falling code.',
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
    name: 'Neon Server Room',
    requiredLevel: 5,
    emoji: '🌃',
    accent: '#6eb4ff',
    gradient: 'linear-gradient(160deg, #0a0a1f 0%, #0d1b2a 55%, #1a2e4a 100%)',
    imageSrc: null,
    description: 'Humming racks, blue light, 3 a.m. energy.',
  },
  {
    id: 'outfit-magical',
    type: 'outfit',
    name: 'Magical Girl Debugger',
    requiredLevel: 6,
    emoji: '🪄',
    accent: '#ffd700',
    filter: 'hue-rotate(45deg) saturate(1.4) brightness(1.05)',
    spriteOverrides: null,
    imageSrc: null,
    description: 'Transforms bugs into features. Allegedly.',
  },
  {
    id: 'wallpaper-galaxy',
    type: 'wallpaper',
    name: 'Galaxy Stack Overflow',
    requiredLevel: 7,
    emoji: '🌌',
    accent: '#b46eff',
    gradient: 'linear-gradient(160deg, #0a0518 0%, #1a0f3e 55%, #2e1a4a 100%)',
    imageSrc: null,
    description: 'Somewhere out there, someone already asked your question.',
  },
  {
    id: 'outfit-hacker',
    type: 'outfit',
    name: 'Streetwear Hacker',
    requiredLevel: 8,
    emoji: '🕶️',
    accent: '#6effa8',
    filter: 'hue-rotate(210deg) saturate(1.3) contrast(1.05)',
    spriteOverrides: null,
    imageSrc: null,
    description: 'All black, except the glowing green cuffs.',
  },
  {
    id: 'wallpaper-goldenhour',
    type: 'wallpaper',
    name: 'Golden Hour Bytecode',
    requiredLevel: 9,
    emoji: '🌇',
    accent: '#ffcc6e',
    gradient: 'linear-gradient(160deg, #2e1a0a 0%, #4a2e1a 55%, #1a0f0a 100%)',
    imageSrc: null,
    description: 'The sun sets. The build still passes.',
  },
  {
    id: 'outfit-legendary',
    type: 'outfit',
    name: 'Legendary Kimono',
    requiredLevel: 10,
    emoji: '👘',
    accent: '#ff6eb4',
    filter: 'hue-rotate(320deg) saturate(1.5) brightness(1.1)',
    spriteOverrides: null,
    imageSrc: null,
    description: 'For students who reached Level 10. Respect.',
  },
];

export const WALLPAPERS = SHOP_ITEMS.filter((i) => i.type === 'wallpaper');
export const OUTFITS = SHOP_ITEMS.filter((i) => i.type === 'outfit' && !i.isDefault);
export const DEFAULT_OUTFIT = SHOP_ITEMS.find((i) => i.isDefault);

export function getShopItem(id) {
  return SHOP_ITEMS.find((i) => i.id === id) || null;
}