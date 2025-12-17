"use client";

import { useState } from "react";import Link from 'next/link';
interface Business {
  id: string;
  name: string;
  description: string;
  categories: string[];
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string | null;
  relevanceScore?: number;
}

interface SearchResult {
  answer: string;
  businesses: Business[];
  cached: boolean;
}

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:3333/api/ai/yellow-books/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          city: city.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Search failed");
      }

      const data: SearchResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 Yellow Book AI Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Ask me anything about businesses in our directory
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Where can I find good Italian restaurants?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City (Optional)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., New York"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#FFD700] hover:bg-[#E5C100] text-gray-900 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Ask AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* AI Answer */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">AI Answer</h2>
                    {result.cached && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Cached
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {result.answer}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Cards */}
            {result.businesses.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Related Businesses ({result.businesses.length})
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {result.businesses.map((business, index) => (
                    <Link
                      key={business.id}
                      href={`/yellow-books/${business.id}`}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-[1.01] border-2 border-transparent hover:border-[#FFD700]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 hover:text-[#FFD700] transition-colors">
                            {index + 1}. {business.name} →
                          </h4>
                          <p className="text-sm text-gray-500">
                            {business.city}, {business.state}
                          </p>
                        </div>
                        {business.relevanceScore && (
                          <span className="px-2 py-1 bg-[#FFD700] text-gray-900 text-xs font-medium rounded">
                            {(business.relevanceScore * 100).toFixed(0)}% match
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">{business.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {business.categories.map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {category}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>📞</span>
                          <span className="hover:text-[#FFD700]">
                            {business.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>✉️</span>
                          <span className="hover:text-[#FFD700]">
                            {business.email}
                          </span>
                        </div>
                        {business.website && (
                          <div className="flex items-center gap-2">
                            <span>🌐</span>
                            <span className="hover:text-[#FFD700]">
                              Visit Website
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Examples */}
        {!result && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Try asking:
            </h3>
            <div className="space-y-2">
              {[
                "Where can I find good Italian restaurants?",
                "I need a plumber in New York",
                "Show me banks with good customer service",
                "Find educational institutions in my area",
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuestion(example)}
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                >
                  💡 {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
