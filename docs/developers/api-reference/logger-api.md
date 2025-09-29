---
sidebar_position: 9
---

# Logger API

The Logger API provides a simple, structured logging interface for plugins and host components. It supports leveled logs, named loggers, and optional structured metadata.

## Types (TypeScript)

```ts
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface Logger {
  name: string;
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string | Error, meta?: Record<string, unknown>): void;
  child(name: string): Logger;
}
```

## Usage example

```ts
function example(logger: Logger) {
  const child = logger.child('payments');
  child.info('Payment processed', { amount: 1999, currency: 'USD' });
  try {
    // do work
  } catch (err) {
    child.error(err as Error, { orderId: 123 });
  }
}
```

## Best practices

- Use structured metadata (`meta`) for key-value fields you want to query later.
- Avoid logging sensitive data (PII, secrets). If you must, ensure host redaction/filters are configured.
- Use `child()` to scope logs by component or module.

## Error handling and transports

- The host determines transports (console, file, external logging services) and sampling/retention policies.
- Loggers should not throw; logging functions must be resilient and fast.

## Notes

- This API is intentionally small; hosts may provide advanced features like correlation IDs, trace integration, or sampling.
