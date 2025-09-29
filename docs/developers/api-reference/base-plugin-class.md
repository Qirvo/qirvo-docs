---
sidebar_position: 4
---

# Base Plugin Class

This document describes the canonical Base Plugin Class used by Qirvo hosts. It contains the TypeScript contract, lifecycle behavior, examples, error modes, and best practices for plugin implementers.

## Overview

The Base Plugin Class is an abstract class every plugin should extend. It provides a simple lifecycle (construction, init, onEvent, shutdown) and small helpers for typed configuration.

## Type contract (TypeScript)

```ts
export type PluginEvent = {
  name: string;
  payload?: unknown;
  source?: string;
  timestamp?: string; // ISO 8601
};

export abstract class BasePlugin<TConfig = Record<string, any>> {
  readonly id: string;
  protected config: TConfig;

  constructor(id: string, config?: TConfig) {
    this.id = id;
    this.config = (config ?? {}) as TConfig;
  }

  /** Called once when the plugin is registered/initialized. */
  init(): Promise<void> | void {}

  /** Called when the host/application is shutting down or the plugin is being removed. */
  shutdown(): Promise<void> | void {}

  /** Called when an event is routed to the plugin. */
  onEvent(event: PluginEvent): Promise<void> | void {}

  /** Get a typed config value with optional default. */
  protected getConfig<K extends keyof TConfig>(key: K, defaultValue?: TConfig[K]): TConfig[K] {
    const v = this.config?.[key];
    return (v === undefined ? defaultValue : v) as TConfig[K];
  }

  /** Merge/replace runtime config. */
  protected setConfig(config: Partial<TConfig>): void {
    this.config = { ...(this.config as any), ...(config as any) } as TConfig;
  }
}
```

## Example implementation

```ts
interface MyPluginConfig {
  enabled: boolean;
  apiKey?: string;
  timeoutMs?: number;
}

class MyPlugin extends BasePlugin<MyPluginConfig> {
  constructor(id: string, config?: MyPluginConfig) {
    super(id, { enabled: true, timeoutMs: 5000, ...config } as MyPluginConfig);
  }

  async init() {
    if (!this.getConfig('enabled')) return;
    const apiKey = this.getConfig('apiKey');
    if (!apiKey) throw new Error(`${this.id} requires apiKey`);
    // perform startup work (non-blocking recommended)
  }

  async onEvent(event: PluginEvent) {
    if (event.name === 'user.login') {
      // handle login
    }
  }

  async shutdown() {
    // cleanup resources
  }
}
```

## Lifecycle and host expectations

- `init()` is called once after construction and before the plugin begins receiving events.
- `onEvent()` may be called concurrently by the host — plugins should be reentrant or protect internal state.
- `shutdown()` is called during app shutdown or when the plugin is removed; hosts should await the returned promise.

## Error handling

- Errors thrown from `init()` should be treated as registration failures by the host.
- Errors from `onEvent()` are typically logged; implement retries or internal dead-letter strategies if you need stronger guarantees.

## Best practices

- Keep `init()` fast; if you need long setup work, spin a background task and expose a readiness check.
- Use `getConfig('key', default)` to avoid undefined values.
- Avoid global mutable state shared across plugin instances.

## Edge cases

- When multiple instances of the same plugin can be created, ensure external resources use instance-unique identifiers.
- `setConfig` merges by default — if you need a replace behavior, implement it explicitly in your plugin.

## Tests

Example (Jest):

```ts
test('initializes and rejects without apiKey', async () => {
  class TestPlugin extends MyPlugin {}
  const p = new TestPlugin('test', { enabled: true } as any);
  await expect(p.init()).rejects.toThrow(/apiKey/);
});
```

## Notes

- Consult host-specific plugin-manager docs for registration, ordering, and permissions.
