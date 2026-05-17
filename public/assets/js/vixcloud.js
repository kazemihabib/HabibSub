function initEasySubsVixCloud() {
  if (window.jwplayer) {
    const player = window.jwplayer();
    
    player.on('ready', () => {
      const playlist = player.getPlaylist();
      if (playlist && playlist[0]) {
        const playlistUrl = playlist[0].file;
        console.debug("EasySubs: VixCloud playlist found:", playlistUrl);
        window.dispatchEvent(new CustomEvent("esVixCloudPlaylist", { detail: playlistUrl }));
      }
    });

    // If already ready
    const playlist = player.getPlaylist();
    if (playlist && playlist[0]) {
      const playlistUrl = playlist[0].file;
      window.dispatchEvent(new CustomEvent("esVixCloudPlaylist", { detail: playlistUrl }));
    }

    player.on('captionsChanged', (event) => {
      const tracks = player.getAudioTracks();
      const currentTrack = player.getCurrentCaptions();
      const label = player.getCaptionsList()[currentTrack]?.label;
      console.debug("EasySubs: VixCloud captions changed:", label);
      window.dispatchEvent(new CustomEvent("esVixCloudCaptionsChanged", { detail: label }));
    });
  } else {
    setTimeout(initEasySubsVixCloud, 500);
  }
}

initEasySubsVixCloud();
