// Jasmine + Karma: requerido explícitamente por la evaluación parcial 2.
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine','webpack'],
    files: ['src/tests/index.js',{pattern:'public/assets/**/*',included:false,served:true,watched:false}],
    proxies: {'/assets/':'/base/public/assets/'},
    preprocessors: { 'src/tests/index.js': ['webpack'] },
    webpack: {
      mode: 'development', devtool: 'inline-source-map',
      resolve: { extensions: ['.js', '.jsx'] },
      module: { rules: [{ test: /\.jsx?$/, type: 'javascript/auto', exclude: /node_modules/,
        use: { loader: 'babel-loader', options: {
          presets: [['@babel/preset-env', {targets: 'defaults'}], ['@babel/preset-react', {runtime: 'automatic'}]],
          plugins: [['babel-plugin-istanbul', { exclude: ['**/*.spec.jsx', '**/src/tests/**'] }]]
        }}
      }] },
      stats: 'errors-warnings'
    },
    webpackMiddleware: { stats: 'errors-only' },
    reporters: ['progress', 'coverage'],
    coverageReporter: { dir: 'testing/coverage', reporters: [
      { type: 'html', subdir: 'html' }, { type: 'lcovonly', subdir: '.' },
      { type: 'json', subdir: '.', file: 'coverage-final.json' }, { type: 'text-summary' }, { type: 'json-summary', subdir: '.', file: 'coverage-summary.json' }
    ] },
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: { ChromeHeadlessNoSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox', '--disable-dev-shm-usage'] } },
    singleRun: true,
    browserNoActivityTimeout: 60000,
    client: { captureConsole: true }
  });
};

