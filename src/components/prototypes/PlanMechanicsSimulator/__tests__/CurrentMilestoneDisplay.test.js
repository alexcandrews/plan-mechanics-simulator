import React from 'react';
import { render, screen } from '@testing-library/react';
import CurrentMilestoneDisplay from '../components/CurrentMilestoneDisplay/CurrentMilestoneDisplay';

describe('CurrentMilestoneDisplay', () => {
  it('should render current milestone information', () => {
    const currentMilestone = {
      id: 2,
      name: 'Chapter 1: Introduction',
      reason: 'First Unlocked Required Milestone'
    };

    render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
    
    expect(screen.getByText('Current Milestone: Chapter 1: Introduction')).toBeInTheDocument();
  });

  it('should render "No milestones available" when currentMilestone is null', () => {
    render(<CurrentMilestoneDisplay currentMilestone={null} />);
    
    expect(screen.getByText('No milestones available')).toBeInTheDocument();
  });

  it('should render different milestone names correctly', () => {
    const testCases = [
      {
        currentMilestone: {
          id: 1,
          name: 'Milestone 1',
          reason: 'First Unlocked Required Milestone'
        },
        expectedText: 'Current Milestone: Milestone 1'
      },
      {
        currentMilestone: {
          id: 2,
          name: 'Optional Task',
          reason: 'First Unlocked Optional Milestone'
        },
        expectedText: 'Current Milestone: Optional Task'
      },
      {
        currentMilestone: {
          id: 3,
          name: 'Completed Chapter',
          reason: 'Last Completed Milestone'
        },
        expectedText: 'Current Milestone: Completed Chapter'
      },
      {
        currentMilestone: {
          id: 1,
          name: 'Getting Started',
          reason: 'First Milestone in Plan (Fallback)'
        },
        expectedText: 'Current Milestone: Getting Started'
      }
    ];

    testCases.forEach(({ currentMilestone, expectedText }) => {
      const { unmount } = render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
      
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
    
    // Should be positioned below the current date control on the right
    const displayElement = container.firstChild;
    expect(displayElement).toHaveClass('fixed');
    expect(displayElement).toHaveClass('bottom-6');
    expect(displayElement).toHaveClass('right-6');
  });

  it('should display milestone name only (no ID in simplified UI)', () => {
    const currentMilestone = {
      id: 42,
      name: 'Debug Milestone',
      reason: 'First Unlocked Required Milestone'
    };

    render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
    
    // Should show the milestone name
    expect(screen.getByText('Current Milestone: Debug Milestone')).toBeInTheDocument();
    // Should not show ID in simplified UI
    expect(screen.queryByText(/ID: 42/)).not.toBeInTheDocument();
  });

  it('should handle long milestone names gracefully', () => {
    const currentMilestone = {
      id: 1,
      name: 'This is a very long milestone name that might wrap to multiple lines in the UI and should be handled gracefully without breaking the layout',
      reason: 'First Unlocked Required Milestone'
    };

    render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
    
    expect(screen.getByText(`Current Milestone: ${currentMilestone.name}`)).toBeInTheDocument();
    // The component should render without breaking (no specific layout test here, just ensure it renders)
  });

  it('should render milestone name consistently regardless of reason', () => {
    const testCases = [
      { reason: 'First Unlocked Required Milestone' },
      { reason: 'First Unlocked Optional Milestone' },
      { reason: 'Last Completed Milestone' },
      { reason: 'First Milestone in Plan (Fallback)' }
    ];

    testCases.forEach(({ reason }) => {
      const currentMilestone = {
        id: 1,
        name: 'Test Milestone',
        reason
      };

      const { unmount } = render(<CurrentMilestoneDisplay currentMilestone={currentMilestone} />);
      
      expect(screen.getByText('Current Milestone: Test Milestone')).toBeInTheDocument();
      
      unmount();
    });
  });
});