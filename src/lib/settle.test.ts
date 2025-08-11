import { describe, it, expect } from 'vitest';
import { minCashFlow, validateTransfers, getTotalTransferAmount, type Net } from './settle';

describe('minCashFlow', () => {
  it('should handle balanced scenario with simple transfers', () => {
    const nets: Net[] = [
      { userId: '1', name: 'Alice', net: 100 },
      { userId: '2', name: 'Bob', net: -50 },
      { userId: '3', name: 'Charlie', net: -50 },
    ];

    const transfers = minCashFlow(nets);
    
    expect(transfers).toHaveLength(2);
    expect(transfers).toEqual([
      { fromUserId: '2', toUserId: '1', amount: 50 },
      { fromUserId: '3', toUserId: '1', amount: 50 },
    ]);
    expect(validateTransfers(nets, transfers)).toBe(true);
  });

  it('should handle already settled scenario', () => {
    const nets: Net[] = [
      { userId: '1', name: 'Alice', net: 0 },
      { userId: '2', name: 'Bob', net: 0 },
      { userId: '3', name: 'Charlie', net: 0 },
    ];

    const transfers = minCashFlow(nets);
    
    expect(transfers).toHaveLength(0);
    expect(validateTransfers(nets, transfers)).toBe(true);
  });

  it('should handle many small debts efficiently', () => {
    const nets: Net[] = [
      { userId: '1', name: 'Alice', net: 100 },
      { userId: '2', name: 'Bob', net: -10 },
      { userId: '3', name: 'Charlie', net: -15 },
      { userId: '4', name: 'David', net: -25 },
      { userId: '5', name: 'Eve', net: -20 },
      { userId: '6', name: 'Frank', net: -30 },
    ];

    const transfers = minCashFlow(nets);
    
    expect(transfers.length).toBeGreaterThan(0);
    expect(validateTransfers(nets, transfers)).toBe(true);
    expect(getTotalTransferAmount(transfers)).toBe(100);
  });

  it('should handle rounding edge cases', () => {
    const nets: Net[] = [
      { userId: '1', name: 'Alice', net: 33.33 },
      { userId: '2', name: 'Bob', net: 33.33 },
      { userId: '3', name: 'Charlie', net: 33.34 },
      { userId: '4', name: 'David', net: -100 },
    ];

    const transfers = minCashFlow(nets);
    
    expect(transfers.length).toBeGreaterThan(0);
    expect(validateTransfers(nets, transfers)).toBe(true);
    expect(getTotalTransferAmount(transfers)).toBeCloseTo(100, 2);
  });

  it('should handle epsilon tolerance correctly', () => {
    const nets: Net[] = [
      { userId: '1', name: 'Alice', net: 0.005 }, // Below default epsilon
      { userId: '2', name: 'Bob', net: -0.005 },
      { userId: '3', name: 'Charlie', net: 10 },
      { userId: '4', name: 'David', net: -10 },
    ];

    const transfers = minCashFlow(nets);
    
    // Should only handle the 10/-10 transfer, ignore the small amounts
    expect(transfers).toHaveLength(1);
    expect(transfers[0]).toEqual({
      fromUserId: '4',
      toUserId: '3',
      amount: 10,
    });
  });

  it('should handle custom epsilon', () => {
    const nets: Net[] = [
      { userId: '1', name: 'Alice', net: 0.1 },
      { userId: '2', name: 'Bob', net: -0.1 },
    ];

    const transfers = minCashFlow(nets, 0.05); // Smaller epsilon
    
    expect(transfers).toHaveLength(1);
    expect(transfers[0]).toEqual({
      fromUserId: '2',
      toUserId: '1',
      amount: 0.1,
    });
  });

  it('should handle complex scenario with multiple creditors and debtors', () => {
    const nets: Net[] = [
      { userId: '1', name: 'Alice', net: 150 },
      { userId: '2', name: 'Bob', net: 50 },
      { userId: '3', name: 'Charlie', net: -75 },
      { userId: '4', name: 'David', net: -75 },
      { userId: '5', name: 'Eve', net: -50 },
    ];

    const transfers = minCashFlow(nets);
    
    expect(transfers.length).toBeGreaterThan(0);
    expect(validateTransfers(nets, transfers)).toBe(true);
    expect(getTotalTransferAmount(transfers)).toBe(200);
  });

  it('should handle zero net amounts', () => {
    const nets: Net[] = [
      { userId: '1', name: 'Alice', net: 0 },
      { userId: '2', name: 'Bob', net: 100 },
      { userId: '3', name: 'Charlie', net: -100 },
    ];

    const transfers = minCashFlow(nets);
    
    expect(transfers).toHaveLength(1);
    expect(transfers[0]).toEqual({
      fromUserId: '3',
      toUserId: '2',
      amount: 100,
    });
  });

  it('should preserve input array', () => {
    const originalNets: Net[] = [
      { userId: '1', name: 'Alice', net: 100 },
      { userId: '2', name: 'Bob', net: -100 },
    ];

    const netsCopy = JSON.parse(JSON.stringify(originalNets));
    minCashFlow(netsCopy);
    
    expect(netsCopy).toEqual(originalNets);
  });
});

describe('validateTransfers', () => {
  it('should validate correct transfers', () => {
    const nets: Net[] = [
      { userId: '1', name: 'Alice', net: 100 },
      { userId: '2', name: 'Bob', net: -100 },
    ];

    const transfers = [
      { fromUserId: '2', toUserId: '1', amount: 100 },
    ];

    expect(validateTransfers(nets, transfers)).toBe(true);
  });

  it('should reject incorrect transfers', () => {
    const nets: Net[] = [
      { userId: '1', name: 'Alice', net: 100 },
      { userId: '2', name: 'Bob', net: -100 },
    ];

    const transfers = [
      { fromUserId: '2', toUserId: '1', amount: 50 }, // Insufficient
    ];

    expect(validateTransfers(nets, transfers)).toBe(false);
  });
});

describe('getTotalTransferAmount', () => {
  it('should calculate total transfer amount correctly', () => {
    const transfers = [
      { fromUserId: '1', toUserId: '2', amount: 50 },
      { fromUserId: '3', toUserId: '2', amount: 30 },
      { fromUserId: '4', toUserId: '2', amount: 20 },
    ];

    expect(getTotalTransferAmount(transfers)).toBe(100);
  });

  it('should return 0 for empty transfers', () => {
    expect(getTotalTransferAmount([])).toBe(0);
  });
});
