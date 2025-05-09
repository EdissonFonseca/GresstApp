// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
        failFast: true,
        timeoutInterval: 10000,
        random: false
      },
      clearContext: false // Cambiado a false para mantener el contexto
    },
    jasmineHtmlReporter: {
      suppressAll: false, // Cambiado a false para mostrar todos los resultados
      suppressFailed: false, // Cambiado a false para mostrar las pruebas fallidas
      showColors: true,
      showSpec: true,
      showStack: true
    },
    coverageReporter: {
      dir: path.join(__dirname, './coverage/app'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['kjhtml', 'progress'], // Cambiado el orden para priorizar kjhtml
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
    browserDisconnectTimeout: 10000,
    browserNoActivityTimeout: 30000,
    captureTimeout: 60000,
    processKillTimeout: 2000,
    browserConsoleLogOptions: {
      level: 'debug',
      format: '%b %T: %m',
      terminal: true
    },
    customLaunchers: {
      ChromeDebug: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9222']
      }
    }
  });
};
