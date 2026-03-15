module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // html5-qrcode එකේ source map ignore කරනවා
      webpackConfig.module.rules = webpackConfig.module.rules.map(rule => {
        if (rule.loader && rule.loader.includes('source-map-loader')) {
          rule.exclude = [/node_modules\/html5-qrcode/];
        }
        return rule;
      });
      return webpackConfig;
    }
  }
};