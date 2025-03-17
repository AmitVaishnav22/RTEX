import React from "react";

function Home({ handleLogin }) {
  return (
    <div className="min-h-screen bg-white text-blue-600">
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">
            RTEX: AI Powered Real Time Collaborative Text Editor
          </h1>
          <p className="text-lg mb-8 text-blue-500">
            Experience seamless real-time collaboration with intelligent AI assistance.
          </p>
          <button
            onClick={handleLogin}
            className="flex items-center justify-center mx-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <img
              src="https://freelogopng.com/images/all_img/1657955079google-icon-png.png"
              alt="Google Logo"
              className="w-6 h-6 mr-2"
            />
            Sign in with Google
          </button>
        </div>
      </section>
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">Real-Time Collaboration</h3>
              <p className="text-blue-600">
                Edit documents simultaneously with your team, with live updates.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">AI-Powered Assistance</h3>
              <p className="text-blue-600">
                Get smart text suggestions and completions to boost your productivity.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">Secure Authentication</h3>
              <p className="text-blue-600">
                Sign in seamlessly with Google and keep your work secure.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">Cloud Integration</h3>
              <p className="text-blue-600">
                Save and access your documents from anywhere with cloud storage.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">Intuitive Interface</h3>
              <p className="text-blue-600">
                Enjoy a clean, modern, and user-friendly design.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">Seamless Integration</h3>
              <p className="text-blue-600">
                Easily connect with other tools and services for an enhanced workflow.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Makes RTEX Special?</h2>
          <p className="text-center text-blue-500 mb-8">
            RTEX combines real-time collaboration with AI-powered text generation to create an innovative writing experience. Whether you’re drafting important documents, brainstorming ideas, or working with a global team, RTEX makes writing smarter, faster, and more collaborative.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-blue-50 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">Collaborate in Real-Time</h3>
              <p className="text-blue-600">
                Work together on documents with live updates and instant communication.
              </p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">AI Assistance</h3>
              <p className="text-blue-600">
                Leverage AI to generate ideas, complete sentences, and enhance your writing effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-8 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-500">
            © {new Date().getFullYear()} RTEX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
