import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Film, FileText, Music, Video, Image, ListChecks, Star, ArrowRight, Check, MessageCircle } from "lucide-react";
import logoImg from "@/assets/logo.png";

const features = [
  { icon: FileText, title: "AI Script Editor", desc: "Write professional screenplays with AI-powered formatting and suggestions.", neon: "pink" },
  { icon: Image, title: "Storyboard Studio", desc: "Plan every scene visually with a drag-and-drop storyboard grid.", neon: "cyan" },
  { icon: ListChecks, title: "Shot List Tracker", desc: "Organize shots, angles, and equipment for seamless production.", neon: "pink" },
  { icon: Video, title: "Veo 3 Video Gen", desc: "Generate stunning AI video clips from text prompts.", neon: "cyan" },
  { icon: Film, title: "Timeline Editor", desc: "Assemble your final cut with a professional video editor.", neon: "purple" },
  { icon: Music, title: "AI Music Studio", desc: "Compose original soundtracks with mood and genre control.", neon: "pink" },
];

const testimonials = [
  { name: "Jordan K.", role: "Indie Filmmaker", text: "A List Webs transformed my workflow. I went from script to final cut in a weekend.", avatar: "JK" },
  { name: "Samira P.", role: "Content Creator", text: "The AI music generator alone is worth it. Every track feels custom-made for my videos.", avatar: "SP" },
  { name: "Marcus T.", role: "Film Student", text: "I had zero editing experience. Now I'm producing short films that look professional.", avatar: "MT" },
];

const plans = [
  { name: "Starter", price: "Free", features: ["3 Projects", "Basic Script Editor", "5 AI Generations/mo", "Community Support"], cta: "Get Started", popular: false },
  { name: "Pro", price: "$19/mo", features: ["Unlimited Projects", "Full Toolkit Access", "100 AI Generations/mo", "Priority Support", "HD Export"], cta: "Go Pro", popular: true },
  { name: "Studio", price: "$49/mo", features: ["Everything in Pro", "Unlimited AI Generations", "4K Export", "Team Collaboration", "Dedicated Support"], cta: "Contact Sales", popular: false },
];

const neonColors: Record<string, string> = {
  pink: "text-[var(--neon-pink)]",
  cyan: "text-[var(--neon-cyan)]",
  purple: "text-[var(--neon-purple)]",
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="A List Webs" className="h-10 object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/help" className="hover:text-foreground transition-colors">Help</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_var(--neon-pink-30)]">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--neon-pink-10)_0%,transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <img src={logoImg} alt="A List Webs" className="h-48 mx-auto mb-8 object-contain" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight leading-tight mb-6">
            Your AI-Powered <br />
            <span className="inline-block mt-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-bright)] text-[var(--w3-void)] font-black tracking-wide shadow-[0_0_30px_var(--gold-30)]">
              Movie Studio
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            From script to screen — write, storyboard, shoot, edit, and score your films
            with cutting-edge AI tools, all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-[0_0_30px_var(--neon-pink-30)]">
                Start Creating Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-border hover:border-primary/50">
                See Features
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Everything You Need to <span className="rainbow-text">Create</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete filmmaking toolkit powered by AI — from your first draft to final export.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neo-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group"
              >
                <feat.icon className={`w-8 h-8 mb-4 ${neonColors[feat.neon]} group-hover:drop-shadow-[0_0_8px_currentColor] transition-all`} />
                <h3 className="font-display font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
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
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Loved by <span className="rainbow-text">Creators</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neo-card rounded-xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[var(--neon-yellow-raw)] text-[var(--neon-yellow-raw)]" />
                  ))}
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
            ))}
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
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Simple <span className="rainbow-text">Pricing</span>
            </h2>
            <p className="text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`neo-card rounded-xl p-6 relative ${plan.popular ? "border-primary/50 shadow-[0_0_30px_var(--neon-pink-10)]" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-[0_0_15px_var(--neon-pink-30)]">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90 shadow-[0_0_15px_var(--neon-pink-30)]" : "bg-secondary hover:bg-secondary/80"}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="A List Webs" className="h-8 object-contain" />
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/help" className="hover:text-foreground transition-colors">Help</Link>
            <Link to="/install" className="hover:text-foreground transition-colors">Install App</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 A List Webs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
