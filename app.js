var pmx = require('pmx');
var pm2 = require('pm2');
var loggly = require('loggly');

function parseData(data) {
  data = data
    .replace(/\n$/,'')
    .replace(/\u001b\[(?:.*?m)?/g, '');
  try {
    return eval('(' + data + ')');
  } catch (err) {
    try {
      return JSON.parse(data);
    } catch (err) {
      return '' + data;
    }
  }
}

function getLogglyMeta(level, data) {
  var log = parseData(data);
  var meta = {
    timestamp: (new Date()).toISOString(),
    level: level,
  };
  if (typeof log === 'object') {
    meta.json = log;
  } else {
    meta.message = log;
  }
  return meta;
}

pmx.initModule(
  {
    widget: {
      logo: 'https://app.keymetrics.io/img/logo/keymetrics-300.png',
      theme: ['#141A1F', '#222222', '#3ff', '#3ff'],
      el: {
        probes: false,
        actions: false,
      },
      block: {
        actions: true,
        issues: false,
        meta: false,
      },
    },
  },
  function(err, conf) {

    var options = conf;
    options.logglyClient.json = true;
    options.logglyClient.tags = options.logglyClient.tags.split(',');
    options.pm2Apps = options.pm2Apps.split(',');
    var client = loggly.createClient(options.logglyClient);

    pm2.connect(function(err) {
      if (err) return console.error('PM2 Loggly:', err.stack || err);
      pm2.launchBus(
        function(err, bus) {
          if (err) return console.error('PM2 Loggly:', err);

          console.log('PM2 Loggly: Bus connected');

          bus.on('log:out', function(log) {
            if (log.process.name !== 'pm2-loggly') {
              if (options.pm2Apps.indexOf(log.process.name) > -1) {
                console.log(log.data);
                client.log(
                  getLogglyMeta('info', log.data),
                  [log.process.name]
                );
              }
            }
          });

          bus.on('log:err', function(log) {
            if (log.process.name !== 'pm2-loggly') {
              if (options.pm2Apps.indexOf(log.process.name) > -1) {
                console.error(log.data);
                client.log(
                  getLogglyMeta('error', log.data),
                  [log.process.name]
                );
              }
            }
          });

          bus.on('reconnect attempt', function() {
            console.log('PM2 Loggly: Bus reconnecting');
          });

          bus.on('close', function() {
            console.log('PM2 Loggly: Bus closed');
            pm2.disconnectBus();
          });
        }
      );
    });
  }
);
