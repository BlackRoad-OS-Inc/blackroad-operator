function createLogger(service) {
  function log(level, msg, data) {
    const entry = {
      ts: new Date().toISOString(),
      service,
      level,
      msg,
      ...data,
    };
    console.log(JSON.stringify(entry));
  }

  return {
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
  };
}

module.exports = { createLogger };
