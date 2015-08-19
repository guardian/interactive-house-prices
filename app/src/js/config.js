System.config({
  "baseURL": "/",
  "defaultJSExtensions": true,
  "transpiler": "traceur",
  "paths": {
    "github:*": "./src/js/jspm_packages/github/*",
    "npm:*": "./src/js/jspm_packages/npm/*"
  },
  "bundles": {
    "build/main": [
      "src/js/main"
    ]
  }
});

System.config({
  "map": {
    "ded/bowser": "github:ded/bowser@1.0.0",
    "ded/reqwest": "github:ded/reqwest@1.1.5",
    "guardian/iframe-messenger": "github:guardian/iframe-messenger@master",
    "json": "github:systemjs/plugin-json@0.1.0",
    "mbostock/topojson": "github:mbostock/topojson@1.6.19",
    "reqwest": "github:ded/reqwest@1.1.5",
    "text": "github:systemjs/plugin-text@0.0.2",
    "traceur": "github:jmcriffey/bower-traceur@0.0.90",
    "traceur-runtime": "github:jmcriffey/bower-traceur-runtime@0.0.90"
  }
});

