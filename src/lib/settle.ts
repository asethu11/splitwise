export type Net = { userId: string; name: string; net: number }; // +creditor, -debtor
export type Transfer = { fromUserId: string; toUserId: string; amount: number };

/**
 * Calculates minimum cash flow to settle all debts using a greedy algorithm.
 * Repeatedly matches the maximum creditor with the maximum debtor until all balances are within epsilon.
 * 
 * @param nets - Array of net balances for each user
 * @param epsilon - Tolerance for considering a balance settled (default: 0.01)
 * @returns Array of transfers needed to settle all debts
 */
export function minCashFlow(nets: Net[], epsilon = 0.01): Transfer[] {
  const transfers: Transfer[] = [];
  
  // Create deep copies to avoid mutating input
  const creditors = nets
    .filter(net => net.net > epsilon)
    .map(net => ({ ...net }))
    .sort((a, b) => b.net - a.net);
  
  const debtors = nets
    .filter(net => net.net < -epsilon)
    .map(net => ({ ...net }))
    .sort((a, b) => a.net - b.net);

  while (creditors.length > 0 && debtors.length > 0) {
    const maxCreditor = creditors[0];
    const maxDebtor = debtors[0];
    
    const transferAmount = Math.min(maxCreditor.net, -maxDebtor.net);
    
    transfers.push({
      fromUserId: maxDebtor.userId,
      toUserId: maxCreditor.userId,
      amount: Math.round(transferAmount * 100) / 100, // Round to 2 decimal places
    });
    
    // Update balances
    maxCreditor.net -= transferAmount;
    maxDebtor.net += transferAmount;
    
    // Remove settled parties
    if (Math.abs(maxCreditor.net) <= epsilon) {
      creditors.shift();
    }
    if (Math.abs(maxDebtor.net) <= epsilon) {
      debtors.shift();
    }
  }
  
  return transfers;
}

/**
 * Validates that transfers will result in balanced books
 */
export function validateTransfers(nets: Net[], transfers: Transfer[]): boolean {
  const balances = new Map<string, number>();
  
  // Initialize balances from nets
  nets.forEach(net => {
    balances.set(net.userId, net.net);
  });
  
  // Apply transfers
  transfers.forEach(transfer => {
    const fromBalance = balances.get(transfer.fromUserId) || 0;
    const toBalance = balances.get(transfer.toUserId) || 0;
    
    balances.set(transfer.fromUserId, fromBalance + transfer.amount);
    balances.set(transfer.toUserId, toBalance - transfer.amount);
  });
  
  // Check if all balances are close to zero
  const epsilon = 0.01;
  return Array.from(balances.values()).every(balance => Math.abs(balance) <= epsilon);
}

/**
 * Calculates total amount being transferred
 */
export function getTotalTransferAmount(transfers: Transfer[]): number {
  return transfers.reduce((sum, transfer) => sum + transfer.amount, 0);
}
