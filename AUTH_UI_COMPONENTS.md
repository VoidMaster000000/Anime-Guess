# Authentication & Profile UI Components

Complete authentication and profile UI system for the Anime Guessing Game with a dark anime theme.

## Created Components

### Authentication Components (`components/auth/`)

1. **LoginForm.tsx**
   - Username and password inputs with Lucide icons
   - Password visibility toggle
   - Remember me checkbox
   - Error message display with animations
   - Loading state with spinner
   - Purple/pink gradient button

2. **RegisterForm.tsx**
   - Username validation (3-20 chars, alphanumeric + underscore)
   - Password validation (min 6 chars)
   - Confirm password matching
   - Real-time validation feedback (green checkmark/red X)
   - Success and error messages
   - Password visibility toggles

3. **AuthModal.tsx**
   - Modal wrapper with backdrop and blur
   - Tab switching between Login/Register
   - Animated tab indicator
   - Close button with ESC key support
   - Body scroll lock
   - Animated background gradient

### Profile Components (`components/profile/`)

4. **ProfileCard.tsx**
   - Avatar with level badge overlay
   - XP progress bar with animation
   - Coins display with gradient background
   - Stats grid: Games, Win Rate %, Streak
   - Edit Profile and Logout buttons
   - Additional stats section
   - Animated background and hover effects

5. **ProfileDropdown.tsx**
   - Dropdown trigger with avatar, username, level, coins
   - Profile header with progress bar
   - Stats grid: Coins, Best Streak, Games, Accuracy
   - Navigation menu: Profile, Inventory, Settings, Logout
   - Footer mini stats
   - Click outside and ESC to close

## File Structure

```
anime-guess-game/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── AuthModal.tsx
│   │   ├── index.ts
│   │   └── README.md
│   └── profile/
│       ├── ProfileCard.tsx
│       ├── ProfileDropdown.tsx
│       ├── CoinDisplay.tsx (existing)
│       ├── LevelProgress.tsx (existing)
│       ├── index.ts
│       └── README.md
```

## Tech Stack

- **React** - Component library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Zustand** - State management (profileStore)

## Design System

### Color Palette
- Background: `gray-900`, `gray-800`
- Primary: `purple-500/600`
- Secondary: `pink-500/600`
- Success: `green-500`
- Error: `red-500`
- Warning: `yellow-500`, `orange-500`
- Level Badge: `yellow-500` to `orange-500` gradient

### Icons Used
- **Auth:** User, Lock, LogIn, Eye, EyeOff, UserPlus, CheckCircle2, AlertCircle
- **Profile:** User, Edit, LogOut, Trophy, Flame, Target, Coins, Package, Settings, ChevronDown, Zap

### Key Features
- Dark anime theme with purple/pink gradients
- Glass morphism effects (backdrop-blur)
- Glowing borders and focus states
- Smooth animations and transitions
- Responsive design
- Accessibility (ESC key, focus states)

## Quick Start

### Using AuthModal
```tsx
'use client';

import { useState } from 'react';
import { AuthModal } from '@/components/auth';

export default function Page() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <button onClick={() => setShowAuth(true)}>Login</button>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
```

### Using ProfileDropdown
```tsx
'use client';

import { ProfileDropdown } from '@/components/profile';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <header>
      <ProfileDropdown
        onNavigate={(page) => router.push(`/${page}`)}
        onLogout={() => router.push('/')}
      />
    </header>
  );
}
```

### Using ProfileCard
```tsx
'use client';

import { ProfileCard } from '@/components/profile';

export default function ProfilePage() {
  return (
    <ProfileCard
      onEditProfile={() => console.log('Edit')}
      onLogout={() => console.log('Logout')}
    />
  );
}
```

## API Integration

All auth forms include TODO comments for API integration:

```typescript
// In LoginForm.tsx and RegisterForm.tsx
// TODO: Replace with actual API call
console.log('Login attempt:', { username, rememberMe });
```

Replace the simulated API calls with your actual authentication endpoints.

## Store Requirements

Profile components expect a `profileStore` at `@/store/profileStore` with:

```typescript
{
  profile: {
    username: string;
    avatar?: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    totalXP?: number;
    coins: number;
    gamesPlayed: number;
    gamesWon: number;
    streak: number;
    bestStreak?: number;
    rank?: number;
  }
}
```

## Animations

All components use Framer Motion for:
- Fade in/out transitions
- Slide animations
- Scale effects on hover/tap
- Progress bar fills
- Staggered list animations
- Layout animations (tab switching)

## Accessibility

- Keyboard navigation support
- ESC key to close modals/dropdowns
- Click outside to close
- Focus states on all interactive elements
- Proper ARIA labels via Lucide icons
- Form validation with clear error messages

## Next Steps

1. **Integrate with Backend:**
   - Replace TODO API calls with real endpoints
   - Implement actual authentication logic
   - Connect to user database

2. **Add Features:**
   - Password reset flow
   - Email verification
   - Social login (OAuth)
   - Profile editing modal
   - Avatar upload

3. **Testing:**
   - Unit tests for validation logic
   - Integration tests for forms
   - E2E tests for auth flow

4. **Enhancements:**
   - Toast notifications for success/error
   - Progressive form validation
   - Loading skeletons
   - Error boundaries

## Notes

- All components use `'use client'` directive
- Validation logic is reusable and can be extracted
- Components are fully typed with TypeScript
- Responsive design with mobile-first approach
- All forms include loading states
- ProfileDropdown handles missing profile gracefully
