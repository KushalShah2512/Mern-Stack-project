module.exports = function override(config) {
  config.ignoreWarnings = [
    {
      module: /timeago\.js/,
    },
  ];
  return config;
};
