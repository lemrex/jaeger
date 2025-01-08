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
const port = 3003;

// Middleware for parsing JSON
app.use(express.json());

// Get OTEL_EXPORTER_OTLP_ENDPOINT from environment variables (with a fallback)
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces";

// Configure exporters
const consoleExporter = new ConsoleSpanExporter();
const otlpExporter = new OTLPTraceExporter({
  url: otlpEndpoint, // Use the environment variable for the endpoint
});

// Configure the tracer provider with resource and span attributes
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'service-2', // Set your service name here
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0', // Optionally set a version
  }),
});

provider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter));
provider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter));
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
  res.json({ message: 'Service 3 is running!' });
  span.end();
});

app.get('/status', (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /status');
  res.json({ status: 'Service is up and running', uptime: process.uptime() });
  span.end();
});

app.get('/items', (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /items');
  const items = [
    { id: 1, name: 'Item 1', price: 100 },
    { id: 2, name: 'Item 2', price: 200 },
  ];
  res.json(items);
  span.end();
});

app.get('/users', (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /users');
  const users = [
    { id: 1, name: 'User 1', email: 'user1@example.com' },
    { id: 2, name: 'User 2', email: 'user2@example.com' },
  ];
  res.json(users);
  span.end();
});

app.get('/orders', (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /orders');
  const orders = [
    { id: 1, user: 'User 1', total: 150 },
    { id: 2, user: 'User 2', total: 250 },
  ];
  res.json(orders);
  span.end();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
