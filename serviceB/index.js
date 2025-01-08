const express = require('express');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Create an Express app
const app = express();
const port = 3002;

// Get OTEL_EXPORTER_OTLP_ENDPOINT from environment variables (with a fallback)
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces";

// Configure exporters
const consoleExporter = new ConsoleSpanExporter();
const otlpExporter = new OTLPTraceExporter({
  url: otlpEndpoint,  // Use the environment variable for the endpoint
});

// Configure the tracer provider with resource and span attributes
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'service-2', // Set your service name here
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',        // Optionally set a version
  }),
  spanProcessors: [
    new SimpleSpanProcessor(consoleExporter),
    new SimpleSpanProcessor(otlpExporter),
  ],
});
provider.register();

// Register automatic instrumentation
registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

console.log('OpenTelemetry is monitoring your application with service name "service-2"...');

// Sample routes
app.get('/', (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /');
  res.send('Hello, OpenTelemetry!');
  span.end();
});

app.get('/user/:id', (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /user/:id');
  res.send(`User ID: ${req.params.id}`);
  span.end();
});


app.get('/stat', (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /stat');
  const orders = [
    { id: 1, user: 'alpha', total: 1500 },
    { id: 2, user: 'beta', total: 2500 },
  ];
  res.json(orders);
  span.end();
});


// Start the server
app.listen(3002, () => {
  console.log('Server is running on http://localhost:3002');
});
