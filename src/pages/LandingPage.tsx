import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Layout, BarChart3, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Layout className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">FormFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/admin" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Admin Area
              </Link>
              <Link 
                to="/admin" 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Create beautiful forms <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                in seconds, not hours.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
              The modern, AI-powered form builder that helps you collect data, engage your audience, and analyze results effortlessly.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/admin" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-white bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
              >
                Start Building for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Everything you need to build perfect forms</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Generation</h3>
                <p className="text-gray-500">
                  Just describe what you need, and our AI will generate a complete, ready-to-use form in seconds.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  <Layout className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Beautiful Design</h3>
                <p className="text-gray-500">
                  Customize colors, gradients, and background images to match your brand perfectly.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Analytics</h3>
                <p className="text-gray-500">
                  View responses in real-time and analyze your data with built-in dashboards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500 font-medium">FormFlow</span>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} FormFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
