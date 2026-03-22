'use strict';

const si = require('systeminformation');

async function sample() {
  const safe = (fn, fallback = null) => fn().catch(() => fallback);

  const [
    load,
    mem,
    osInfo,
    disks,
    diskLayout,
    diskIO,
    cpuTemp,
    networkStats,
    networkInterfaces,
    processes,
    timeInfo
  ] = await Promise.all([
    safe(() => si.currentLoad()),
    safe(() => si.mem()),
    safe(() => si.osInfo()),
    safe(() => si.fsSize(), []),
    safe(() => si.diskLayout(), []),
    safe(() => si.disksIO()),
    safe(() => si.cpuTemperature()),
    safe(() => si.networkStats(), []),
    safe(() => si.networkInterfaces(), []),
    safe(() => si.processes()),
    safe(() => si.time())
  ]);

  return {
    cpu: {
      avgLoad: load?.avgload ?? null,
      currentLoad: load?.currentload ?? null,
      cores: Array.isArray(load?.cpus)
        ? load.cpus.map((core) => ({
            load: core.load ?? null,
            loadUser: core.load_user ?? null,
            loadSystem: core.load_system ?? null
          }))
        : [],
      temperature: cpuTemp
        ? {
            main: cpuTemp.main ?? null,
            cores: Array.isArray(cpuTemp.cores) ? cpuTemp.cores : []
          }
        : null
    },
    mem: mem
      ? {
          total: mem.total ?? null,
          free: mem.free ?? null,
          used: mem.used ?? null,
          active: mem.active ?? null,
          available: mem.available ?? null,
          swapTotal: mem.swaptotal ?? null,
          swapUsed: mem.swapused ?? null,
          swapFree: mem.swapfree ?? null
        }
      : null,
    load: load
      ? {
          avg1: load.avgload ?? null,
          currentUser: load.currentload_user ?? null,
          currentSystem: load.currentload_system ?? null
        }
      : null,
    os: osInfo
      ? {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          kernel: osInfo.kernel,
          arch: osInfo.arch ?? null,
          uptime: timeInfo?.uptime ?? null
        }
      : null,
    disks: Array.isArray(disks)
      ? disks.map((d) => ({
          fs: d.fs,
          size: d.size,
          used: d.used,
          use: d.use,
          mount: d.mount
        }))
      : [],
    diskLayout: Array.isArray(diskLayout)
      ? diskLayout.map((d) => ({
          name: d.name,
          type: d.type,
          interfaceType: d.interfaceType ?? null,
          size: d.size ?? null
        }))
      : [],
    diskIO: diskIO
      ? {
          readBytes: diskIO.rIO ?? null,
          writeBytes: diskIO.wIO ?? null,
          totalIO: diskIO.tIO ?? null,
          readBytesPerSec: diskIO.rIO_sec ?? null,
          writeBytesPerSec: diskIO.wIO_sec ?? null
        }
      : null,
    network: Array.isArray(networkStats)
      ? networkStats.map((n) => ({
          iface: n.iface,
          operstate: n.operstate,
          rx: {
            bytes: n.rx_bytes ?? null,
            dropped: n.rx_dropped ?? null,
            errors: n.rx_errors ?? null,
            sec: n.rx_sec ?? null
          },
          tx: {
            bytes: n.tx_bytes ?? null,
            dropped: n.tx_dropped ?? null,
            errors: n.tx_errors ?? null,
            sec: n.tx_sec ?? null
          },
          ms: n.ms ?? null
        }))
      : [],
    networkInterfaces: Array.isArray(networkInterfaces)
      ? networkInterfaces.map((n) => ({
          iface: n.iface,
          ip4: n.ip4,
          ip6: n.ip6,
          mac: n.mac,
          speed: n.speed ?? null,
          operstate: n.operstate ?? null,
          type: n.type ?? null,
          internal: n.internal ?? null
        }))
      : [],
    processes: processes
      ? {
          all: processes.all ?? null,
          running: processes.running ?? null,
          blocked: processes.blocked ?? null,
          sleeping: processes.sleeping ?? null,
          unknown: processes.unknown ?? null
        }
      : null,
    time: timeInfo
      ? {
          current: timeInfo.current ?? Date.now(),
          uptime: timeInfo.uptime ?? null,
          timezone: timeInfo.timezone ?? null
        }
      : null,
  const [load, mem, osInfo, disks, networkStats] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.osInfo(),
    si.fsSize(),
    si
      .networkStats()
      .then((stats) => (Array.isArray(stats) ? stats : stats ? [stats] : []))
      .catch(() => [])
  ]);

  const network = networkStats.map((stat) => ({
    iface: stat.iface,
    operstate: stat.operstate,
    rx_sec: stat.rx_sec,
    tx_sec: stat.tx_sec,
    ms: stat.ms
  }));

  return {
    cpu: {
      avgLoad: load.avgload || null,
      currentLoad: load.currentload || null
    },
    mem: {
      total: mem.total,
      free: mem.free,
      used: mem.used,
      active: mem.active
    },
    load: {
      avg1: load.currentload_user || null
    },
    os: {
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      kernel: osInfo.kernel
    },
    disks: disks.map((d) => ({
      fs: d.fs,
      size: d.size,
      used: d.used,
      use: d.use,
      mount: d.mount
    })),
    network,
    t: Date.now()
  };
}

module.exports = { sample };
