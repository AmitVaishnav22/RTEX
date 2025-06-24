import React, { useState, useEffect } from "react";

function Home({ handleLogin }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      title: "Real-Time Collaboration",
      desc: "Edit documents simultaneously with your team, with live cursor tracking and instant updates.",
      icon: "👥",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "AI-Powered Assistance",
      desc: "Get intelligent text suggestions, grammar fixes, and content enhancement in real-time.",
      icon: "🤖",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Secure Authentication",
      desc: "Enterprise-grade security with Google OAuth and end-to-end encryption for your data.",
      icon: "🔒",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Cloud Integration",
      desc: "Seamlessly sync with Google Drive, Dropbox, and other cloud storage solutions.",
      icon: "☁️",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "Smart Interface",
      desc: "Adaptive UI that learns your preferences with customizable themes and layouts.",
      icon: "✨",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Workflow Automation",
      desc: "Connect with Slack, Notion, and 100+ tools to streamline your productivity.",
      icon: "⚡",
      gradient: "from-teal-500 to-blue-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full filter blur-3xl animate-pulse"
          style={{
            left: mousePosition.x * 0.02 + 'px',
            top: mousePosition.y * 0.02 + 'px',
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full filter blur-2xl animate-pulse"
          style={{
            right: (window.innerWidth - mousePosition.x) * 0.015 + 'px',
            bottom: (window.innerHeight - mousePosition.y) * 0.015 + 'px',
            transform: 'translate(50%, 50%)'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-white/20 z-50 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RTEX</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Features</a>
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">About</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-16 relative z-10">
          {/* Left Content */}
          <div className={`transition-all duration-1000 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Now with Gemini-AI Integration
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Write Smarter.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Collaborate Instantly.
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
              The AI-powered collaborative editor that transforms how teams create, edit, and share content. 
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center">
              <button
                onClick={handleLogin}
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src="https://freelogopng.com/images/all_img/1657955079google-icon-png.png"
                  alt="Google Logo"
                  className="w-6 h-6 mr-3 relative z-10"
                />
                <span className="relative z-10">Sign in with Google</span>
                <svg className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
            
          </div>

          {/* Right Illustration */}
          <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
            <div className="relative">
              {/* Main Editor Mockup */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-full"></div>
                  <div className="h-3 bg-gradient-to-r from-purple-200 to-purple-100 rounded w-5/6"></div>
                  <div className="h-3 bg-gradient-to-r from-green-200 to-green-100 rounded w-2/3"></div>
                </div>
              </div>
              
              {/* Floating Cursor */}
              <div className="absolute -top-4 -right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-bounce">
                Sarah is typing...
              </div>
              
              {/* Floating AI Assistant */}
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                🤖 AI suggests: "Enhance this paragraph"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to create, collaborate, and ship content faster than ever before.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-white/20 cursor-pointer transition-all duration-500 hover:-translate-y-2 ${
                  activeFeature === idx ? 'scale-105' : ''
                }`}
                onMouseEnter={() => setActiveFeature(idx)}
                onMouseLeave={() => setActiveFeature(null)}
                style={{
                  animationDelay: `${idx * 100}ms`
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
                
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-xl font-bold">RTEX</span>
              </div>
              <p className="text-slate-400 text-sm">
                The future of collaborative writing is here.
              </p>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'API', 'Integrations'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Privacy'] }
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} RTEX 
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="https://github.com/AmitVaishnav22/RTEX" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
              <a href="https://github.com/AmitVaishnav22/RTEX" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="https://github.com/AmitVaishnav22/RTEX" className="text-slate-400 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;