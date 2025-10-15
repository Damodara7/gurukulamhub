// Type declaration for WebSocket routes using next-ws
declare module '*/api/ws/*/route' {
  export function UPGRADE(
    client: any,
    request: any,
    server: any,
    context: any
  ): void;
}

declare module '*/api/ws/route' {
  export function UPGRADE(
    client: any,
    request: any,
    server: any,
    context: any
  ): void;
}

