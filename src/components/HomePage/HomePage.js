import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const prototypes = [
    {
      id: 'plan-mechanics-simulator',
      title: 'Plan Mechanics Simulator',
      description: 'A tool to visualize and test the unlocking and communication logic of guided plans.',
      path: '/plan-mechanics-simulator'
    },
    {
      id: 'admin-panel',
      title: 'Admin Panel Prototype',
      description: 'A comprehensive admin interface for managing guided journey plans, health checks, and milestone configurations.',
      path: '/admin-panel'
    },
    {
      id: 'guided-journey',
      title: 'Guided Journey Interface',
      description: 'An exact replica of the AI Flight School guided journey admin interface with milestone management and navigation.',
      path: '/guided-journey'
    }
    // Future prototypes will be added here
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Guided Journey Prototypes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A collection of interactive prototypes and simulations for testing various concepts and mechanics.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prototypes.map((prototype) => (
            <Link
              key={prototype.id}
              to={prototype.path}
              className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 hover:border-blue-300"
            >
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-3">
                {prototype.title}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {prototype.description}
              </p>
              
              <div className="mt-4 text-blue-600 font-medium text-sm group-hover:text-blue-700">
                Launch Prototype →
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HomePage;