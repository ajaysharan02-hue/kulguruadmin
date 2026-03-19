const listeners = new Set();
let toasts = [];

function emit() {
  for (const l of listeners) l(toasts);
}

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function subscribeToToasts(listener) {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}

export function pushToast({ type = 'success', title, message, duration = 2600 } = {}) {
  const id = makeId();
  const toast = { id, type, title, message, duration };
  toasts = [toast, ...toasts].slice(0, 4);
  emit();

  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  success(message, opts = {}) {
    pushToast({ type: 'success', title: opts.title || 'Saved', message, duration: opts.duration });
  },
  error(message, opts = {}) {
    pushToast({ type: 'error', title: opts.title || 'Error', message, duration: opts.duration || 3600 });
  },
  info(message, opts = {}) {
    pushToast({ type: 'info', title: opts.title || 'Info', message, duration: opts.duration });
  },
};

