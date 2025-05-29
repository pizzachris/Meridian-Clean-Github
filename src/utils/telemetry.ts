import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource, detectResources } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

class TelemetryService {
  private static instance: TelemetryService;
  private sdk: NodeSDK | null = null;

  private constructor() {}

  static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  async init(): Promise<NodeSDK | null> {
    if (this.sdk) return this.sdk;

    try {
      const baseResource = await detectResources();

      this.sdk = new NodeSDK({
        resource: baseResource,
        spanProcessor: new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
            headers: {
              'api-key': process.env.OTEL_API_KEY || ''
            }
          })
        )
      });

      await this.sdk.start();
      return this.sdk;
    } catch (error) {
      console.error('Failed to initialize telemetry:', error);
      return null;
    }
  }
}

export const telemetry = TelemetryService.getInstance();
