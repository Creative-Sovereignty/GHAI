import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { forwardRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Film, FileText, Music, Video, Image, ListChecks, Star, ArrowRight, Check, Sparkles, Zap, Shield, Menu, X } from "lucide-react";
import logoImg from "@/assets/logo-circle.png";
import { useRef, useState } from "react";

import { useSubscription, TIERS } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const features = [
{ icon: FileText, title: "AI Script Editor", desc: "Write professional screenplays with AI-powered formatting and real-time suggestions.", neon: "pink" },
{ icon: Image, title: "Storyboard Studio", desc: "Plan every scene visually with AI-generated storyboard frames and drag-and-drop.", neon: "cyan" },
{ icon: ListChecks, title: "Shot List Tracker", desc: "Organize shots, angles, and equipment for seamless production.", neon: "pink" },
{ icon: Sparkles, title: "AI Scene Generator", desc: "Generate stunning cinematic scene images from text prompts.", neon: "cyan" },
{ icon: Film, title: "Timeline Editor", desc: "Assemble your final cut with a professional video editor and MP4 export.", neon: "purple" },
{ icon: Music, title: "AI Music Studio", desc: "Compose original soundtracks with mood and genre control.", neon: "pink" },
{ icon: Video, title: "AI Video Generation", desc: "Generate AI video clips from text prompts with cinematic quality.", neon: "cyan" }];


const testimonials = [
{ name: "Early Tester", role: "Beta User", text: "The AI Script Editor and Scene Generator are genuinely impressive. This is a real tool, not a demo.", avatar: "ET" },
{ name: "Beta Feedback", role: "Indie Creator", text: "Being able to go from script to storyboard with AI in one app is a game-changer for pre-production.", avatar: "BF" },
{ name: "First Look", role: "Film Student", text: "I love that everything actually works — no fake buttons. The Director AI ties it all together.", avatar: "FL" }];


const plans = [
{ name: "Starter", price: "Free", features: ["1 Project", "Basic Script Editor", "5 AI Generations/mo", "No Credit Card Required"], cta: "Get Started", popular: false, priceId: null },
{ name: "Pro", price: "$29/mo", features: ["Unlimited Projects", "All Live AI Tools", "500 AI Generations/mo", "AI Scene Generator", "Storyboard Images"], cta: "Go Pro", popular: true, priceId: "price_1TEJMZ7pm1sWSXu2cMZxcH3J" },
{ name: "Studio", price: "$79/mo", features: ["Everything in Pro", "Unlimited AI Generations", "Director AI", "Priority Support", "Early access to Video & Music"], cta: "Go Studio", popular: false, priceId: "price_1TEJN07pm1sWSXu2GWmTPF5r" }];


const neonColors: Record<string, string> = {
  pink: "text-[var(--gold)]",
  cyan: "text-[var(--electric-blue)]",
  purple: "text-[var(--deep-blue-bright)]"
};

/* Floating orb component */
const Orb = forwardRef<HTMLDivElement, {className: string;delay?: number;}>(
  ({ className, delay = 0 }, ref) =>
  <motion.div
    ref={ref}
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.5, 0.3]
    }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }} />


);

/* Stat pill */
const StatPill = ({ value, label, delay }: {value: string;label: string;delay: number;}) =>
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay }}
  className="glass-panel-strong rounded-xl px-5 py-3 text-center">
  
    <p className="text-2xl font-bold text-gold-shimmer font-display">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
  </motion.div>;


const PricingCTA = ({ plan }: { plan: typeof plans[number] }) => {
  const { user } = useAuth();
  const { startCheckout } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!plan.priceId) return; // free tier → just link to auth
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    setLoading(true);
    try {
      await startCheckout(plan.priceId);
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!plan.priceId) {
    return (
      <Link to="/auth">
        <Button className="w-full bg-secondary hover:bg-secondary/80">{plan.cta}</Button>
      </Link>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90 shadow-[0_0_15px_var(--neon-pink-30)]" : "bg-secondary hover:bg-secondary/80"}`}>
      {loading ? "Redirecting…" : plan.cta}
    </Button>
  );
};

