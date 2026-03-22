/**
 * Error UI
 */

const errorQueue = [];
const MAX_ERRORS = 3;

export function createErrorUI(errorContext) {
  errorQueue.push(errorContext);
  if (errorQueue.length > MAX_ERRORS) {
    errorQueue.shift();
  }

  const existing = document.querySelectorAll('.error-toast');
  existing.forEach(el => el.remove());

  errorQueue.forEach((err, index) => {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.setAttribute('data-error-id', err.id);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const severityClass = err.severity === 'fatal' ? 'error-fatal' :
      err.severity === 'error' ? 'error-error' :
        err.severity === 'warning' ? 'error-warning' : 'error-info';
    toast.classList.add(severityClass);

    const icon = err.severity === 'fatal' ? '\u{1F480}' :
      err.severity === 'error' ? '\u274C' :
        err.severity === 'warning' ? '\u26A0\uFE0F' : '\u2139\uFE0F';

    // Header
    const header = document.createElement('div');
    header.className = 'error-header';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'error-icon';
    iconSpan.textContent = icon;
    header.appendChild(iconSpan);

    const codeSpan = document.createElement('span');
    codeSpan.className = 'error-code';
    codeSpan.textContent = err.code;
    header.appendChild(codeSpan);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'error-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '\u00D7';
    header.appendChild(closeBtn);

    toast.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'error-body';

    const title = document.createElement('div');
    title.className = 'error-title';
    title.textContent = err.userMessage;
    body.appendChild(title);

    const explanation = document.createElement('div');
    explanation.className = 'error-explanation';
    explanation.textContent = err.explanation;
    body.appendChild(explanation);

    toast.appendChild(body);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'error-actions';

    err.recovery.forEach(action => {
      const btn = document.createElement('button');
      btn.className = 'error-action-btn';
      btn.dataset.action = action.type;
      btn.textContent = action.label;
      actions.appendChild(btn);
    });

    toast.appendChild(actions);

    toast.style.top = `${10 + index * 120}px`;
    toast.style.right = '10px';

    closeBtn.addEventListener('click', () => {
      toast.remove();
      const idx = errorQueue.findIndex(e => e.id === err.id);
      if (idx > -1) errorQueue.splice(idx, 1);
    });

    const actionBtns = toast.querySelectorAll('.error-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        btn.disabled = true;
        btn.textContent = 'Processing...';

        try {
          if (window.electronAPI && window.electronAPI.executeRecoveryAction) {
            const result = await window.electronAPI.executeRecoveryAction(err.id, action);
            if (result.success) {
              btn.textContent = '\u2713 Done';
              setTimeout(() => {
                toast.remove();
                const idx = errorQueue.findIndex(e => e.id === err.id);
                if (idx > -1) errorQueue.splice(idx, 1);
              }, 1500);
            } else {
              btn.textContent = '\u2717 Failed';
              setTimeout(() => {
                btn.disabled = false;
                btn.textContent = action;
              }, 2000);
            }
          }
        } catch (e) {
          console.error('[ErrorUI] Failed to execute recovery action:', e);
          btn.textContent = '\u2717 Error';
          setTimeout(() => {
            btn.disabled = false;
            btn.textContent = action;
          }, 2000);
        }
      });
    });

    document.body.appendChild(toast);
  });
}
