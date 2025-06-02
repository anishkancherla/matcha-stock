declare module '@apollo/client' {
  export * from '@apollo/client/core';
  export * from '@apollo/client/react';
  export * from '@apollo/client/link/batch';
  export * from '@apollo/client/link/context';
  export * from '@apollo/client/link/error';
  export * from '@apollo/client/link/http';
  export * from '@apollo/client/link/schema';
  export * from '@apollo/client/link/ws';
}

declare module '@apollo/server' {
  export * from '@apollo/server';
  export class ApolloServer {
    constructor(options: any);
  }
}

declare module '@as-integrations/next' {
  export * from '@as-integrations/next';
  export function startServerAndCreateNextHandler(
    server: any, 
    options?: any
  ): any;
} 