import React, { useState } from 'react';

const NavigationSidebar = ({ sections }) => {
  const [expandedSections, setExpandedSections] = useState({
    'Templating Engine': true,
    'Deployment Engine': true,
    'Actions': true,
    'Certificates': false,
    'About Plan': false,
    'Key Status': false,
    'Integrations': false
  });

  const toggleSection = (title) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="h-full overflow-y-auto px-3 py-2" style={{ fontSize: '11px' }}>
      <div className="space-y-1">
        {sections.map((section) => (
          <div key={section.title} className="mb-3">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between py-1 text-left hover:bg-gray-50"
            >
              <h3 className="text-xs font-medium text-black">
                {section.title}
              </h3>
              <svg
                className={`w-3 h-3 text-gray-400 transform transition-transform ${
                  expandedSections[section.title] ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections[section.title] && (
              <div className="mt-1 ml-1 space-y-0.5">
                {section.items.map((item, index) => (
                  <div key={index} className="text-xs text-blue-600 cursor-pointer hover:bg-blue-50 py-0.5 px-1 leading-tight">
                    <span className="underline">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationSidebar;