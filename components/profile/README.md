# Profile Components

User profile display components for the Anime Guessing Game.

## Components

### ProfileCard
**File:** `ProfileCard.tsx`

A comprehensive profile card displaying user stats, progress, and actions.

**Props:**
- `onEditProfile?: () => void` - Called when edit profile button is clicked
- `onLogout?: () => void` - Called when logout button is clicked

**Features:**
- **Avatar Display:** Circular avatar with gradient border, fallback to User icon
- **Level Badge:** Animated level badge overlaying avatar (yellow/orange gradient)
- **Username & Title:** User's name with "Anime Master" subtitle
- **XP Progress Bar:** Animated progress bar showing current level progress
- **Coins Display:** Highlighted coins counter with icon and gradient background
- **Stats Grid:** 3-column grid showing:
  - Games Played (Target icon, purple)
  - Win Rate % (Trophy icon, green)
  - Current Streak (Flame icon, orange)
- **Action Buttons:** Edit Profile and Logout buttons
- **Additional Stats:** Total XP, Wins, Best Streak, Rank

**Animations:**
- Fade in on mount
- Hover scale on avatar
- Progress bar fill animation
- Animated background gradient
- Hover effects on stat cards and buttons

**Icons Used:** User, Edit, LogOut, Trophy, Flame, Target, Coins

---

### ProfileDropdown
**File:** `ProfileDropdown.tsx`

A dropdown menu for the header with user info and navigation.

**Props:**
- `onNavigate?: (page: 'profile' | 'inventory' | 'settings') => void` - Navigation handler
- `onLogout?: () => void` - Logout handler

**Features:**
- **Trigger Button:**
  - Avatar with level badge
  - Username and coins (hidden on mobile)
  - Animated chevron icon

- **Dropdown Menu:**
  - Profile header with avatar, username, email
  - Level progress bar with percentage
  - Stats grid (2x2):
    - Coins (yellow)
    - Best Streak (orange)
    - Games Played (blue)
    - Accuracy % (green)
  - Navigation menu items:
    - Profile (User icon)
    - Inventory (Package icon)
    - Settings (Settings icon)
    - Logout (LogOut icon, red hover)
  - Footer with mini stats (Games/Wins/Streak)

**Behavior:**
- Click outside to close
- ESC key to close
- Smooth open/close animations
- Staggered menu item animations

**Icons Used:** User, Package, Settings, LogOut, Coins, Trophy, Zap, ChevronDown

---

## Store Integration

Both components use the `profileStore` from `@/store/profileStore`:

```typescript
import { useProfileStore } from '@/store/profileStore';

// In component:
const { profile } = useProfileStore();
```

**Expected Profile Structure:**
```typescript
{
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
```

---

## Usage Examples

### ProfileCard
```tsx
'use client';

import { ProfileCard } from '@/components/profile';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <ProfileCard
        onEditProfile={() => router.push('/profile/edit')}
        onLogout={() => {
          // Handle logout logic
          router.push('/');
        }}
      />
    </div>
  );
}
```

### ProfileDropdown
```tsx
'use client';

import { ProfileDropdown } from '@/components/profile';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between p-4">
      <h1>Anime Guess Game</h1>

      <ProfileDropdown
        onNavigate={(page) => router.push(`/${page}`)}
        onLogout={() => {
          // Handle logout
          router.push('/');
        }}
      />
    </header>
  );
}
```

---

## Styling

**Theme:**
- Dark anime aesthetic with purple/pink gradients
- Glass morphism effects (backdrop-blur)
- Glowing borders and shadows
- Smooth animations and transitions

**Color Palette:**
- Background: `gray-900`, `gray-800`
- Primary: `purple-500/600`
- Secondary: `pink-500/600`
- Level Badge: `yellow-500` to `orange-500`
- Success/Wins: `green-400/500`
- Streak: `orange-400/500`
- Coins: `yellow-400/500`

---

## Dependencies

- React
- Framer Motion
- Lucide React
- Tailwind CSS
- Zustand (for profileStore)

---

## Notes

- Both components gracefully handle missing profile data
- Return `null` if no profile is available
- All animations use Framer Motion for consistency
- Responsive design (some elements hidden on mobile)
- ProfileDropdown calculates XP progress automatically
- ProfileCard shows calculated win rate percentage
