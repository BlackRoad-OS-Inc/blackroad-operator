/**
 * BlackRoad OS — Google Drive Background Loader
 *
 * Drop-in script for any static site to load photo backgrounds from Google Drive
 * via the blackroad-backgrounds worker.
 *
 * Usage (in HTML):
 *   <script src="../_shared/backgrounds.js"></script>
 *
 * Or with a custom worker URL:
 *   <script data-worker="https://custom-url.workers.dev" src="../_shared/backgrounds.js"></script>
 *
 * The script:
 *   1. Fetches the active background config from the worker
 *   2. If an image is set, creates a fixed <div class="drive-bg"> behind all content
 *   3. Pairs with .drive-bg styles in design.css
 */
;(function () {
  'use strict'

  var scriptTag = document.currentScript
  var workerUrl =
    (scriptTag && scriptTag.getAttribute('data-worker')) ||
    'https://blackroad-backgrounds.blackroad.workers.dev'

  function applyBackground(config) {
    if (!config || config.mode !== 'image' || !config.fileId) return

    var el = document.createElement('div')
    el.className = 'drive-bg'
    el.setAttribute('aria-hidden', 'true')
    el.style.backgroundImage =
      'url(' + workerUrl + '/backgrounds/' + config.fileId + ')'

    if (config.opacity != null) {
      el.style.opacity = String(config.opacity)
    }
    if (config.blur > 0) {
      el.style.filter = 'blur(' + config.blur + 'px)'
    }
    if (config.fit) {
      el.setAttribute('data-fit', config.fit)
    }

    document.body.insertBefore(el, document.body.firstChild)
  }

  function load() {
    fetch(workerUrl + '/backgrounds/config')
      .then(function (res) {
        return res.ok ? res.json() : null
      })
      .then(function (config) {
        if (config) applyBackground(config)
      })
      .catch(function () {
        // Worker unavailable — no background, silent fail
      })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load)
  } else {
    load()
  }
})()
