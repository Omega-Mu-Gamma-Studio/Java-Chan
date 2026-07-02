# Background music

Drop your friend's track here as:

    public/audio/bgm-main.mp3

That exact filename is what `src/hooks/useBgMusic.js` loads (see the
`BGM_SRC` constant near the top of that file — change it there if you'd
rather use a different filename or an .ogg/.wav file).

It will loop automatically. Browsers block autoplay-with-sound until the
visitor interacts with the page, so the hook retries playback on the
first click/keydown anywhere on the site — no extra code needed.
