/*
 * Configuración de Karma (ejecutor de pruebas) + Jasmine (marco de pruebas).
 *
 *  - Jasmine: define y valida las pruebas (describe / it / expect / spyOn).
 *  - Karma:   levanta un navegador, carga las pruebas y muestra los resultados.
 *  - webpack + Babel: convierten JSX e imports de React a código que el navegador
 *    entiende (Karma no sabe leer JSX por sí solo).
 *  - babel-plugin-istanbul + karma-coverage: miden qué líneas del código se ejecutan
 *    durante las pruebas (cobertura) y generan el reporte en /coverage.
 *
 * Los archivos de prueba se llaman *.spec.js / *.spec.jsx y viven junto al código.
 */
module.exports = function (config) {
  config.set({
    frameworks: ["jasmine", "webpack"],

    files: [
      { pattern: "src/**/*.spec.js", watched: false },
      { pattern: "src/**/*.spec.jsx", watched: false },
    ],

    preprocessors: {
      "src/**/*.spec.js": ["webpack"],
      "src/**/*.spec.jsx": ["webpack"],
    },

    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      resolve: { extensions: [".js", ".jsx"] },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            // package.json declara "type": "module"; sin esto webpack exigiría escribir
            // la extensión en cada import relativo (import "./formato.js").
            resolve: { fullySpecified: false },
            use: {
              loader: "babel-loader",
              options: {
                presets: [
                  ["@babel/preset-env", { targets: { chrome: "100" } }],
                  ["@babel/preset-react", { runtime: "automatic" }],
                ],
                // Instrumenta el código de la app (no los *.spec) para medir cobertura.
                plugins: [["istanbul", { exclude: ["**/*.spec.*", "src/test-utils.jsx"] }]],
              },
            },
          },
        ],
      },
    },

    reporters: ["progress", "coverage"],

    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "html" },
        { type: "text-summary" },
        { type: "lcovonly", subdir: "." },
      ],
    },

    // Navegador por defecto: Chrome sin ventana. Para probar sin Chrome instalado:
    //   npm run test:jsdom   (usa jsdom, un DOM simulado dentro de Node)
    browsers: ["ChromeHeadless"],
    plugins: [
      "karma-jasmine",
      "karma-webpack",
      "karma-coverage",
      "karma-chrome-launcher",
      "karma-jsdom-launcher",
    ],

    singleRun: true,
    restartOnFileChange: true,
  });
};
