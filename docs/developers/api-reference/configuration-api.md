---
sidebar_position: 10
---

# Configuration API

The Configuration API exposes a typed key-value store that plugins can use to read and update runtime configuration. Hosts may persist configuration to disk, a database, or a remote config service.

## Types (TypeScript)

```ts
export interface ConfigurationService {
  get<T = any>(key: string, defaultValue?: T): Promise<T>;
  set<T = any>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<Record<string, any>>;
}
```

## Usage example

```ts
async function configureExample(cfg: ConfigurationService) {
  const timeout = await cfg.get<number>('service.timeoutMs', 5000);
  await cfg.set('service.timeoutMs', 10000);
}
```

## Concurrency and consistency

- Configuration stores may be eventually consistent. If your plugin requires strict consistency (compare-and-swap), ask the host for transaction-like APIs or implement optimistic retries.
- Hosts may emit configuration change events; subscribe to those if you need to react to external config updates.

## Best practices

- Validate configuration values before applying them.
- Use namespacing (e.g., `plugins.myPlugin.someKey`) to avoid key collisions.
- Keep large binary data out of the configuration store.

## Notes

- Persistence, backing store, and access control are host-specific.
