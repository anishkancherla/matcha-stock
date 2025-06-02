'use client';

import { ApolloProvider } from '@apollo/client';
import { useState, ReactNode } from 'react';
import createApolloClient from './apollo-client';

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const [client] = useState(createApolloClient());

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
} 