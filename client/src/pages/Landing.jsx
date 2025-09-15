import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white text-sm font-bold">N</span>
              </div>
              <span className="text-xl font-semibold text-black">Notes</span>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-gray-600 hover:text-black transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-light text-black mb-6 fade-in">
            Simple. Powerful. <br />
            <span className="font-semibold">Note Taking.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto slide-up">
            Organize your thoughts, collaborate with your team, and stay productive 
            with our minimalist note-taking platform.
          </p>
          <div className="flex justify-center space-x-4 slide-up">
            <Link 
              to="/signup" 
              className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              Start Free
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center text-black mb-12">
            Everything you need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 fade-in">
              <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Rich Text Editor</h3>
              <p className="text-gray-600">Create and format your notes with our intuitive editor.</p>
            </div>
            
            <div className="text-center p-6 fade-in">
              <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Team Collaboration</h3>
              <p className="text-gray-600">Work together with your team in dedicated workspaces.</p>
            </div>
            
            <div className="text-center p-6 fade-in">
              <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your data is encrypted and completely isolated per organization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-black mb-4">
            Ready to get organized?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of teams already using our platform.
          </p>
          <Link 
            to="/signup" 
            className="inline-block px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Start Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-600">© 2025 Notes. Simple, powerful note-taking.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;