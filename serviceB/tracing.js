
// module.exports = setupTracing;
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// Enable diagnostic logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const setupTracing = (serviceName) => {
  console.log(`Setting up tracing for service: ${serviceName}...`);

  const exporter = new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces', // HTTP endpoint for Jaeger
  });

  console.log('Jaeger exporter initialized, preparing SDK configuration.');

  const sdk = new NodeSDK({
    traceExporter: exporter,
    serviceName: serviceName, // Use the provided service name
  });

  // Start the SDK with logging at each step
  try {
    console.log('Starting OpenTelemetry SDK...');
    sdk.start(); // Synchronous call
    console.log(`Tracing initialized successfully for service: ${serviceName}`);
  } catch (err) {
    console.error(`Error initializing tracing for service: ${serviceName}`, err);
  }

  console.log('Tracing setup process completed.');
};

module.exports = setupTracing;