const Landing = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "/faq", label: "FAQ", isRoute: true },
  { href: "/help", label: "Help", isRoute: true }];


  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/30 bg-background/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="Golden Hour AI — home">
            <img
              src={logoImg}
              alt="Golden Hour AI logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain logo-gold-ring"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {navLinks.map((link) =>
            link.isRoute ?
            <Link key={link.href} to={link.href} className="hover:text-foreground transition-colors">{link.label}</Link> :

            <a key={link.href} href={link.href} className="hover:text-foreground transition-colors">{link.label}</a>

            )}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_var(--gold-30)]">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu">
              
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen &&
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border/30 bg-background/95 backdrop-blur-2xl">
            
              <div className="px-6 py-4 flex flex-col gap-3">
                {navLinks.map((link) =>
              link.isRoute ?
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                
                      {link.label}
                    </Link> :

              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                
                      {link.label}
                    </a>

              )}
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="sm:hidden">
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">Sign In</Button>
                </Link>
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center justify-center px-6 pt-24 sm:pt-20 pb-12 overflow-hidden">
        {/* Ambient orbs */}
        <motion.div style={{ y: orb1Y }} className="absolute -top-32 -left-40 pointer-events-none">
          <Orb className="w-[500px] h-[500px] bg-[var(--gold)]/15" delay={0} />
        </motion.div>
        <motion.div style={{ y: orb2Y }} className="absolute top-1/4 -right-32 pointer-events-none">
          <Orb className="w-[400px] h-[400px] bg-[var(--electric-blue)]/10" delay={2} />
        </motion.div>
        <motion.div style={{ y: orb3Y }} className="absolute bottom-20 left-1/4 pointer-events-none">
          <Orb className="w-[350px] h-[350px] bg-[var(--amber)]/10" delay={4} />
        </motion.div>

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_30%,var(--w3-void)_80%)]" />


        {/* Content */}
        <motion.div style={{ opacity }} className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Headline with parallax */}
          <motion.div style={{ y: textY }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}>

              <p className="neo-label text-[var(--gold)] mb-4 tracking-[0.15em]">
                <Sparkles className="w-4 h-4 inline mr-1 -mt-0.5" />
                Next-Gen Filmmaking
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight leading-[1.05] sm:leading-[1.02] mb-3 sm:mb-4 md:mb-5 text-gold-blue-shimmer">
                Your AI-Powered
              </h1>
              <div className="relative inline-block mt-1 mb-3 sm:mb-4 md:mb-5">
                <motion.span
                  className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-bright)] text-[var(--w3-void)] font-display font-black text-4xl sm:text-5xl md:text-7xl leading-[1] tracking-wide"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  style={{
                    boxShadow: "0 0 40px var(--gold-30), 0 0 80px rgba(212, 148, 10, 0.1), inset 0 1px 0 rgba(255,255,255,0.2)"
                  }}>
                  
                  Movie Studio
                </motion.span>
              </div>

              {/* Hero logo — decorative; the H1 below conveys the brand for SEO & SR */}
              <motion.img
                src={logoImg}
                alt=""
                role="presentation"
                aria-hidden="true"
                width={208}
                height={208}
                loading="eager"
                // @ts-expect-error: fetchpriority is a valid HTML attribute, not yet typed in React
                fetchpriority="high"
                decoding="async"
                className="block w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto mt-6 sm:mt-8 mb-2 object-contain logo-gold-ring drop-shadow-[0_0_40px_var(--gold-30)]"
                initial={{ opacity: 0, scale: 0.75, y: 16, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                transition={{
                  delay: 0.65,
                  opacity: { duration: 0.45, delay: 0.65, ease: "easeOut" },
                  y: { duration: 0.55, delay: 0.65, ease: [0.22, 1, 0.36, 1] },
                  rotate: { duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] },
                  scale: { type: "spring", stiffness: 220, damping: 16, delay: 0.65 },
                }}
                whileHover={{ scale: 1.04, rotate: 1.5, transition: { type: "spring", stiffness: 220, damping: 14 } }}
                style={{ willChange: "transform, opacity" }}
              />
            </motion.div>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl md:max-w-2xl mx-auto mt-5 sm:mt-6 mb-8 sm:mb-10 leading-snug sm:leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}>
              
              From script to screen — write, storyboard, and visualize your films
              with AI tools that actually work, all in one place.
            </motion.p>

            {/* CTA buttons — centered directly under the hero stack */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-14"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}>
              
              <Link to="/auth" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="glow-pulse-gold w-full sm:w-auto relative text-lg px-8 py-6 bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--amber)] text-[var(--w3-void)] font-bold shadow-[0_0_30px_var(--gold-30)] hover:shadow-[0_0_50px_var(--gold-30)] transition-shadow">
                  
                  Start Creating Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-[var(--w3-border)] hover:border-[var(--gold-30)] hover:bg-[var(--gold-05)] transition-all">
                  See Features
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="grid grid-cols-3 gap-3 sm:gap-6 max-w-md sm:max-w-lg mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}>
            
            <StatPill value="7" label="AI Tools Live" delay={1.0} />
            <StatPill value="0" label="Placeholders" delay={1.1} />
            <StatPill value="∞" label="Creativity" delay={1.2} />
          </motion.div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Everything You Need to <span className="text-gold-blue-shimmer">Create</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete filmmaking toolkit powered by AI — from your first draft to final export.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) =>
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`neo-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group relative ${(feat as any).comingSoon ? "opacity-80" : ""}`}>
              
                {(feat as any).comingSoon && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      Coming Soon
                    </span>
                  </div>
                )}
                <feat.icon className={`w-8 h-8 mb-4 ${neonColors[feat.neon]} group-hover:drop-shadow-[0_0_8px_currentColor] transition-all`} />
                <h3 className="font-display font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-[var(--neo-surface)]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Loved by <span className="text-gold-blue-shimmer">Creators</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) =>
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="neo-card rounded-xl p-6">
              
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) =>
                <Star key={j} className="w-4 h-4 fill-[var(--neon-yellow-raw)] text-[var(--neon-yellow-raw)]" />
                )}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Simple <span className="text-gold-blue-shimmer">Pricing</span>
            </h2>
            <p className="text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) =>
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`neo-card rounded-xl p-6 relative ${plan.popular ? "border-primary/50 shadow-[0_0_30px_var(--neon-pink-10)]" : ""}`}>
              
                {plan.popular &&
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-[0_0_15px_var(--neon-pink-30)]">
                    Most Popular
                  </div>
              }
                <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) =>
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" /> {f}
                    </li>
                )}
                </ul>
                <PricingCTA plan={plan} />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Golden Hour AI" className="h-8 object-contain logo-gold-ring" />
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/help" className="hover:text-foreground transition-colors">Help</Link>
            <Link to="/install" className="hover:text-foreground transition-colors text-gold-shimmer">Install App</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Golden Hour AI. All rights reserved.</p>
        </div>
      </footer>
    </div>);

};

export default Landing;