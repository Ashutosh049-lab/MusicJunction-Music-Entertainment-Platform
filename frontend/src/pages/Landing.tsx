import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music2, Users, Sparkles, Headphones } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-accent/10 py-20 md:py-32 backdrop-blur-3xl">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Collaborate. Create. Connect.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              The next-generation music collaboration and entertainment platform
              designed with creativity, performance, and collaboration at its core.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition"
              >
                Join Now
              </Link>
              <Link
                to="/explore"
                className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold text-lg hover:bg-primary/10 transition"
              >
                Explore Music
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [-20, 20, -20],
              y: [0, -10, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -z-10"></div>
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl font-bold text-center mb-12">
            Why MusicJunction?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Music2 className="h-8 w-8" />}
              title="Upload & Share"
              description="Share your music with the world and get instant feedback from the community."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Collaborate"
              description="Work together in real-time with musicians from around the globe."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="AI Mixing"
              description="Enhance your tracks with powerful AI-driven audio mastering tools."
            />
            <FeatureCard
              icon={<Headphones className="h-8 w-8" />}
              title="High Quality"
              description="Stream and download your music in pristine audio quality."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjctNS4zNzMtMTItMTItMTJzLTEyIDUuMzczLTEyIDEyIDUuMzczIDEyIDEyIDEyIDEyLTUuMzczIDEyLTEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Musical Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of musicians creating amazing music together.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-background text-foreground rounded-lg font-semibold text-lg hover:bg-background/90 hover:scale-105 transition-all shadow-xl"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 bg-card border rounded-lg hover:shadow-lg transition"
    >
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

export default Landing;
