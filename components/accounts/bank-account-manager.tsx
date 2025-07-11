"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, CreditCard, Eye, EyeOff, Wallet, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CurrencyInput } from "@/components/ui/currency-input"
import { useCurrency } from "@/providers/currency-provider"
import { useApi, apiCall } from "@/hooks/use-api"
import { BANKS, E_WALLETS, ACCOUNT_TYPES, ACCOUNT_COLORS } from "@/lib/constants"

interface BankAccount {
  id: number
  name: string
  bankName: string
  accountNumber: string
  balance: number
  type: "checking" | "savings" | "credit" | "ewallet"
  color: string
  isActive: boolean
}

export function BankAccountManager() {
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [showBalances, setShowBalances] = useState(true)
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()

  const { data: accounts, loading, error, refetch } = useApi<BankAccount[]>("/api/bank-accounts")

  const addAccount = async (accountData: Omit<BankAccount, "id">) => {
    try {
      await apiCall("/api/bank-accounts", {
        method: "POST",
        body: {
          name: accountData.name,
          bankName: accountData.bankName,
          accountNumber: accountData.accountNumber,
          balance: accountData.balance,
          type: accountData.type,
          color: accountData.color,
          isActive: accountData.isActive,
        },
      })

      await refetch()
      setIsAddingAccount(false)
      toast({
        title: "Account Added",
        description: `Added ${accountData.bankName} account successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add account",
        variant: "destructive",
      })
    }
  }

  const updateAccount = async (updatedAccount: BankAccount) => {
    try {
      await apiCall("/api/bank-accounts", {
        method: "PUT",
        body: {
          id: updatedAccount.id,
          name: updatedAccount.name,
          bankName: updatedAccount.bankName,
          accountNumber: updatedAccount.accountNumber,
          balance: updatedAccount.balance,
          type: updatedAccount.type,
          color: updatedAccount.color,
          isActive: updatedAccount.isActive,
        },
      })

      await refetch()
      setEditingAccount(null)
      toast({
        title: "Account Updated",
        description: "Account has been successfully updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      })
    }
  }

  const deleteAccount = async (id: number) => {
    try {
      await apiCall(`/api/bank-accounts?id=${id}`, {
        method: "DELETE",
      })

      await refetch()
      toast({
        title: "Account Deleted",
        description: "Account has been removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      })
    }
  }

  const toggleAccountStatus = async (account: BankAccount) => {
    try {
      await apiCall("/api/bank-accounts", {
        method: "PUT",
        body: {
          id: account.id,
          name: account.name,
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          balance: account.balance,
          type: account.type,
          color: account.color,
          isActive: !account.isActive,
        },
      })

      await refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading accounts...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading accounts: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  const accountList = accounts || []
  const totalBalance = accountList
    .filter((acc) => acc.isActive && acc.type !== "credit")
    .reduce((sum, acc) => {
      const balance = typeof acc.balance === "string" ? Number.parseFloat(acc.balance) || 0 : acc.balance || 0
      return sum + balance
    }, 0)
  const activeAccounts = accountList.filter((acc) => acc.isActive)
  const bankAccountsOnly = accountList.filter((acc) => {
    console.log(`Account ${acc.name} has type: ${acc.type}`); // Changed from acc.accountType to acc.type
    return acc.type === "checking" || acc.type === "savings";
  })
  const eWallets = accountList.filter((acc) => acc.type === "ewallet")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Balance</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Wallet className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{showBalances ? formatCurrency(totalBalance) : "••••••"}</div>
            <p className="text-xs text-green-600 mt-1">Across all accounts</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Active Accounts</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{activeAccounts.length}</div>
            <p className="text-xs text-blue-600 mt-1">of {accountList.length} total</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">Bank Accounts</CardTitle>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <CreditCard className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{bankAccountsOnly.length}</div>
            <p className="text-xs text-indigo-600 mt-1">Traditional banks</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">E-Wallets</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Wallet className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{eWallets.length}</div>
            <p className="text-xs text-purple-600 mt-1">Digital wallets</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bank Accounts</h2>
          <p className="text-muted-foreground">Manage your bank accounts and e-wallets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBalances(!showBalances)}>
            {showBalances ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showBalances ? "Hide" : "Show"} Balances
          </Button>
          <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>Add a bank account or e-wallet to track</DialogDescription>
              </DialogHeader>
              <AccountForm onSubmit={addAccount} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accountList.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No accounts added yet</p>
              <Button onClick={() => setIsAddingAccount(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          accountList.map((account) => (
            <Card key={account.id} className={`${!account.isActive ? "opacity-60" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: account.color }} />
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{account.bankName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{ACCOUNT_TYPES.find((t) => t.value === account.type)?.label}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">{showBalances ? formatCurrency(account.balance) : "••••••"}</div>
                  <p className="text-xs text-muted-foreground">••••{account.accountNumber.slice(-4)}</p>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => toggleAccountStatus(account)}>
                    {account.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Account</DialogTitle>
                      </DialogHeader>
                      <AccountForm account={account} onSubmit={(formData) => {
                        if ('id' in formData) {
                          updateAccount(formData as BankAccount);
                        }
                      }} />
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={() => deleteAccount(account.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

interface AccountFormProps {
  account?: BankAccount
  onSubmit: (account: BankAccount | Omit<BankAccount, "id">) => void
}

function AccountForm({ account, onSubmit }: AccountFormProps) {
  const [name, setName] = useState(account?.name || "")
  const [bankName, setBankName] = useState(account?.bankName || "")
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || "")
  const [balance, setBalance] = useState(account?.balance.toString() || "0")
  const [type, setType] = useState(account?.type || "checking")  // Changed from account?.accountType to account?.type
  const [color, setColor] = useState(account?.color || ACCOUNT_COLORS[0])
  const [isActive, setIsActive] = useState(account?.isActive ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const balanceValue = Number.parseFloat(balance) || 0

    const accountData = {
      name,
      bankName,
      accountNumber,
      balance: balanceValue,
      type: type as BankAccount["type"],  // Changed from accountType to type
      color,
      isActive,
    }

    if (account) {
      onSubmit({ ...account, ...accountData })
    } else {
      onSubmit(accountData)
    }
  }

  const bankOptions = type === "ewallet" ? E_WALLETS : BANKS

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          placeholder="My Main Account"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Account Type</Label>
        <Select value={type} onValueChange={(value) => setType(value as BankAccount["type"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankName">{type === "ewallet" ? "E-Wallet Provider" : "Bank Name"}</Label>
        <Select value={bankName} onValueChange={setBankName} required>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${type === "ewallet" ? "e-wallet" : "bank"}`} />
          </SelectTrigger>
          <SelectContent>
            {bankOptions.map((bank) => (
              <SelectItem key={bank} value={bank}>
                {bank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountNumber">{type === "ewallet" ? "Phone/Account ID" : "Account Number"}</Label>
          <Input
            id="accountNumber"
            placeholder={type === "ewallet" ? "081234567890" : "1234567890"}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="balance">Current Balance (IDR)</Label>
          <CurrencyInput id="balance" value={balance} onChange={setBalance} placeholder="0.00" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Account Color</Label>
        <div className="flex flex-wrap gap-2">
          {ACCOUNT_COLORS.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${color === colorOption ? "border-gray-800" : "border-gray-300"
                }`}
              style={{ backgroundColor: colorOption }}
              onClick={() => setColor(colorOption)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <Label htmlFor="isActive">Account is active</Label>
      </div>

      <Button type="submit" className="w-full">
        {account ? "Update Account" : "Add Account"}
      </Button>
    </form>
  )
}
