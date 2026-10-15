// createLifecycle: a tiny pub/sub for signage playback states (play/pause/mute/unmute/timeout)

// apps register handlers via onPlay/onPause/etc.; the host player calls trigger(eventName) to fire them.

export function createLifecycle() {
  const listeners = {
    play: [],
    pause: [],
    mute: [],
    unmute: [],
    timeout: [],
  };

  function onPlay(cb) {
    listeners.play.push(cb);
  }

  function onPause(cb) {
    listeners.pause.push(cb);
  }

  function onMute(cb) {
    listeners.mute.push(cb);
  }

  function onUnmute(cb) {
    listeners.unmute.push(cb);
  }

  function onTimeout(cb) {
    listeners.timeout.push(cb);
  }

  function trigger(eventName) {
    listeners[eventName].forEach((cb) => cb());
  }

  return { onPlay, onPause, onMute, onUnmute, onTimeout, trigger };
}
