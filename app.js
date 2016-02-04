var pmx = require('pmx');
var pm2 = require('pm2');
var winston = require('winston');
require('winston-loggly');

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
    options.logglyClient.tags = options.logglyClient.tags.split(',');
    options.pm2Apps = options.pm2Apps.split(',');
    winston.add(winston.transports.Loggly, options.logglyClient);

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
                winston.log('info', log.data, { tags: [log.process.name] });
              }
            }
          });

          bus.on('log:err', function(log) {
            if (log.process.name !== 'pm2-loggly') {
              if (options.pm2Apps.indexOf(log.process.name) > -1) {
                console.error(log.data);
                winston.log('error', log.data, { tags: [log.process.name] });
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
