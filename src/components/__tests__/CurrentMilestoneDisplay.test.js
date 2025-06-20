import React from 'react';
import { render, screen } from '@testing-library/react';
import CurrentMilestoneDisplay from '../CurrentMilestoneDisplay/CurrentMilestoneDisplay';

describe('CurrentMilestoneDisplay', () => {
  it('should render current milestone information', () => {
    const currentMilestone = {
      id: 2,
      name: 'Chapter 1: Introduction',
      reason: 'First Unlocked Required Milestone'
    };

    render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
    
    expect(screen.getByText('Current Milestone:')).toBeInTheDocument();
    expect(screen.getByText('Chapter 1: Introduction')).toBeInTheDocument();
    expect(screen.getByText('First Unlocked Required Milestone')).toBeInTheDocument();
  });

  it('should render "No milestones available" when currentMilestone is null', () => {
    render(<CurrentMilestoneDisplay currentMilestone={null} />);
    
    expect(screen.getByText('Current Milestone:')).toBeInTheDocument();
    expect(screen.getByText('No milestones available')).toBeInTheDocument();
    expect(screen.queryByText(/First|Last|Fallback/)).not.toBeInTheDocument();
  });

  it('should render different redirection reasons correctly', () => {
    const testCases = [
      {
        currentMilestone: {
          id: 1,
          name: 'Milestone 1',
          reason: 'First Unlocked Required Milestone'
        },
        expectedText: 'First Unlocked Required Milestone'
      },
      {
        currentMilestone: {
          id: 2,
          name: 'Optional Task',
          reason: 'First Unlocked Optional Milestone'
        },
        expectedText: 'First Unlocked Optional Milestone'
      },
      {
        currentMilestone: {
          id: 3,
          name: 'Completed Chapter',
          reason: 'Last Completed Milestone'
        },
        expectedText: 'Last Completed Milestone'
      },
      {
        currentMilestone: {
          id: 1,
          name: 'Getting Started',
          reason: 'First Milestone in Plan (Fallback)'
        },
        expectedText: 'First Milestone in Plan (Fallback)'
      }
    ];

    testCases.forEach(({ currentMilestone, expectedText }) => {
      const { unmount } = render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
      
      expect(screen.getByText(currentMilestone.name)).toBeInTheDocument();
      expect(screen.getByText(expectedText)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should have proper styling classes for positioning', () => {
    const currentMilestone = {
      id: 1,
      name: 'Test Milestone',
      reason: 'First Unlocked Required Milestone'
    };

    const { container } = render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
    
    // Should be positioned below the current date control
    const displayElement = container.firstChild;
    expect(displayElement).toHaveClass('fixed');
    expect(displayElement).toHaveClass('bottom-6');
    expect(displayElement).toHaveClass('left-6');
  });

  it('should display milestone ID for debugging purposes', () => {
    const currentMilestone = {
      id: 42,
      name: 'Debug Milestone',
      reason: 'First Unlocked Required Milestone'
    };

    render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
    
    // Should show ID in a subtle way for debugging
    expect(screen.getByText(/ID: 42/)).toBeInTheDocument();
  });

  it('should handle long milestone names gracefully', () => {
    const currentMilestone = {
      id: 1,
      name: 'This is a very long milestone name that might wrap to multiple lines in the UI and should be handled gracefully without breaking the layout',
      reason: 'First Unlocked Required Milestone'
    };

    render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
    
    expect(screen.getByText(currentMilestone.name)).toBeInTheDocument();
    // The component should render without breaking (no specific layout test here, just ensure it renders)
  });

  it('should apply different visual styling based on redirection reason', () => {
    const testCases = [
      { reason: 'First Unlocked Required Milestone', expectedClass: 'text-green-600' },
      { reason: 'First Unlocked Optional Milestone', expectedClass: 'text-blue-600' },
      { reason: 'Last Completed Milestone', expectedClass: 'text-yellow-600' },
      { reason: 'First Milestone in Plan (Fallback)', expectedClass: 'text-gray-600' }
    ];

    testCases.forEach(({ reason, expectedClass }) => {
      const currentMilestone = {
        id: 1,
        name: 'Test Milestone',
        reason
      };

      const { container, unmount } = render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
      
      const reasonElement = screen.getByText(reason);
      expect(reasonElement).toHaveClass(expectedClass);
      
      unmount();
    });
  });
});