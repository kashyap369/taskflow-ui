module.exports = function configureKarma(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['ChromeHeadlessStable'],
    customLaunchers: {
      ChromeHeadlessStable: {
        base: 'ChromeHeadless',
        flags: [
          '--disable-gpu',
          '--disable-gpu-sandbox',
          '--disable-dev-shm-usage',
          '--no-sandbox',
        ],
      },
    },
  });
};
