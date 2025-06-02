import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import resolvers from '../../../graphql/resolvers';
import '../../../utils/prisma'; // Import to ensure Prisma is initialized

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Read the schema from the file
const typeDefs = readFileSync(
  join(process.cwd(), 'src/graphql/schema.graphql'),
  'utf8'
);

// Create Apollo Server once (outside of the handler)
let apolloServer: any;
let handler: any;

function getHandler() {
  if (!apolloServer) {
    apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
    });
    
    handler = startServerAndCreateNextHandler(apolloServer, {
      context: async (req: NextRequest) => {
        return { req };
      },
    });
  }
  
  return handler;
}

export async function GET(req: NextRequest) {
  try {
    return await getHandler()(req);
  } catch (error) {
    console.error('GraphQL GET error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return await getHandler()(req);
  } catch (error) {
    console.error('GraphQL POST error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 