import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '../hooks/useProgress';
import { WALLPAPERS, OUTFITS, DEFAULT_OUTFIT } from '../data/shopItems';
import ProgressBar from '../components/ui/ProgressBar';
import './Shop.css';

/**
 * ShopItemCard
 *
 * Renders one cosmetic. If the player's level is below requiredLevel,
 * the card is locked (dimmed + 🔒 overlay, no equip button).
 *
 * Thumbnails:
 *   - imageSrc set         → real art, render it directly.
 *   - wallpaper, no art    → CSS gradient placeholder.
 *   - outfit, no art       → Java-chan's real "teaching" sprite with
 *                            the outfit's CSS filter tint applied, so
 *                            the preview is still recognizably her.
 */
const ShopItemCard = ({ item, level, equipped, onEquip }) => {
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
  } = useProgress();

  const [toast, setToast] = useState(null);

  const totalUnlocked = [...WALLPAPERS, ...OUTFITS].filter(
    (i) => level >= i.requiredLevel
  ).length;
  const totalItems = WALLPAPERS.length + OUTFITS.length;

  const handleEquip = (item) => {
    if (item.type === 'wallpaper') setWallpaper(item.id);
    else setOutfit(item.id);
    setToast(`${item.name} equipped! ✨`);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Home</button>
        <div>
          <h1 className="shop-title">Closet &amp; Decor</h1>
          <p className="shop-subtitle">
            New gear unlocks every level — wallpapers and outfits, one at a time.
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

      <section className="shop-section">
        <h2 className="shop-section-title">🖼️ Wallpapers</h2>
        <div className="shop-grid">
          {WALLPAPERS.map((item) => (
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

      <section className="shop-section">
        <h2 className="shop-section-title">👘 Outfits</h2>
        <p className="shop-section-note">
          Unlock outfits as you level up — equip them to change Java-chan's look.
          Some outfits use real art; others are tinted previews until new art arrives.
        </p>
        <div className="shop-grid">
          {OUTFITS.map((item) => (
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