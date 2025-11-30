// Mock data for the AWS Billing Dashboard

export interface Transaction {
  id: string
  date: string
  description: string
  type: "deposit" | "withdrawal"
  amount: number
  icon?: string
  category?: string
}

export interface Account {
  id: string
  name: string
  accountId: string
  payerId: string
  customerName: string
  piva: string
  status: "active" | "inactive"
  depositPercentage: number
  withdrawalPercentage: number
  totalCost: number
  transactions: Transaction[]
}

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "28 novembre",
    description: "7-ELEVEN 34977",
    type: "withdrawal",
    amount: -6.9,
    category: "Card Debit",
  },
  {
    id: "2",
    date: "27 novembre",
    description: "CLIPPER-TRANSIT FARE",
    type: "withdrawal",
    amount: -9.63,
    category: "Card Debit",
  },
  {
    id: "3",
    date: "27 novembre",
    description: "CHANCELLOR HOTEL",
    type: "withdrawal",
    amount: -25.92,
    category: "Card Debit",
  },
  {
    id: "4",
    date: "26 novembre",
    description: "Div.sv 250,000 UNICREDIT",
    type: "deposit",
    amount: 357.05,
    category: "Dividendo Italia",
  },
  {
    id: "5",
    date: "26 novembre",
    description: "Rit.div.su 250,000 UNICREDIT",
    type: "withdrawal",
    amount: -92.83,
    category: "Ritenuta dividendo Italia",
  },
  {
    id: "6",
    date: "25 novembre",
    description: "FASTWEB SPA Addebito SDD fattura a Vs ca ri...",
    type: "withdrawal",
    amount: -31.95,
    category: "SEPA Direct Debit",
  },
]

export const mockAccounts: Account[] = [
  {
    id: "1",
    name: "Production AWS",
    accountId: "123456789123",
    payerId: "123456789123",
    customerName: "Acme Corp",
    piva: "IT12345678",
    status: "active",
    depositPercentage: 20,
    withdrawalPercentage: 80,
    totalCost: 4567.89,
    transactions: mockTransactions,
  },
  {
    id: "2",
    name: "Development AWS",
    accountId: "987654321987",
    payerId: "987654321987",
    customerName: "Acme Corp",
    piva: "IT12345678",
    status: "active",
    depositPercentage: 35,
    withdrawalPercentage: 65,
    totalCost: 1234.56,
    transactions: mockTransactions.slice(0, 3),
  },
  {
    id: "3",
    name: "Testing AWS",
    accountId: "456789123456",
    payerId: "456789123456",
    customerName: "Acme Corp",
    piva: "IT12345678",
    status: "active",
    depositPercentage: 45,
    withdrawalPercentage: 55,
    totalCost: 789.12,
    transactions: mockTransactions.slice(0, 2),
  },
  {
    id: "4",
    name: "Staging AWS",
    accountId: "789123456789",
    payerId: "789123456789",
    customerName: "Acme Corp",
    piva: "IT12345678",
    status: "active",
    depositPercentage: 60,
    withdrawalPercentage: 40,
    totalCost: 456.78,
    transactions: mockTransactions.slice(0, 4),
  },
  {
    id: "5",
    name: "Analytics AWS",
    accountId: "321987654321",
    payerId: "321987654321",
    customerName: "Acme Corp",
    piva: "IT12345678",
    status: "active",
    depositPercentage: 25,
    withdrawalPercentage: 75,
    totalCost: 2345.67,
    transactions: mockTransactions,
  },
]

export const monthlyData = [
  { month: "Jan", cost: 325 },
  { month: "Feb", cost: 487 },
  { month: "Mar", cost: 623 },
  { month: "Apr", cost: 845 },
  { month: "May", cost: 1034 },
  { month: "Jun", cost: 978 },
]

export const depositWithdrawalData = [
  { month: "Jan", income: 450, expenditure: 325 },
  { month: "Feb", income: 520, expenditure: 487 },
  { month: "Mar", income: 680, expenditure: 623 },
  { month: "Apr", income: 890, expenditure: 845 },
  { month: "May", income: 1150, expenditure: 1034 },
  { month: "Jun", income: 1050, expenditure: 978 },
  { month: "Jul", income: 950, expenditure: 890 },
  { month: "Aug", income: 870, expenditure: 820 },
  { month: "Sep", income: 920, expenditure: 875 },
  { month: "Oct", income: 980, expenditure: 915 },
  { month: "Nov", income: 1020, expenditure: 960 },
  { month: "Dec", income: 1100, expenditure: 1045 },
]

export const usageData = [
  { name: "Invoiced", value: 2737.9, color: "hsl(var(--chart-1))" },
  { name: "Received", value: 2463.9, color: "hsl(var(--chart-2))" },
  { name: "Outstanding", value: 274.0, color: "hsl(var(--destructive))" },
]
