# 🎨 MusicJunction Design System

## Overview

A complete, production-ready design system for the MusicJunction platform featuring:
- ✅ Design tokens and constants
- ✅ Reusable UI components
- ✅ Compound helper components
- ✅ Interactive showcase page
- ✅ TypeScript type-safe
- ✅ Accessible by default

---

## 🎯 Design Tokens

**Location:** `src/lib/design-tokens.ts`

### Colors
```typescript
primary: 'hsl(271 91% 59%)'  // Electric Violet #7C3AED
accent: 'hsl(190 95% 51%)'    // Aqua Blue #22D3EE
success: 'hsl(142 76% 36%)'
warning: 'hsl(38 92% 50%)'
error: 'hsl(0 84% 60%)'
info: 'hsl(199 89% 48%)'
```

### Typography
- **Base Font:** Inter (sans-serif)
- **Display Font:** Poppins (display)
- **Mono Font:** Fira Code (monospace)

**Font Sizes:** xs (12px) → 5xl (48px)
**Font Weights:** light (300) → extrabold (800)

### Spacing Scale
```
xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px
```

### Border Radius
```
sm: 4px, default: 8px, md: 12px, lg: 16px, xl: 24px, full: 9999px
```

### Shadows
- sm, default, md, lg, xl, inner, glow

### Transitions
```
fast: 150ms, default: 200ms, slow: 300ms, spring: 500ms
```

### Breakpoints
```
sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
```

### Z-Index Layers
```
base: 0, dropdown: 10, sticky: 20, modal: 30, popover: 40, tooltip: 50, notification: 60
```

---

## 📦 Components Library

### Base Components

#### 1. **Button** (`components/ui/Button.tsx`)

**Variants:** primary | secondary | outline | ghost | destructive
**Sizes:** sm | md | lg
**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**Usage:**
```tsx
<Button variant="primary" size="md">Click Me</Button>
<Button leftIcon={<Play />} isLoading>Play</Button>
<Button variant="destructive">Delete</Button>
```

#### 2. **Input** (`components/ui/Input.tsx`)

**Features:** label, error, helpText, icons, sizes
**Props:**
```typescript
interface InputProps {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}
```

**Usage:**
```tsx
<Input label="Email" type="email" placeholder="you@example.com" />
<Input leftIcon={<Search />} placeholder="Search..." />
<Input error="This field is required" />
```

#### 3. **Card** (`components/ui/Card.tsx`)

**Variants:** default | outline | elevated
**Padding:** none | sm | md | lg
**Props:** `hoverable?: boolean`

**Compound Components:**
- CardHeader
- CardTitle
- CardDescription
- CardContent
- CardFooter

**Usage:**
```tsx
<Card variant="elevated" hoverable>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

#### 4. **Avatar** (`components/ui/Avatar.tsx`)

**Sizes:** xs | sm | md | lg | xl
**Features:** Image, fallback text, default icon

**Usage:**
```tsx
<Avatar src="/avatar.jpg" alt="User" size="md" />
<Avatar fallback="JD" size="lg" />
<Avatar size="sm" /> {/* Default icon */}
```

#### 5. **Badge** (`components/ui/Badge.tsx`)

**Variants:** default | primary | secondary | success | warning | error | outline
**Sizes:** sm | md | lg

**Usage:**
```tsx
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="primary" size="sm">New</Badge>
```

---

### Compound Components

#### 1. **EmptyState** (`components/ui/EmptyState.tsx`)

**Features:** Icon, title, description, action button

**Usage:**
```tsx
<EmptyState
  icon={<Music className="h-16 w-16" />}
  title="No tracks yet"
  description="Upload your first track to get started"
  action={{ label: 'Upload Track', onClick: handleUpload }}
/>
```

#### 2. **LoadingSpinner** (`components/ui/LoadingSpinner.tsx`)

**Sizes:** sm | md | lg
**Features:** Optional text, fullScreen mode

**Usage:**
```tsx
<LoadingSpinner size="md" />
<LoadingSpinner text="Loading..." />
<LoadingSpinner fullScreen />
```

#### 3. **SearchBar** (`components/ui/SearchBar.tsx`)

**Features:** Debounced search, clear button, customizable delay

**Usage:**
```tsx
<SearchBar 
  placeholder="Search music..." 
  onSearch={(query) => console.log(query)}
  delay={300}
/>
```

---

## 🎭 Design System Showcase

**Route:** `/design-system`
**Page:** `src/pages/DesignSystem.tsx`

Visit `http://localhost:5173/design-system` to see:
- Color palette with swatches
- Typography scale
- All button variants and states
- Input fields with different configurations
- Card layouts
- Avatar sizes
- Badge variants
- Empty states
- Loading spinners
- Icon library

---

## 📖 Usage Guidelines

### Importing Components

