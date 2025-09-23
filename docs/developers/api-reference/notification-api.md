---
sidebar_position: 7
---

# Notification API

The Notification API provides a typed mechanism for plugins and host components to send user-facing and system notifications. It supports immediate notifications, scheduled/delayed notifications, and multiple channels (in-app, email, webhook) depending on host capabilities.

## Types (TypeScript)

```ts
export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export type NotificationPayload = {
  title: string;
  message?: string;
  level?: NotificationLevel;
  data?: Record<string, unknown>;
  url?: string; // optional action URL
};

export type NotificationOptions = {
  channel?: 'in-app' | 'email' | 'webhook';
  ttlMs?: number; // time-to-live for in-app notifications
  scheduledAt?: string; // ISO 8601 for scheduled delivery
};

export type NotificationRecord = NotificationPayload & {
  id: string;
  createdAt: string;
  deliveredAt?: string;
  channel?: string;
};

export interface NotificationService {
  send(payload: NotificationPayload, opts?: NotificationOptions): Promise<string>;
  schedule(payload: NotificationPayload, at: string, opts?: NotificationOptions): Promise<string>;
  dismiss(id: string): Promise<void>;
  list(filter?: { level?: NotificationLevel; since?: string; until?: string }): Promise<NotificationRecord[]>;
}
```

## Usage example

```ts
async function informUser(notificationSvc: NotificationService) {
  const id = await notificationSvc.send({
    title: 'Backup completed',
    message: 'Your automated backup completed successfully.',
    level: 'success',
    url: '/backups/123'
  }, { channel: 'in-app', ttlMs: 1000 * 60 * 60 });
  // id can be used to dismiss later
}
```

## Events and webhooks

- Hosts may emit `notification.delivered` and `notification.clicked` events for analytics and deep-link handling.
- When `channel: 'webhook'` is used, the host will POST payloads to configured webhook URLs and include delivery metadata.

## Error modes and retries

- Transient failures (network/email provider) should be retried with exponential backoff by the host.
- If `send()` fails permanently, it should throw an informative error including the payload `id` when available.

## Best practices

- Use `level` to allow UIs to present the correct affordance and styling.
- Keep `title` short; put longer context in `message`.
- Prefer in-app for interactive flows; use email/webhook for long-lived or external flows.

## Accessibility

- Include clear text and short action URLs; ensure messages are accessible to screen readers.

## Notes

- Implementation details (channels supported, retention policy) are host-specific. This document describes the API surface expected by plugins.
