const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Load the swagger.yaml file
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

const setupSwagger = (app) => {
  // Add JWT authorization support
  swaggerDocument.components = {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  };

  swaggerDocument.security = [
    {
      bearerAuth: [],
    },
  ];

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;
