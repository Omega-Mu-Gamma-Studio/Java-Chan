import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useLessonStore from '../../store/lessonStore';
import './JavaChan.css';

/**
 * JavaChan.jsx
 * 
 * The character component. Always visible at bottom-right.
 * 
 * Expressions: idle | happy | sad | thinking | surprised | domain
 * 
 * Phase 1: uses emoji/CSS placeholder
 * Phase 3: swap sprite src to Live2D canvas
 * 
 * The ONLY thing that changes in Phase 3 is what's inside .javachan-sprite.
 * All the surrounding logic (dialogue, domain expansion, expressions) stays.
 */

// Placeholder sprites — replace with real art paths when commissioned
const SPRITE_MAP = {
  idle:      null, // null = use emoji placeholder
  happy:     null,
  sad:       null,
  thinking:  null,
  surprised: null,
  domain:    null,
};

const EMOJI_MAP = {
  idle:      '(´• ω •`)',
  happy:     '(＾▽＾)',
  sad:       '(ｔ ﹏ ｔ)',
  thinking:  '(´･_･`)?',
  surprised: '(⊙_⊙)!',
  domain:    '✦ (ᗒᗨᗕ) ✦',
};

const JavaChan = () => {
  const { javaChanExpression, currentDialogue, advanceDialogue } = useLessonStore();
  const [idleFrame, setIdleFrame] = useState(0);

  const isDomain = javaChanExpression === 'domain';

  // Idle animation — alternates between 2 poses every 2s
  useEffect(() => {
    if (javaChanExpression !== 'idle') return;
    const interval = setInterval(() => {
      setIdleFrame(f => (f + 1) % 2);
    }, 2000);
    return () => clearInterval(interval);
  }, [javaChanExpression]);

  const spriteSrc = SPRITE_MAP[javaChanExpression];

  return (
    <>
      {/* Domain Expansion overlay */}
      <AnimatePresence>
        {isDomain && (
          <motion.div
            className="domain-expansion"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={advanceDialogue}
          >
            <div className="domain-content">
              <div className="domain-sprite">
                {spriteSrc
                  ? <img src={spriteSrc} alt="Java-chan domain expansion" />
                  : <span className="domain-emoji">{EMOJI_MAP.domain}</span>
                }
              </div>
              {currentDialogue && (
                <motion.div
                  className="domain-dialogue"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentDialogue}
                </motion.div>
              )}
              <span className="domain-tap-hint">tap to continue</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Normal character widget */}
      {!isDomain && (
        <div className="javachan-widget">
          {/* Dialogue bubble */}
          <AnimatePresence mode="wait">
            {currentDialogue && (
              <motion.div
                key={currentDialogue}
                className="dialogue-bubble"
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={advanceDialogue}
              >
                <p>{currentDialogue}</p>
                <span className="dialogue-tail" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character sprite / placeholder */}
          <motion.div
            className={`javachan-sprite javachan-sprite--${javaChanExpression} javachan-idle-${idleFrame}`}
            animate={javaChanExpression === 'idle'
              ? { y: [0, -4, 0] }
              : { y: 0 }
            }
            transition={javaChanExpression === 'idle'
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : {}
            }
          >
            {spriteSrc
              ? <img src={spriteSrc} alt={`Java-chan ${javaChanExpression}`} draggable={false} />
              : (
                <div className="javachan-placeholder">
                  <span className="javachan-emoji">{EMOJI_MAP[javaChanExpression] || EMOJI_MAP.idle}</span>
                  <span className="javachan-name">Java-chan</span>
                </div>
              )
            }
          </motion.div>
        </div>
      )}
    </>
  );
};

export default JavaChan;
