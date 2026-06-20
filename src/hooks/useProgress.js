import useProgressStore from '../store/progressStore';

/**
 * useProgress()
 * 
 * Convenience hook — exposes the most commonly needed
 * progress values and actions without importing the full store.
 */
export function useProgress() {
  const store = useProgressStore();

  return {
    xp: store.xp,
    level: store.level,
    levelProgress: store.getLevelProgress(),
    xpToNextLevel: store.getXPToNextLevel(),
    lastVisited: store.lastVisited,
    unlockedUnits: store.unlockedUnits,
    equippedWallpaper: store.equippedWallpaper,
    equippedOutfit: store.equippedOutfit,

    isCompleted: store.isCompleted,
    isUnitUnlocked: store.isUnitUnlocked,
    getAttempts: store.getAttempts,
    hasReward: store.hasReward,

    completeLesson: store.completeLesson,
    recordAttempt: store.recordAttempt,
    setLastVisited: store.setLastVisited,
    collectReward: store.collectReward,
    unlockUnit: store.unlockUnit,
    setWallpaper: store.setWallpaper,
    setOutfit: store.setOutfit,

    // Dev only — wired to triple-click on level badge in Shop
    devMaxLevel: store.devMaxLevel,
    devResetLevel: store.devResetLevel,
  };
}