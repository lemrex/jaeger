const express = require('express');
const axios = require('axios');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const app = express();
const port = 3001;

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
    [SemanticResourceAttributes.SERVICE_NAME]: 'service-1', // Set your service name here
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',        // Optionally set a version
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

console.log('OpenTelemetry is monitoring your application with service name "service-1"...');

app.get('/', (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /');
  res.json({ message: 'Service 1 is running' });
  span.end();
});

app.get('/service-2', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-2');
  try {
    const response = await axios.get('http://service-2.default.svc.cluster.local:3002/');
    res.json({ message: 'Service 2 responded', data: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Error communicating with Service 2', details: error.message });
  }
  span.end();
});

app.get('/service-3', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-3');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3003/');
    res.json({ message: 'Service 3 responded', data: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Error communicating with Service 3', details: error.message });
  }
  span.end();
});

app.get('/service-3/status', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-3/status');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3003/status');
    res.json({ message: 'Service 3 status', data: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Error communicating with Service 3', details: error.message });
  }
  span.end();
});

app.get('/service-3/items', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-3/items');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3003/items');
    res.json({ message: 'Service 3 items', data: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Error communicating with Service 3', details: error.message });
  }
  span.end();
});

app.get('/service-3/users', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-3/users');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3003/users');
    res.json({ message: 'Service 3 users', data: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Error communicating with Service 3', details: error.message });
  }
  span.end();
});

app.get('/service-3/orders', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-3/orders');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3003/orders');
    res.json({ message: 'Service 3 orders', data: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Error communicating with Service 3', details: error.message });
  }
  span.end();
});

app.get('/service-3/stat', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-3/orders');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3003/orders');
    res.json({ message: 'Service 3 orders', data: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Error communicating with Service 3', details: error.message });
  }
  span.end();
});

app.listen(port, () => {
  console.log(`Service 1 listening at http://localhost:${port}`);
});
