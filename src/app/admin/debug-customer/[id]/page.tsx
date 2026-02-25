"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function DebugCustomerDetail() {
  const params = useParams();
  const [debug, setDebug] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const customerId = params.id;
      console.log('Customer ID from URL:', customerId);
      
      setDebug({
        urlId: customerId,
        timestamp: new Date().toISOString()
      });

      try {
        // Try to fetch the customer
        const res = await fetch(`/api/admin/customers/${customerId}`);
        const text = await res.text();
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { error: 'Invalid JSON', preview: text.substring(0, 200) };
        }

        setDebug(prev => ({
          ...prev,
          status: res.status,
          statusText: res.statusText,
          data: data
        }));

      } catch (error: any) {
        setDebug(prev => ({
          ...prev,
          error: error.message
        }));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Customer Detail</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">URL Parameters:</h2>
          <pre className="mt-2">{JSON.stringify({ id: debug.urlId }, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">API Response:</h2>
          <p>Status: {debug.status} {debug.statusText}</p>
          <p>Timestamp: {debug.timestamp}</p>
          {debug.error && <p className="text-red-600">Error: {debug.error}</p>}
        </div>

        <div className="bg-gray-100 p-4 rounded overflow-auto">
          <h2 className="font-semibold">Response Data:</h2>
          <pre className="mt-2 text-sm">{JSON.stringify(debug.data, null, 2)}</pre>
        </div>

        <Link 
          href="/admin/customers"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Customers
        </Link>
      </div>
    </div>
  );
}
