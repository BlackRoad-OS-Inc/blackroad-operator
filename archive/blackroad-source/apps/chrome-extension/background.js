// BlackRoad Fleet Monitor - Background Service Worker
const FLEET_API = 'https://blackroad.io/api/fleet'
const NODES = ['alice', 'cecilia', 'octavia', 'lucidia', 'aria']

// Check fleet health every 60 seconds
chrome.alarms.create('fleet-health', { periodInMinutes: 1 })

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'fleet-health') {
    try {
      const health = await checkFleetHealth()
      const down = health.filter(n => !n.alive).length
      if (down > 0) {
        chrome.action.setBadgeText({ text: String(down) })
        chrome.action.setBadgeBackgroundColor({ color: '#FF2255' })
      } else {
        chrome.action.setBadgeText({ text: '' })
      }
      await chrome.storage.local.set({ fleetHealth: health, lastCheck: Date.now() })
    } catch (e) {
      console.error('Fleet health check failed:', e)
    }
  }
})

async function checkFleetHealth() {
  const results = []
  for (const node of NODES) {
    try {
      const res = await fetch(`${FLEET_API}/${node}`, {
        signal: AbortSignal.timeout(5000)
      })
      const data = res.ok ? await res.json() : null
      results.push({ name: node, alive: res.ok, data })
    } catch {
      results.push({ name: node, alive: false, data: null })
    }
  }
  return results
}

// On install, run first check
chrome.runtime.onInstalled.addListener(() => {
  checkFleetHealth().then(health => {
    chrome.storage.local.set({ fleetHealth: health, lastCheck: Date.now() })
  })
})
