# Billing Dashboard Frontend

Next.js-based frontend application for the Billing Dashboard.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: React Hooks
- **API Client**: Fetch API

## Project Structure

```
LAP_BillingDashboard_FE/
├── app/
│   ├── accounts/          # Accounts management pages
│   │   ├── [id]/         # Account detail page
│   │   └── page.tsx      # Accounts list page
│   ├── settings/         # Settings page
│   ├── transactions/     # Transactions page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard home
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # App header
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── transaction-list.tsx
│   ├── edit-*-modal.tsx  # Edit modals
│   ├── register-*-modal.tsx  # Registration modals
│   └── unregistered-accounts-section.tsx
├── hooks/
│   └── use-api.ts        # API hooks
├── lib/
│   ├── api.ts            # API client
│   ├── aws-config.ts     # AWS configuration
│   ├── account-utils.ts  # Account utilities
│   └── utils.ts          # General utilities
└── styles/
    └── globals.css       # Global styles
```

## Prerequisites

- Node.js 18+ or 20+
- npm or pnpm

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment

Create `.env.development` and `.env.production` files:

```env
# Development
NEXT_PUBLIC_API_GATEWAY_ID=your-api-id
NEXT_PUBLIC_API_GATEWAY_REGION=eu-west-1
NEXT_PUBLIC_API_GATEWAY_STAGE=dev

# Production
NEXT_PUBLIC_API_GATEWAY_ID=your-api-id
NEXT_PUBLIC_API_GATEWAY_REGION=eu-west-1
NEXT_PUBLIC_API_GATEWAY_STAGE=prd
```

### 3. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

## Features

### Dashboard (Home Page)
- Overview of billing data
- Key metrics and statistics
- Recent transactions
- Quick actions

### Accounts Management
- **Payer Accounts**: View, create, edit payer accounts
- **Usage Accounts**: View, create, edit usage accounts
- **Account Details**: Detailed view with transaction history
- **Unregistered Accounts**: Detect and register accounts from transactions
- **Account Name Pre-population**: Auto-fill names from CUR data

### Transactions
- List all transactions
- Filter by payer/usage account
- View transaction details
- Create new transactions
- Transaction type indicators (DEPOSIT/WITHDRAWAL)

### Settings
- Application configuration
- User preferences
- API endpoint configuration

## API Integration

### Base URL Configuration
```typescript
// lib/aws-config.ts
const API_BASE_URL = `https://${apiGatewayId}.execute-api.${region}.amazonaws.com/${stage}`
```

### API Hooks
```typescript
// hooks/use-api.ts
usePayerAccounts()        // List all payer accounts
useUsageAccounts()        // List all usage accounts
useAllTransactions()      // List all transactions
usePayerAccount(id)       // Get specific payer
useUsageAccount(id)       // Get specific usage account
usePayerTransactions(id)  // Get payer transactions
useAccountTransactions(payerId, accountId)  // Get usage account transactions
```

### API Client
```typescript
// lib/api.ts
payerAccountsApi.getAll()
payerAccountsApi.create(data)
payerAccountsApi.update(id, data)
payerAccountsApi.delete(id)

usageAccountsApi.getAll()
usageAccountsApi.create(data)
usageAccountsApi.update(id, data)
usageAccountsApi.delete(id)

transactionsApi.getAll()
transactionsApi.create(data)
// ... more methods
```

## UI Components

### shadcn/ui Components Used
- Button
- Card
- Dialog/Modal
- Input
- Label
- Select
- Alert
- Badge
- Progress
- Tabs
- Table

### Custom Components
- `Header`: Application header with navigation
- `Sidebar`: Side navigation menu
- `TransactionList`: Transaction display component
- `EditPayerAccountModal`: Edit payer account
- `EditUsageAccountModal`: Edit usage account
- `RegisterPayerAccountModal`: Create payer account
- `RegisterUsageAccountModal`: Create usage account
- `UnregisteredAccountsSection`: Detect unregistered accounts

## Styling

### Tailwind Configuration
```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: '#EC9400',    // Orange
      secondary: '#026172',  // Teal
      // ... more colors
    }
  }
}
```

### Color Scheme
- **Primary**: Orange (#EC9400) - Payer accounts, primary actions
- **Secondary**: Teal (#026172) - Usage accounts, secondary actions
- **Background**: Light gray for cards and sections
- **Text**: Dark gray for primary text, muted for secondary

## Responsive Design

- **Mobile**: Single column layout, hamburger menu
- **Tablet**: 2-column grid for cards
- **Desktop**: 3-column grid, full sidebar

## Data Flow

```
User Action → Component → API Hook → API Client → Backend API
                ↓
            State Update
                ↓
            UI Re-render
```

## Error Handling

- API errors displayed with Alert components
- Loading states with spinners
- Empty states with friendly messages
- Form validation with inline errors

## Performance Optimizations

- React Server Components where applicable
- Client-side data caching via hooks
- Optimistic UI updates
- Lazy loading for heavy components

## Development Workflow

1. **Make changes** in `app/`, `components/`, or `lib/`
2. **Test locally** with `npm run dev`
3. **Build** with `npm run build`
4. **Deploy** to hosting platform

## Environment Variables

### Required
- `NEXT_PUBLIC_API_GATEWAY_ID`: API Gateway ID
- `NEXT_PUBLIC_API_GATEWAY_REGION`: AWS region
- `NEXT_PUBLIC_API_GATEWAY_STAGE`: API stage (dev/prd)

### Optional
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Application version

## Testing

### Manual Testing Checklist
- [ ] Dashboard loads correctly
- [ ] Accounts page displays payer and usage accounts
- [ ] Can create new payer account
- [ ] Can create new usage account
- [ ] Can edit existing accounts
- [ ] Account details page shows transactions
- [ ] Transactions page displays all transactions
- [ ] Unregistered accounts are detected
- [ ] Can register unregistered accounts
- [ ] Settings page loads

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Other Platforms
Build the static export:
```bash
npm run build
```

Deploy the `.next` directory to your hosting platform.

## Troubleshooting

### API Connection Issues
- Verify API Gateway URL in environment variables
- Check CORS configuration on backend
- Verify API Gateway is deployed

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall
- Check TypeScript errors: `npm run type-check`

### Styling Issues
- Rebuild Tailwind: `npm run dev` (auto-rebuilds)
- Check `globals.css` imports
- Verify shadcn/ui components are installed

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance

## Security

- No sensitive data in client-side code
- API keys in environment variables only
- HTTPS enforced in production
- Input validation on forms
- XSS protection via React

## Performance Metrics

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API connectivity
3. Review environment variables
4. Check backend API status

## License

Internal use only.
