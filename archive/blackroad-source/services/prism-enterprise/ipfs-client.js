let modulePromise;

async function loadModule() {
  if (!modulePromise) {
    modulePromise = import('ipfs-http-client').catch((err) => {
      modulePromise = null;
      throw err;
    });
  }
  return modulePromise;
}

async function getIpfsClient(url) {
  const mod = await loadModule();
  if (!mod?.create) {
    throw new Error('ipfs-http-client missing create export');
  }
  return mod.create({ url });
}

module.exports = {
  getIpfsClient,
};
