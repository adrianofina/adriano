'use client';

import { useEffect, useState } from 'react';

interface FetchOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useCustomers(options: FetchOptions = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (options.search) params.append('search', options.search);
        if (options.status) params.append('status', options.status);
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());

        const res = await fetch(`/api/customers?${params}`);
        const result = await res.json();
        
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.customers || []);
          setTotal(result.total || 0);
        }
      } catch (err) {
        setError('Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [options.search, options.status, options.page]);

  return { data, loading, error, total };
}

export function useLoans(options: FetchOptions = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (options.search) params.append('search', options.search);
        if (options.status) params.append('status', options.status);
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());

        const res = await fetch(`/api/loans?${params}`);
        const result = await res.json();
        
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.loans || []);
          setTotal(result.total || 0);
        }
      } catch (err) {
        setError('Failed to fetch loans');
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [options.search, options.status, options.page]);

  return { data, loading, error, total };
}

export function useStats() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const result = await res.json();
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      } catch (err) {
        setError('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, loading, error };
}
