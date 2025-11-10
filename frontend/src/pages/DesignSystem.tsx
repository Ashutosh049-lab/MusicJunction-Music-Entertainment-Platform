import { useState } from 'react';
import { Play, Heart, Music, Download, Share2 } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
  Badge,
  EmptyState,
  LoadingSpinner,
  SearchBar,
} from '../components/ui';

const DesignSystem = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-12">
        <h1 className="font-display text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Design System
        </h1>
        <p className="text-xl text-muted-foreground">
          MusicJunction UI Component Library
        </p>
      </div>

      {/* Colors */}
      <Section title="Colors" description="Brand colors and semantic color palette">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Primary" color="hsl(var(--primary))" className="bg-primary" />
          <ColorSwatch name="Accent" color="hsl(var(--accent))" className="bg-accent" />
          <ColorSwatch name="Success" color="hsl(142 76% 36%)" className="bg-green-600" />
          <ColorSwatch name="Warning" color="hsl(38 92% 50%)" className="bg-yellow-500" />
          <ColorSwatch name="Error" color="hsl(0 84% 60%)" className="bg-destructive" />
          <ColorSwatch name="Muted" color="hsl(var(--muted))" className="bg-muted" />
          <ColorSwatch name="Secondary" color="hsl(var(--secondary))" className="bg-secondary" />
          <ColorSwatch name="Card" color="hsl(var(--card))" className="bg-card border" />
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" description="Font families, sizes, and weights">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Display Font (Poppins)</p>
            <h1 className="font-display text-5xl font-bold">The quick brown fox</h1>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Body Font (Inter)</p>
            <p className="text-base">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="flex flex-wrap items-baseline gap-6">
            <span className="text-xs">XS 12px</span>
            <span className="text-sm">SM 14px</span>
            <span className="text-base">Base 16px</span>
            <span className="text-lg">LG 18px</span>
            <span className="text-xl">XL 20px</span>
            <span className="text-2xl">2XL 24px</span>
            <span className="text-3xl">3XL 30px</span>
          </div>
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons" description="Button variants and sizes">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">With Icons</h3>
            <div className="flex flex-wrap gap-3">
              <Button leftIcon={<Play className="h-4 w-4" />}>Play</Button>
              <Button rightIcon={<Heart className="h-4 w-4" />}>Like</Button>
              <Button isLoading>Loading</Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">States</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button isLoading>Loading</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Inputs" description="Input fields with variants">
        <div className="space-y-6 max-w-2xl">
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input
            label="Search"
            placeholder="Search tracks..."
            leftIcon={<Music className="h-4 w-4" />}
          />
          <Input
            label="With Error"
            error="This field is required"
            placeholder="Enter something..."
          />
          <Input
            label="With Help Text"
            helpText="We'll never share your email"
            placeholder="your@email.com"
          />
          <SearchBar placeholder="Search music..." onSearch={setSearchQuery} />
          {searchQuery && <p className="text-sm text-muted-foreground">Searching for: {searchQuery}</p>}
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards" description="Card layouts and compositions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card with border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">This is the card content area.</p>
            </CardContent>
          </Card>

          <Card variant="outline">
            <CardHeader>
              <CardTitle>Outline Card</CardTitle>
              <CardDescription>Card with thicker border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Emphasized border style.</p>
            </CardContent>
          </Card>

          <Card variant="elevated" hoverable>
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>With shadow and hover effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Hover to see the effect!</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Avatars */}
      <Section title="Avatars" description="User avatars with sizes">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar size="xs" />
            <span className="text-xs text-muted-foreground">XS</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar size="sm" />
            <span className="text-xs text-muted-foreground">SM</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar size="md" />
            <span className="text-xs text-muted-foreground">MD</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar size="lg" />
            <span className="text-xs text-muted-foreground">LG</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar size="xl" />
            <span className="text-xs text-muted-foreground">XL</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar size="md" fallback="JD" />
            <span className="text-xs text-muted-foreground">Fallback</span>
          </div>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges" description="Status badges and labels">
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge size="sm">Small</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </Section>

      {/* Empty States */}
      <Section title="Empty States" description="Empty state messages">
        <Card>
          <EmptyState
            icon={<Music className="h-16 w-16" />}
            title="No tracks yet"
            description="You haven't uploaded any tracks. Start by uploading your first track!"
            action={{ label: 'Upload Track', onClick: () => alert('Upload clicked') }}
          />
        </Card>
      </Section>

      {/* Loading States */}
      <Section title="Loading States" description="Loading spinners and indicators">
        <div className="space-y-6">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-xs text-muted-foreground">Small</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="md" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="lg" />
              <span className="text-xs text-muted-foreground">Large</span>
            </div>
          </div>
          <Card padding="lg">
            <LoadingSpinner text="Loading your music..." />
          </Card>
        </div>
      </Section>

      {/* Icons */}
      <Section title="Icons" description="Lucide React icon set">
        <div className="flex flex-wrap gap-4">
          <IconDemo icon={<Play />} name="Play" />
          <IconDemo icon={<Heart />} name="Heart" />
          <IconDemo icon={<Music />} name="Music" />
          <IconDemo icon={<Download />} name="Download" />
          <IconDemo icon={<Share2 />} name="Share" />
        </div>
      </Section>
    </div>
  );
};

const Section = ({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2 className="font-display text-3xl font-bold mb-2">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
};

const ColorSwatch = ({ name, color, className }: {
  name: string;
  color: string;
  className: string;
}) => {
  return (
    <div className="space-y-2">
      <div className={`h-24 rounded-lg ${className}`} />
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{color}</p>
      </div>
    </div>
  );
};

const IconDemo = ({ icon, name }: { icon: React.ReactNode; name: string }) => {
  return (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-secondary transition">
      <div className="h-6 w-6 text-foreground">{icon}</div>
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  );
};

export default DesignSystem;
