addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  return new Response(JSON.stringify({
    status: 'online',
    service: 'BlackRoad API',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'content-type': 'application/json' }
  })
}
