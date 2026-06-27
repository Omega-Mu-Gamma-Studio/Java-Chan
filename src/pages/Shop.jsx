import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '../hooks/useProgress';
import { WALLPAPERS, OUTFITS, DEFAULT_OUTFIT, DOWNLOADABLE_WALLPAPERS } from '../data/shopItems';
import ProgressBar from '../components/ui/ProgressBar';
import './Shop.css';

/**
 * ShopItemCard
 *
 * Renders one cosmetic. Three possible states:
 *   1. comingSoon  → silhouette preview, "Coming Soon" badge, no equip button
 *   2. locked      → dimmed + 🔒 overlay, no equip button
 *   3. unlocked    → full preview, equip button
 *
 * Thumbnails:
 *   - imageSrc set         → real art, render it directly.
 *   - wallpaper, no art    → CSS gradient placeholder.
 *   - outfit, no art       → Java-chan's "teaching" sprite with the outfit's
 *                            CSS filter tint applied, still recognisably her.
 *   - outfit, comingSoon   → silhouetted teaching sprite (CSS filter: brightness(0))
 */
const ShopItemCard = ({ item, level, equipped, onEquip }) => {
  const unlocked = level >= item.requiredLevel;
  const isEquipped = equipped === item.id;
  const isComingSoon = !!item.comingSoon;

  return (
    <motion.div
      className={`shop-card ${isComingSoon ? 'shop-card--coming-soon' : unlocked ? '' : 'shop-card--locked'} ${isEquipped ? 'shop-card--equipped' : ''}`}
      whileHover={unlocked && !isComingSoon ? { y: -3 } : {}}
      transition={{ duration: 0.15 }}
    >
      <div
        className="shop-card-thumb"
        style={
          item.imageSrc
            ? { backgroundImage: `url(${item.imageSrc})`, backgroundSize: 'cover' }
            : item.type === 'wallpaper'
              ? { background: item.gradient }
              : { background: `radial-gradient(circle at 50% 30%, ${item.accent}22, transparent 70%)` }
        }
      >
        {item.type === 'outfit' && !item.imageSrc && (
          <img
            src="/sprites/teaching.png"
            alt={item.name}
            className={`shop-card-outfit-preview ${isComingSoon ? 'shop-card-outfit-preview--silhouette' : ''}`}
            style={!isComingSoon && item.filter !== 'none' ? { filter: item.filter } : undefined}
            draggable={false}
          />
        )}
        {item.type === 'wallpaper' && (
          <span className="shop-card-emoji">{item.emoji}</span>
        )}

        {/* Coming soon badge — shown instead of lock overlay */}
        {isComingSoon && (
          <div className="shop-card-coming-soon-overlay">
            <span className="shop-card-coming-soon-icon">🎨</span>
            <span className="shop-card-coming-soon-label">Coming Soon</span>
          </div>
        )}

        {/* Lock overlay — only for real items not yet unlocked */}
        {!isComingSoon && !unlocked && (
          <div className="shop-card-lock">
            <span className="shop-card-lock-icon">🔒</span>
            <span className="shop-card-lock-label">Level {item.requiredLevel}</span>
          </div>
        )}

        {isEquipped && unlocked && !isComingSoon && (
          <span className="shop-card-equipped-badge">✓ Equipped</span>
        )}
      </div>

      <div className="shop-card-body">
        <span className="shop-card-name">{item.name}</span>
        <p className="shop-card-desc">{item.description}</p>
      </div>

      <button
        className="btn shop-card-btn btn-ghost"
        disabled
        style={{ opacity: isComingSoon ? 0.5 : undefined }}
      >
        {isComingSoon
          ? '🎨 In the Works'
          : !unlocked
            ? `🔒 Level ${item.requiredLevel}`
            : isEquipped
              ? 'Equipped'
              : 'Equip'}
      </button>
    </motion.div>
  );
};

/**
 * ShopItemCardActive
 *
 * The active (non-coming-soon) variant — keeps btn-primary on unlocked items.
 */
const ShopItemCardActive = ({ item, level, equipped, onEquip }) => {
  const unlocked = level >= item.requiredLevel;
  const isEquipped = equipped === item.id;

  return (
    <motion.div
      className={`shop-card ${unlocked ? '' : 'shop-card--locked'} ${isEquipped ? 'shop-card--equipped' : ''}`}
      whileHover={unlocked ? { y: -3 } : {}}
      transition={{ duration: 0.15 }}
    >
      <div
        className="shop-card-thumb"
        style={
          item.imageSrc
            ? { backgroundImage: `url(${item.imageSrc})`, backgroundSize: 'cover' }
            : item.type === 'wallpaper'
              ? { background: item.gradient }
              : { background: `radial-gradient(circle at 50% 30%, ${item.accent}22, transparent 70%)` }
        }
      >
        {item.type === 'outfit' && !item.imageSrc && (
          <img
            src={item.spriteOverrides?.idle?.src ?? '/sprites/teaching.png'}
            alt={item.name}
            className="shop-card-outfit-preview"
            style={{ filter: item.filter === 'none' ? undefined : item.filter }}
            draggable={false}
          />
        )}
        {item.type === 'wallpaper' && (
          <span className="shop-card-emoji">{item.emoji}</span>
        )}

        {!unlocked && (
          <div className="shop-card-lock">
            <span className="shop-card-lock-icon">🔒</span>
            <span className="shop-card-lock-label">Level {item.requiredLevel}</span>
          </div>
        )}

        {isEquipped && unlocked && (
          <span className="shop-card-equipped-badge">✓ Equipped</span>
        )}
      </div>

      <div className="shop-card-body">
        <span className="shop-card-name">{item.name}</span>
        <p className="shop-card-desc">{item.description}</p>
      </div>

      <button
        className={`btn shop-card-btn ${isEquipped ? 'btn-ghost' : 'btn-primary'}`}
        disabled={!unlocked || isEquipped}
        onClick={() => onEquip(item)}
      >
        {!unlocked ? `🔒 Level ${item.requiredLevel}` : isEquipped ? 'Equipped' : 'Equip'}
      </button>
    </motion.div>
  );
};

