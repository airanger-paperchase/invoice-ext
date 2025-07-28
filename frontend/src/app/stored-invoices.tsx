"use client";

import { useEffect, useState } from "react";
import ResultsTable from "@/components/Navbar/Results-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

export interface ExtractionResult {
  fileName: string;
  success: boolean;
  data?: any;
  error?: string;
  downloadLink?: string;
}

export default function StoredInvoicesPage() {
  const [results, setResults] = useState<ExtractionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3000/api/stored-invoices");
        if (!res.ok) throw new Error("Failed to fetch stored invoices");
        const data = await res.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold text-gray-900">All Stored Invoices</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View all previously extracted invoice data stored on the server
          </p>
          <button
            className="mt-4 px-8 py-3 bg-gradient-to-br from-purple-800 via-purple-900 to-purple-950 shadow-xl text-white rounded-xl font-semibold shadow-medium hover:shadow-strong transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate('/')}
          >
            Go to Upload Page
          </button>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Stored Invoices
            </CardTitle>
            <CardDescription>All extracted invoice data from the server</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No stored invoices found.</div>
            ) : (
              <ResultsTable results={results} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 