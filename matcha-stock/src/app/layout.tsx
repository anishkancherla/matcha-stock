import type { Metadata } from "next";
import "./globals.css";
import "../styles/fonts.css";
import Header from '../components/Header';
import { ApolloWrapper } from '../utils/apollo-provider';

export const metadata: Metadata = {
  title: "Matcha Stock - Track Your Favorite Matcha Availability",
  description: "Get real-time stock status of your favorite matcha products and receive notifications when they are back in stock.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-white">
        <ApolloWrapper>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
        </ApolloWrapper>
      </body>
    </html>
  );
}
