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
  ]);}

module.exports = { sample };
