/**
 * Minimal EventSource stand-in for unit tests. The real API opens a server-sent
 * event connection as soon as a store connects, which must not happen in Karma.
 */
export class FakeEventSource {
  static instances: FakeEventSource[] = [];

  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readonly url: string;
  closed = false;

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  close(): void {
    this.closed = true;
  }

  /** Simulates one server-pushed change notification. */
  emitMessage(): void {
    this.onmessage?.(new MessageEvent('message'));
  }
}

export function installFakeEventSource(): void {
  (globalThis as unknown as { EventSource: typeof FakeEventSource }).EventSource =
    FakeEventSource;
  FakeEventSource.instances = [];
}
