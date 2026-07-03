# Background music

`bgm-main.mpeg` is Java-chan's official BGM track, composed by
Aaron Felix J, Omega Mu Gamma Studio's Music Director.

That exact filename is what `src/hooks/useBgMusic.js` loads (see the
`BGM_SRC` constant near the top of that file — change it there if you'd
rather swap in a different filename or an .ogg/.wav file).

It loops automatically. Browsers block autoplay-with-sound until the
visitor interacts with the page, so the hook retries playback on the
first click/keydown anywhere on the site — no extra code needed.
