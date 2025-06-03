import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-green-800 mb-6">About Matcha Stock</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Our Mission</h2>
        <p className="mb-4">
          Matcha Stock was created by matcha enthusiasts who understand the frustration of finding your favorite blend out of stock. Our mission is to help matcha lovers stay informed about the availability of their favorite matcha products.
        </p>
        <p>
          We track stock information from popular matcha brands like Ippodo and Rocky's Matcha, providing real-time updates and notifications when products are restocked.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-4">How It Works</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <strong className="text-green-700">Real-time Tracking:</strong> Our system regularly checks the websites of matcha brands to monitor product availability.
          </li>
          <li>
            <strong className="text-green-700">Stay Informed:</strong> Browse our website to see which matcha blends are currently in stock or out of stock.
          </li>
          <li>
            <strong className="text-green-700">Get Brand Notifications:</strong> Subscribe to brand-level notifications to get alerted when ANY product from your favorite matcha brand comes back in stock.
          </li>
          <li>
            <strong className="text-green-700">Smart Alerts:</strong> We'll send you a beautiful email listing all the newly restocked products from the brand you're subscribed to.
          </li>
          <li>
            <strong className="text-green-700">Never Miss Out:</strong> When you receive a notification, you can quickly visit the brand's website to purchase your favorite matcha before it sells out again.
          </li>
        </ol>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Brand-Level Notifications</h2>
        <p className="mb-4">
          Instead of tracking individual products, we focus on brand-level notifications because matcha enthusiasts often care more about <em>any</em> products from their favorite brands becoming available.
        </p>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Why Brand Notifications?</h3>
          <ul className="list-disc pl-5 space-y-1 text-green-700">
            <li>Matcha enthusiasts often love multiple products from the same brand</li>
            <li>You get alerted to discover new products you might not have known about</li>
            <li>Less noise - one email per brand restock instead of multiple product emails</li>
            <li>Perfect for exploring different grades and sizes from your trusted brands</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Contact Us</h2>
        <p className="mb-4">
          Have questions, suggestions, or want to request that we track a specific matcha brand? We'd love to hear from you!
        </p>
        <p className="mb-2">
          Email: <a href="mailto:hello@matchastock.com" className="text-green-600 hover:underline">hello@matchastock.com</a>
        </p>
        <p>
          Follow us on Twitter: <a href="https://twitter.com/matchastock" className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">@matchastock</a>
        </p>
      </div>
    </div>
  );
} 