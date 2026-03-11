import { motion } from "framer-motion";
import logoImg from "@/assets/logo.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What is A List Webs?", a: "A List Webs is an AI-powered filmmaking studio that helps you create stunning short films from script to screen — including scriptwriting, storyboarding, shot planning, video editing, and AI music generation." },
  { q: "Do I need filmmaking experience?", a: "Not at all. A List Webs is designed for creators at every level. The AI assists with each step, so you can focus on your creative vision while the tools handle the technical details." },
  { q: "What can I create with A List Webs?", a: "You can write scripts, generate storyboards, plan shot lists, edit video timelines, create AI-generated music, and produce videos with Veo 3 — all from a single dashboard." },
  { q: "Is my content private?", a: "Yes. Every project is tied to your account and protected by row-level security. Only you can access your scripts, storyboards, and videos." },
  { q: "Can I install A List Webs on my phone?", a: "Yes! A List Webs is a Progressive Web App (PWA). Visit the app in your mobile browser and add it to your home screen for a native app-like experience that works offline." },
  { q: "What AI models power A List Webs?", a: "We use a combination of state-of-the-art models for text generation, image synthesis, music composition, and video generation — all accessible without needing your own API keys." },
  { q: "Is there a free plan?", a: "A List Webs offers free credits to get started. You can create projects, write scripts, and explore the tools. Paid plans unlock higher usage limits and premium features." },
  { q: "How do I export my videos?", a: "Once your project is complete, you can download your final video directly from the editor. Exported files are standard MP4 format compatible with all platforms." },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <img src={logoImg} alt="A List Webs" className="w-6 h-6 object-contain" />
            <span className="font-display font-semibold text-sm tracking-wide uppercase">
              A List Webs
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">
            Frequently Asked <span className="rainbow-text">Questions</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need to know about creating films with A List Webs.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="neo-card rounded-xl px-5 data-[state=open]:border-[var(--neon-pink-30)] data-[state=open]:shadow-[0_0_15px_var(--neon-pink-10)]"
              >
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-4 hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <div className="text-center">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