/**
 * DownloadWallpaperCard
 *
 * For the "Wallpapers" section — downloadable images, not equippable themes.
 * Three states:
 *   1. comingSoon  → gradient placeholder, "Coming Soon" badge, disabled button
 *   2. locked      → gradient placeholder, lock overlay, disabled button
 *   3. unlocked    → real art (or gradient if imageSrc null), download button
 */
const DownloadWallpaperCard = ({ item, level }) => {
  const unlocked = level >= item.requiredLevel;
  const isComingSoon = !!item.comingSoon;
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    if (!item.imageSrc) return;
    const a = document.createElement('a');
    a.href = item.imageSrc;
    a.download = item.fileName || 'javachan-wallpaper.png';
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <motion.div
      className={`shop-card shop-card--dl ${isComingSoon ? 'shop-card--coming-soon' : unlocked ? '' : 'shop-card--locked'}`}
      whileHover={unlocked && !isComingSoon ? { y: -3 } : {}}
      transition={{ duration: 0.15 }}
    >
      <div
        className="shop-card-thumb"
        style={
          item.imageSrc
            ? { backgroundImage: `url(${item.imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: item.gradient }
        }
      >
        {!item.imageSrc && (
          <span className="shop-card-emoji">{item.emoji}</span>
        )}

        {/* Coming soon badge */}
        {isComingSoon && (
          <div className="shop-card-coming-soon-overlay">
            <span className="shop-card-coming-soon-icon">🎨</span>
            <span className="shop-card-coming-soon-label">Coming Soon</span>
          </div>
        )}

        {/* Lock overlay for real items */}
        {!isComingSoon && !unlocked && (
          <div className="shop-card-lock">
            <span className="shop-card-lock-icon">🔒</span>
            <span className="shop-card-lock-label">Level {item.requiredLevel}</span>
          </div>
        )}
      </div>

      <div className="shop-card-body">
        <span className="shop-card-name">{item.name}</span>
        <p className="shop-card-desc">{item.description}</p>
      </div>

      <button
        className={`btn shop-card-btn ${downloaded ? 'btn-ghost' : 'btn-primary'}`}
        disabled={!unlocked || !item.imageSrc || isComingSoon}
        onClick={handleDownload}
      >
        {isComingSoon
          ? '🎨 In the Works'
          : !unlocked
            ? `🔒 Level ${item.requiredLevel}`
            : downloaded
              ? '✓ Saved!'
              : '⬇ Download'}
      </button>
    </motion.div>
  );
};

const Shop = () => {
  const navigate = useNavigate();
  const {
    level,
    levelProgress,
    xpToNextLevel,
    equippedWallpaper,
    equippedOutfit,
    setWallpaper,
    setOutfit,
    devMaxLevel,
    devResetLevel,
  } = useProgress();

  const [toast, setToast] = useState(null);
  const [devClicks, setDevClicks] = useState(0);

  const handleDevClick = () => {
    const next = devClicks + 1;
    setDevClicks(next);
    if (next >= 3) {
      setDevClicks(0);
      if (level >= 10) {
        devResetLevel();
        setToast('🔽 Dev: Reset to Level 1');
      } else {
        devMaxLevel();
        setToast('🔼 Dev: Max Level Unlocked!');
      }
      setTimeout(() => setToast(null), 2000);
    }
  };

  // Only count real (non-coming-soon) items toward the unlocked tally
  const realItems = [...WALLPAPERS, ...OUTFITS, ...DOWNLOADABLE_WALLPAPERS].filter((i) => !i.comingSoon);
  const totalUnlocked = realItems.filter((i) => level >= i.requiredLevel).length;
  const totalItems = realItems.length;

  const handleEquip = (item) => {
    if (item.type === 'wallpaper') setWallpaper(item.id);
    else setOutfit(item.id);
    setToast(`${item.name} equipped! ✨`);
    setTimeout(() => setToast(null), 1800);
  };

  // Split into real and coming soon for section rendering
  const realOutfits = OUTFITS.filter((i) => !i.comingSoon);
  const comingSoonOutfits = OUTFITS.filter((i) => i.comingSoon);

  const realWallpapers = WALLPAPERS.filter((i) => !i.comingSoon);
  const comingSoonWallpapers = WALLPAPERS.filter((i) => i.comingSoon);

  const realDownloadables = DOWNLOADABLE_WALLPAPERS.filter((i) => !i.comingSoon);
  const comingSoonDownloadables = DOWNLOADABLE_WALLPAPERS.filter((i) => i.comingSoon);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Home</button>
        <div>
          <h1 className="shop-title" onClick={handleDevClick} style={{ cursor: 'default', userSelect: 'none' }}>
            Closet &amp; Decor
          </h1>
          <p className="shop-subtitle">
            Unlock themes, wallpapers, and outfits as you level up — one per level.
          </p>
        </div>
      </div>

      <div className="shop-level-card">
        <div className="shop-level-row">
          <span className="shop-level-badge">Lv.{level}</span>
          <ProgressBar
            value={levelProgress}
            label={level >= 10 ? 'Max level — everything unlocked' : `${xpToNextLevel} XP to level ${level + 1}`}
          />
        </div>
        <span className="shop-level-count">{totalUnlocked} / {totalItems} unlocked</span>
      </div>

      {/* ── Section 1: Themes ────────────────────────────────── */}
      <section className="shop-section">
        <h2 className="shop-section-title">🎨 Themes</h2>
        <p className="shop-section-note">
          Changes the background of the app. Equip one to set the vibe for your whole session.
        </p>
        <div className="shop-grid">
          {realWallpapers.map((item) => (
            <ShopItemCardActive
              key={item.id}
              item={item}
              level={level}
              equipped={equippedWallpaper}
              onEquip={handleEquip}
            />
          ))}
          {comingSoonWallpapers.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              level={level}
              equipped={equippedWallpaper}
              onEquip={handleEquip}
            />
          ))}
        </div>
      </section>

      {/* ── Section 2: Wallpapers (downloadable) ─────────────── */}
      <section className="shop-section">
        <h2 className="shop-section-title">🖼️ Wallpapers</h2>
        <p className="shop-section-note">
          Downloadable art made for your phone or desktop. Unlock them as you level up, then save them straight to your device.
        </p>
        <div className="shop-grid">
          {realDownloadables.map((item) => (
            <DownloadWallpaperCard key={item.id} item={item} level={level} />
          ))}
          {comingSoonDownloadables.map((item) => (
            <DownloadWallpaperCard key={item.id} item={item} level={level} />
          ))}
        </div>
      </section>

      {/* ── Section 3: Default Outfit ────────────────────────── */}
      <section className="shop-section">
        <h2 className="shop-section-title">🧡 Default Outfit</h2>
        <p className="shop-section-note">
          Java-chan's signature look — always available, can't be removed.
        </p>
        <div className="shop-grid">
          <motion.div
            className="shop-card shop-card--equipped shop-card--default"
            style={{ cursor: 'default' }}
          >
            <div
              className="shop-card-thumb"
              style={{ background: `radial-gradient(circle at 50% 30%, ${DEFAULT_OUTFIT.accent}22, transparent 70%)` }}
            >
              <img
                src={DEFAULT_OUTFIT.spriteOverrides?.idle?.src ?? '/sprites/teaching.png'}
                alt={DEFAULT_OUTFIT.name}
                className="shop-card-outfit-preview"
                draggable={false}
              />
              <span className="shop-card-equipped-badge">✓ Default</span>
            </div>
            <div className="shop-card-body">
              <span className="shop-card-name">{DEFAULT_OUTFIT.emoji} {DEFAULT_OUTFIT.name}</span>
              <p className="shop-card-desc">{DEFAULT_OUTFIT.description}</p>
            </div>
            <button
              className={`btn shop-card-btn ${equippedOutfit === DEFAULT_OUTFIT.id ? 'btn-ghost' : 'btn-primary'}`}
              disabled={equippedOutfit === DEFAULT_OUTFIT.id}
              onClick={() => {
                setOutfit(DEFAULT_OUTFIT.id);
                setToast(`${DEFAULT_OUTFIT.name} equipped! 🧡`);
                setTimeout(() => setToast(null), 1800);
              }}
            >
              {equippedOutfit === DEFAULT_OUTFIT.id ? 'Always Equipped' : 'Wear Default'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Section 4: Outfits ───────────────────────────────── */}
      <section className="shop-section">
        <h2 className="shop-section-title">👘 Outfits</h2>
        <p className="shop-section-note">
          Unlock outfits as you level up — equip them to change Java-chan's look across all 75 lessons.
          Some outfits use real art; others are tinted previews until new art arrives.
        </p>
        <div className="shop-grid">
          {realOutfits.map((item) => (
            <ShopItemCardActive
              key={item.id}
              item={item}
              level={level}
              equipped={equippedOutfit}
              onEquip={handleEquip}
            />
          ))}
          {comingSoonOutfits.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              level={level}
              equipped={equippedOutfit}
              onEquip={handleEquip}
            />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="shop-toast"
            initial={{ opacity: 0, y: 16, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 16, x: '-50%' }}
            transition={{ duration: 0.2 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;