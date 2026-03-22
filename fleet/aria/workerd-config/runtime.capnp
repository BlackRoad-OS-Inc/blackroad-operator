using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
  services = [
    ( name = "stripe",   worker = .stripeWorker ),
    ( name = "router",   worker = .routerWorker ),
    ( name = "gateway",  worker = .gatewayWorker ),
    ( name = "internet", network = (
        allow = ["public", "private", "local"],
        tlsOptions = ( trustBrowserCas = true )
    ) ),
  ],

  sockets = [
    ( name = "stripe-http",  address = "*:9081", http = (), service = "stripe" ),
    ( name = "router-http",  address = "*:9082", http = (), service = "router" ),
    ( name = "gateway-http", address = "*:9083", http = (), service = "gateway" ),
  ]
);

const stripeWorker :Workerd.Worker = (
  modules = [
    ( name = "worker", esModule = embed "stripe-proxy.js" ),
  ],
  compatibilityDate = "2024-12-01",
  globalOutbound = "internet",
);

const routerWorker :Workerd.Worker = (
  modules = [
    ( name = "worker", esModule = embed "router.js" ),
  ],
  compatibilityDate = "2024-12-01",
  globalOutbound = "internet",
);

const gatewayWorker :Workerd.Worker = (
  modules = [
    ( name = "worker", esModule = embed "gateway.js" ),
  ],
  compatibilityDate = "2024-12-01",
  compatibilityFlags = ["nodejs_compat"],
  globalOutbound = "internet",
);
