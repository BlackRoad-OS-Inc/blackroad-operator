import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Redirect www to root
    if (url.hostname === 'www.aliceqi.com') {
      url.hostname = 'aliceqi.com';
      return Response.redirect(url.toString(), 301);
    }

    try {
      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
          mapRequestToAsset: (req) => {
            const u = new URL(req.url);
            // Serve index.html for all paths
            u.pathname = '/index.html';
            return new Request(u.toString(), req);
          },
        }
      );
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  },
};
