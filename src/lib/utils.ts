import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LedgerEntry, Transfer } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Greedy algorithm to minimize cash flow between users
 * Finds the largest creditor and largest debtor, settles between them
 */
export function minCashFlow(ledger: LedgerEntry[]): Transfer[] {
  const transfers: Transfer[] = []
  const balances = new Map<string, number>()
  
  // Initialize balances
  ledger.forEach(entry => {
    balances.set(entry.userId, entry.netAmount)
  })
  
  while (true) {
    // Find largest creditor and debtor
    let maxCredit = -Infinity
    let maxDebt = Infinity
    let creditorId = ''
    let debtorId = ''
    
    balances.forEach((amount, userId) => {
      if (amount > maxCredit) {
        maxCredit = amount
        creditorId = userId
      }
      if (amount < maxDebt) {
        maxDebt = amount
        debtorId = userId
      }
    })
    
    // If no more settlements needed
    if (maxCredit <= 0.01 || maxDebt >= -0.01) break
    
    // Calculate transfer amount
    const transferAmount = Math.min(maxCredit, -maxDebt)
    
    // Get user names
    const creditor = ledger.find(l => l.userId === creditorId)!
    const debtor = ledger.find(l => l.userId === debtorId)!
    
    // Add transfer
    transfers.push({
      fromUserId: debtorId,
      fromUserName: debtor.userName,
      toUserId: creditorId,
      toUserName: creditor.userName,
      amount: transferAmount
    })
    
    // Update balances
    balances.set(creditorId, maxCredit - transferAmount)
    balances.set(debtorId, maxDebt + transferAmount)
  }
  
  return transfers
}

/**
 * Generate CSV content from ledger data
 */
export function generateCSV(ledger: LedgerEntry[]): string {
  const headers = ['Name', 'Total Paid', 'Total Owed', 'Net Amount']
  const rows = ledger.map(entry => [
    entry.userName,
    entry.totalPaid.toFixed(2),
    entry.totalOwed.toFixed(2),
    entry.netAmount.toFixed(2)
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  return csvContent
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