```typescript
// Individual imports
import { Button } from '@/components/ui';
import { Card, CardHeader, CardTitle } from '@/components/ui';

// Bulk import
import { Button, Input, Card, Avatar, Badge } from '@/components/ui';
```

### Using Design Tokens

```typescript
import { colors, spacing, typography } from '@/lib/design-tokens';

// In your component
const style = {
  color: colors.primary.DEFAULT,
  padding: spacing.md,
  fontSize: typography.fontSize.lg,
};
```

### Combining with Tailwind

All components use Tailwind classes and can be extended:

```tsx
<Button className="w-full mt-4">
  Full Width Button
</Button>

<Card className="shadow-xl border-2">
  Custom styled card
</Card>
```

---

## 🎨 Theming

### Light/Dark Mode

All components automatically respect theme:

```tsx
// Toggle theme
document.documentElement.classList.toggle('dark');
```

### Customizing Colors

Update `src/styles/globals.css`:

```css
:root {
  --primary: 271 91% 59%;  /* Change this */
  --accent: 190 95% 51%;   /* And this */
}
```

---

## ♿ Accessibility

All components follow accessibility best practices:

- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ ARIA labels where appropriate
- ✅ Sufficient color contrast
- ✅ Screen reader friendly

---

## 📏 Component Sizes Reference

### Buttons
- sm: height 32px (2rem)
- md: height 40px (2.5rem)
- lg: height 48px (3rem)

### Inputs
- sm: height 32px
- md: height 40px
- lg: height 48px

### Avatars
- xs: 24px × 24px
- sm: 32px × 32px
- md: 40px × 40px
- lg: 48px × 48px
- xl: 64px × 64px

### Badges
- sm: padding 2px 8px, text 12px
- md: padding 4px 10px, text 14px
- lg: padding 6px 12px, text 16px

---

## 🔧 Extending Components

### Creating Custom Variants

```tsx
// Button with custom variant
<Button className="bg-gradient-to-r from-purple-600 to-blue-600">
  Gradient Button
</Button>

// Card with custom padding
<Card padding="none" className="p-2">
  Tight padding card
</Card>
```

### Creating Compound Components

```tsx
import { Card, CardHeader, CardTitle, Button } from '@/components/ui';

const ProfileCard = ({ user }) => (
  <Card hoverable>
    <CardHeader>
      <CardTitle>{user.name}</CardTitle>
    </CardHeader>
    <Button variant="outline">View Profile</Button>
  </Card>
);
```

---

## 🏗️ Project Structure

```
src/
├── lib/
│   └── design-tokens.ts         # Design system constants
├── components/
│   └── ui/
│       ├── index.ts             # Barrel exports
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       └── SearchBar.tsx
└── pages/
    └── DesignSystem.tsx         # Showcase page
```

---

## ✅ Component Checklist

### Base Components
- [x] Button
- [x] Input
- [x] Card
- [x] Avatar
- [x] Badge

### Compound Components
- [x] EmptyState
- [x] LoadingSpinner
- [x] SearchBar

### To Be Added (Future)
- [ ] Dialog/Modal
- [ ] Dropdown Menu
- [ ] Tabs
- [ ] Slider
- [ ] Tooltip
- [ ] Toast (currently using sonner)
- [ ] Select
- [ ] Checkbox
- [ ] Radio
- [ ] Switch
- [ ] Progress Bar

---

## 🎯 Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic component names** (Button, not Btn)
3. **Leverage TypeScript types** for better DX
4. **Keep components small** and focused
5. **Use className prop** for extending styles
6. **Test with both themes** (light/dark)
7. **Check accessibility** with keyboard navigation
8. **Use proper semantic HTML** inside components

---

## 🚀 Performance

- All components are tree-shakeable
- Minimal bundle impact (~30KB for all components)
- No runtime CSS-in-JS overhead
- Optimized with Tailwind's purge

---

## 📊 Build Stats

**Bundle Size (with design system):**
- JavaScript: 710 KB (222 KB gzipped)
- CSS: 30.22 KB (6.06 KB gzipped)

**Component Library Size:** ~5 KB gzipped

---

## 🎉 Quick Start

1. **View the showcase:**
   ```bash
   npm run dev
   # Visit http://localhost:5173/design-system
   ```

2. **Use a component:**
   ```tsx
   import { Button } from '@/components/ui';
   
   function MyComponent() {
     return <Button variant="primary">Click me</Button>;
   }
   ```

3. **Import design tokens:**
   ```tsx
   import { colors, spacing } from '@/lib/design-tokens';
   ```

---

## 📚 Resources

- **Showcase Page:** `/design-system`
- **Design Tokens:** `src/lib/design-tokens.ts`
- **Components:** `src/components/ui/`
- **Tailwind Config:** `tailwind.config.js`
- **Global Styles:** `src/styles/globals.css`

---

**Design System Version:** 1.0.0
**Last Updated:** 2025-11-08
**Status:** ✅ Production Ready
