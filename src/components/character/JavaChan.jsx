import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useLessonStore from '../../store/lessonStore';
import './JavaChan.css';

/**
 * JavaChan.jsx — Real sprite version
 *
 * Expression → Sprite mapping:
 *   idle        → teaching.png   (relaxed hands-out, default state)
 *   idle-sleep  → idle-sleeping.png  (zzz, shown after inactivity)
 *   happy       → oops.png       (sheepish grin, "good try / almost!")
 *   thinking    → thinking.png   (chin on hand, hint mode)
 *   sad         → frustrated.png (hair-grabbing rage, 5+ wrong attempts)
 *   surprised   → excited.png    (fist pump, great reaction)
 *   domain      → excited.png    (fullscreen fist pump on perfect answer)
 *
 * Background handling:
 *   - teaching.png / thinking.png / frustrated.png → transparent PNG, render normally
 *   - oops.png / idle-sleeping.png / excited.png   → black background PNG,
 *     use mix-blend-mode: screen to drop the black
 */

const SPRITE_MAP = {
  idle:        { src: '/sprites/teaching.png',      blend: false },
  'idle-sleep':{ src: '/sprites/idle-sleeping.png', blend: true  },
  happy:       { src: '/sprites/oops.png',          blend: true  },
  thinking:    { src: '/sprites/thinking.png',       blend: false },
  sad:         { src: '/sprites/frustrated.png',    blend: false },
  surprised:   { src: '/sprites/excited.png',       blend: true  },
  domain:      { src: '/sprites/excited.png',       blend: true  },
};

// How long (ms) of no interaction before she falls asleep
const IDLE_SLEEP_DELAY = 45000;

const JavaChan = () => {
  const {
    javaChanExpression,
    currentDialogue,
    advanceDialogue,
    setExpression,
  } = useLessonStore();

  const [displayExpression, setDisplayExpression] = useState('idle');
  const sleepTimerRef = useRef(null);

  // Sync expression from store, but intercept 'idle' to maybe show sleep
  useEffect(() => {
    if (javaChanExpression !== 'idle') {
      setDisplayExpression(javaChanExpression);
      // Reset sleep timer on any non-idle expression
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = setTimeout(() => {
        // Only sleep if we're back to idle by then
        setDisplayExpression(prev => prev === 'idle' ? 'idle-sleep' : prev);
      }, IDLE_SLEEP_DELAY);
    } else {
      setDisplayExpression('idle');
      // Start sleep countdown
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = setTimeout(() => {
        setDisplayExpression('idle-sleep');
      }, IDLE_SLEEP_DELAY);
    }
    return () => clearTimeout(sleepTimerRef.current);
  }, [javaChanExpression]);

  // Wake up on any user interaction
  useEffect(() => {
    const wake = () => {
      if (displayExpression === 'idle-sleep') {
        setDisplayExpression('idle');
        clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = setTimeout(() => {
          setDisplayExpression('idle-sleep');
        }, IDLE_SLEEP_DELAY);
      }
    };
    window.addEventListener('mousemove', wake);
    window.addEventListener('keydown', wake);
    return () => {
      window.removeEventListener('mousemove', wake);
      window.removeEventListener('keydown', wake);
    };
  }, [displayExpression]);

  const isDomain = displayExpression === 'domain';
  const sprite = SPRITE_MAP[displayExpression] || SPRITE_MAP.idle;

  // Bob animation — only for idle/teaching, not sleep/frustrated
  const shouldBob = ['idle', 'happy', 'surprised'].includes(displayExpression);

  return (
    <>
      {/* ── Domain Expansion Overlay ── */}
      <AnimatePresence>
        {isDomain && (
          <motion.div
            className="domain-expansion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={advanceDialogue}
          >
            {/* Radial glow burst */}
            <div className="domain-glow" />

            <div className="domain-content">
              <motion.div
                className="domain-sprite-wrap"
                initial={{ scale: 0.7, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <img
                  src={sprite.src}
                  alt="Java-chan excited"
                  className="domain-sprite-img"
                  style={sprite.blend ? { mixBlendMode: 'screen' } : {}}
                  draggable={false}
                />
              </motion.div>

              {currentDialogue && (
                <motion.div
                  className="domain-dialogue"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  {currentDialogue}
                </motion.div>
              )}

              <motion.span
                className="domain-tap-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                tap anywhere to continue
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Normal Widget ── */}
      {!isDomain && (
        <div className="javachan-widget">
          {/* Dialogue bubble */}
          <AnimatePresence mode="wait">
            {currentDialogue && (
              <motion.button
                key={currentDialogue}
                className="dialogue-bubble"
                initial={{ opacity: 0, y: 10, scale: 0.93 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                exit={{    opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                onClick={advanceDialogue}
                aria-label="Dismiss dialogue"
              >
                <p>{currentDialogue}</p>
                <span className="dialogue-tail" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Sprite */}
          <motion.div
            className="javachan-sprite-wrap"
            animate={shouldBob ? { y: [0, -5, 0] } : { y: 0 }}
            transition={shouldBob
              ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }
            }
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={displayExpression}
                src={sprite.src}
                alt={`Java-chan ${displayExpression}`}
                className="javachan-sprite-img"
                style={sprite.blend ? { mixBlendMode: 'screen' } : {}}
                draggable={false}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1   }}
                exit={{    opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default JavaChan;
