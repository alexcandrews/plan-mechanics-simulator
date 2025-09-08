import { renderHook, act } from '@testing-library/react';
import { useCommunications } from '../useCommunications';

describe('useCommunications', () => {
  it('should initialize with empty communications array', () => {
    const { result } = renderHook(() => useCommunications());
    
    expect(result.current.communications).toEqual([]);
  });

  it('should add new communications', () => {
    const { result } = renderHook(() => useCommunications());
    
    const newCommunication = {
      id: 1,
      type: 'Plan Started',
      date: new Date('2024-01-01'),
      milestone: null
    };

    act(() => {
      result.current.addCommunication(newCommunication);
    });

    expect(result.current.communications).toHaveLength(1);
    expect(result.current.communications[0]).toEqual(newCommunication);
  });

  it('should add multiple communications', () => {
    const { result } = renderHook(() => useCommunications());
    
    const comm1 = {
      id: 1,
      type: 'Plan Started',
      date: new Date('2024-01-01'),
      milestone: null
    };

    const comm2 = {
      id: 2,
      type: 'Milestone Unlocked',
      date: new Date('2024-01-02'),
      milestone: { id: 1, name: 'Test Milestone' }
    };

    act(() => {
      result.current.addCommunication(comm1);
      result.current.addCommunication(comm2);
    });

    expect(result.current.communications).toHaveLength(2);
    expect(result.current.communications[0]).toEqual(comm1);
    expect(result.current.communications[1]).toEqual(comm2);
  });

  it('should reset communications to empty array', () => {
    const { result } = renderHook(() => useCommunications());
    
    const newCommunication = {
      id: 1,
      type: 'Plan Started',
      date: new Date('2024-01-01'),
      milestone: null
    };

    act(() => {
      result.current.addCommunication(newCommunication);
    });

    expect(result.current.communications).toHaveLength(1);

    act(() => {
      result.current.resetCommunications();
    });

    expect(result.current.communications).toEqual([]);
  });

  it('should maintain communication order', () => {
    const { result } = renderHook(() => useCommunications());
    
    const communications = [
      { id: 1, type: 'First', date: new Date('2024-01-01'), milestone: null },
      { id: 2, type: 'Second', date: new Date('2024-01-02'), milestone: null },
      { id: 3, type: 'Third', date: new Date('2024-01-03'), milestone: null }
    ];

    act(() => {
      communications.forEach(comm => {
        result.current.addCommunication(comm);
      });
    });

    expect(result.current.communications).toHaveLength(3);
    expect(result.current.communications[0].type).toBe('First');
    expect(result.current.communications[1].type).toBe('Second');
    expect(result.current.communications[2].type).toBe('Third');
  });
});