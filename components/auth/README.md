# Authentication Components

Dark anime-themed authentication UI components for the Anime Guessing Game.

## Components

### LoginForm
**File:** `LoginForm.tsx`

A login form with username/password inputs, remember me checkbox, and loading states.

**Props:**
- `onSuccess: () => void` - Called when login is successful
- `onSwitchToRegister: () => void` - Called when user wants to switch to registration

**Features:**
- Username and password inputs with Lucide icons
- Password visibility toggle (Eye/EyeOff icons)
- Remember me checkbox
- Error message display with animations
- Loading state with spinner animation
- Glowing input focus states with purple/pink theme
- Animated gradient button

**Icons Used:** User, Lock, LogIn, Eye, EyeOff

---

### RegisterForm
**File:** `RegisterForm.tsx`

A registration form with real-time validation and visual feedback.

**Props:**
- `onSuccess: () => void` - Called when registration is successful
- `onSwitchToLogin: () => void` - Called when user wants to switch to login

**Features:**
- Username validation (3-20 chars, alphanumeric + underscore)
- Password validation (minimum 6 characters)
- Confirm password matching
- Real-time validation with visual feedback (green checkmark/red X)
- Success and error message displays
- Password visibility toggles for both fields
- Disabled state during submission
- Animated feedback with Framer Motion

**Icons Used:** User, Lock, UserPlus, Eye, EyeOff, CheckCircle2, AlertCircle

---

### AuthModal
**File:** `AuthModal.tsx`

A modal wrapper that switches between login and register forms.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Called when modal should close

**Features:**
- Animated modal entrance/exit
- Dark backdrop with blur effect
- Tab-like switching between Login and Register
- Animated tab indicator with layoutId
- Close button (X icon)
- ESC key support to close
- Body scroll lock when open
- Animated background gradient
- Decorative blur elements

**Modal Header:**
- Dynamic title based on current view
- Subtitle text that changes with view

---

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import { AuthModal } from '@/components/auth';

export default function MyPage() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <button onClick={() => setShowAuth(true)}>
        Login
      </button>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </>
  );
}
```

## Styling

All components use:
- **Theme:** Dark background with purple/pink gradient accents
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

**Color Palette:**
- Background: `gray-900`, `gray-800`
- Primary: `purple-500/600`
- Secondary: `pink-500/600`
- Success: `green-500`
- Error: `red-500`
- Warning: `yellow-500/orange-500`

## Dependencies

- React
- Framer Motion
- Lucide React
- Tailwind CSS

## Notes

- All forms include TODO comments for API integration
- Currently using simulated API calls with setTimeout
- Form validation happens on submit
- RegisterForm provides real-time visual feedback
- All components are client components ('use client')
