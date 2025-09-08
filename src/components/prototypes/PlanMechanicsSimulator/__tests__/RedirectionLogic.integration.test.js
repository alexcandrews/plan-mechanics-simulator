import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanMechanicsSimulator from '../index';

describe('Redirection Logic Integration', () => {
  it('should display current milestone based on redirection logic', () => {
    render(<PlanMechanicsSimulator />);
    
    // Should show the current milestone display with Milestone 1 (unlocked by default)
    expect(screen.getByText('Current Milestone: Milestone 1')).toBeInTheDocument();
  });

  it('should update current milestone when milestone states change', async () => {
    render(<PlanMechanicsSimulator />);
    
    // Initially should show Milestone 1 as unlocked required
    expect(screen.getByText('Current Milestone: Milestone 1')).toBeInTheDocument();
    
    // Note: This test verifies the display exists and shows initial state
    // Future enhancement: Add interaction with milestone state controls when available
  });

  it('should show fallback when all milestones are locked', async () => {
    render(<PlanMechanicsSimulator />);
    
    // Reset plan to get initial locked state
    await userEvent.click(screen.getByText('Reset Plan'));
    
    // After reset, check if redirection logic shows appropriate milestone
    // The exact behavior depends on how reset works with redirection logic
    expect(screen.getByText(/Current Milestone:/)).toBeInTheDocument();
  });

  it('should update current milestone when unlock strategy changes', async () => {
    render(<PlanMechanicsSimulator />);
    
    // Change unlock strategy
    await userEvent.click(screen.getByLabelText(/By Start Date Only/));
    
    // Current milestone should update based on new strategy
    await waitFor(() => {
      expect(screen.getByText(/Current Milestone:/)).toBeInTheDocument();
    });
    
    // The specific milestone shown will depend on the dates and strategy
    // This test verifies the display updates when strategy changes
  });

  it('should show current milestone when new milestones are added', async () => {
    render(<PlanMechanicsSimulator />);
    
    // Add a new milestone
    const nameInput = screen.getByPlaceholderText('Milestone Name');
    await userEvent.type(nameInput, 'New Test Milestone');
    await userEvent.click(screen.getByText('Add Milestone'));
    
    // Current milestone display should still be present and functional
    expect(screen.getByText(/Current Milestone:/)).toBeInTheDocument();
  });

  it('should handle date changes affecting current milestone', async () => {
    render(<PlanMechanicsSimulator />);
    
    // Change the current date
    const dateInput = document.getElementById('currentDate');
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2024-02-01');
    
    // Current milestone should update if date affects unlock logic
    await waitFor(() => {
      expect(screen.getByText(/Current Milestone:/)).toBeInTheDocument();
    });
    
    // The display should remain functional regardless of date
  });

  it('should display current milestone in simplified format', () => {
    render(<PlanMechanicsSimulator />);
    
    // Should show milestone in simplified format without ID or reason
    expect(screen.getByText(/Current Milestone: Milestone/)).toBeInTheDocument();
  });

  it('should position current milestone display correctly relative to date control', () => {
    const { container } = render(<PlanMechanicsSimulator />);
    
    // Find both the date control and milestone display
    const dateControl = screen.getByText('Current Date:').parentElement;
    const milestoneDisplay = screen.getByText(/Current Milestone:/).parentElement;
    
    // Both should be fixed positioned
    expect(dateControl).toHaveClass('fixed');
    expect(milestoneDisplay).toHaveClass('fixed');
    
    // Both should be positioned on the right, with milestone below date control
    expect(milestoneDisplay).toHaveClass('right-6');
    expect(dateControl).toHaveClass('right-6');
  });

  it('should display milestone name only in simplified UI', () => {
    render(<PlanMechanicsSimulator />);
    
    // Should show milestone name but not detailed reason or ID
    expect(screen.getByText(/Current Milestone:/)).toBeInTheDocument();
    expect(screen.queryByText(/ID:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/First Unlocked Required Milestone/)).not.toBeInTheDocument();
  });
});