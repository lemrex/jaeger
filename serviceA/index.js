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

console.log('OpenTelemetry is monitoring your application with service name "service-1"...');

app.get('/', (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /');
  res.send('Service 1 is running');
  span.end();
});

app.get('/service-2', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-2');
  try {
    const response = await axios.get('http://service-2.default.svc.cluster.local:3002/');
    res.send(`Service 2 responded: ${response.data}`);
  } catch (error) {
    res.status(500).send('Error communicating with Service 2');
  }
  span.end();
});

app.get('/service-3', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-2');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3003/');
    res.send(`Service 3 responded: ${response.data}`);
  } catch (error) {
    res.status(500).send('Error communicating with Service 3');
  }
  span.end();
});

app.get('/service-3/status', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-2');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3002/status');
    res.send(`Service 3 responded: ${response.data}`);
  } catch (error) {
    res.status(500).send('Error communicating with Service 3');
  }
  span.end();
});

app.get('/service-3/items', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-2');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3003/items');
    res.send(`Service 3 responded: ${response.data}`);
  } catch (error) {
    res.status(500).send('Error communicating with Service 3');
  }
  span.end();
});

app.get('/service-3/users', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-2');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3003/users');
    res.send(`Service 3 responded: ${response.data}`);
  } catch (error) {
    res.status(500).send('Error communicating with Service 3');
  }
  span.end();
});

app.get('/service-3', async (req, res) => {
  const tracer = provider.getTracer('example-tracer');
  const span = tracer.startSpan('GET /service-2');
  try {
    const response = await axios.get('http://service-3.default.svc.cluster.local:3002/orders');
    res.send(`Service 3 responded: ${response.data}`);
  } catch (error) {
    res.status(500).send('Error communicating with Service 3');
  }
  span.end();
});



app.listen(port, () => {
  console.log(`Service 1 listening at http://localhost:${port}`);
});
