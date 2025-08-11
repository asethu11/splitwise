'use client'

import { Download } from 'lucide-react'
import { useLedger } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { downloadCsv, formatCurrency } from '@/lib/csv'
import { toast } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface ExportTabProps {
  groupId: string
  groupName: string
}

export function ExportTab({ groupId, groupName }: ExportTabProps) {
  const { data: ledger, isLoading } = useLedger(groupId)

  const handleExport = () => {
    if (ledger && ledger.length > 0) {
      try {
        // Prepare CSV data with headers
        const csvData = [
          ['Member Name', 'Total Paid', 'Total Owed', 'Net Balance'],
          ...ledger.map(entry => [
            entry.userName,
            formatCurrency(entry.totalPaid),
            formatCurrency(entry.totalOwed),
            formatCurrency(entry.balance)
          ])
        ]
        
        const filename = `group-${groupName.toLowerCase().replace(/\s+/g, '-')}`
        downloadCsv(csvData, filename)
        toast.success('CSV exported successfully!')
      } catch (error) {
        toast.error('Failed to export CSV')
        console.error('Export error:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Export Data</h2>
          <p className="text-sm text-muted-foreground">
            Download your group&apos;s expense data as a CSV file
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">CSV Export</h3>
              <p className="text-sm text-muted-foreground">
                Includes all member balances and totals
              </p>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={!ledger || ledger.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {ledger && ledger.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The CSV will include the following data:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Member names</li>
                <li>• Total amount paid by each member</li>
                <li>• Total amount owed by each member</li>
                <li>• Net balance for each member</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                File will be named: <code className="bg-muted px-1 rounded">group-{groupName.toLowerCase().replace(/\s+/g, '-')}.csv</code>
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No data to export</h3>
              <p className="text-muted-foreground">
                Add expenses to generate exportable data
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Export Format</h4>
          <p className="text-sm text-blue-800">
            The CSV file will be compatible with Excel, Google Sheets, and other spreadsheet applications. 
            The file includes UTF-8 BOM for proper Excel compatibility and safe escaping of special characters.
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}
