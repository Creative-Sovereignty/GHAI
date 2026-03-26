import { motion } from "framer-motion";
import logoImg from "@/assets/logo-circle.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What is Golden Hour AI?", a: "Golden Hour AI is an AI-powered filmmaking studio that helps you create stunning short films from script to screen — including scriptwriting, storyboarding, shot planning, AI video generation via Luma Dream Machine, a multi-track video editor, and AI music generation." },
  { q: "Do I need filmmaking experience?", a: "Not at all. Golden Hour AI is designed for creators at every level. The AI assists with each step — from Director AI shot breakdowns to AI-generated video clips — so you can focus on your creative vision." },
  { q: "What can I create with Golden Hour AI?", a: "You can write scripts, generate storyboard images, plan shot lists, generate AI videos in the AI Studio (/ai-studio), edit on a multi-track timeline with dialog/score/sound design tracks, and create AI-generated music — all from a single dashboard." },
  { q: "How does AI Video generation work?", a: "Head to the AI Studio page and select the AI Video tab. Enter a cinematic prompt, adjust camera and motion settings, then click Generate. The Luma Dream Machine API processes your request — you'll see real-time progress (queued → dreaming → completed) with a visual indicator." },
  { q: "How much do AI features cost?", a: "AI features use credits: storyboard images cost 2 credits, AI music costs 3 credits, and AI video generation costs 10 credits. Your remaining balance is displayed on the AI Studio page and in the top bar." },
  { q: "Is my content private?", a: "Yes. Every project is tied to your account and protected by row-level security. Only you can access your scripts, storyboards, videos, and generated media." },
  { q: "Can I install Golden Hour AI on my phone?", a: "Yes! Golden Hour AI is a Progressive Web App (PWA). Visit the app in your mobile browser and tap 'Add to Home Screen' for a native app-like experience that works offline." },
  { q: "What AI models power Golden Hour AI?", a: "We use state-of-the-art models for text generation, image synthesis (storyboards), video generation (Luma Dream Machine), and music composition — all accessible without needing your own API keys." },
  { q: "Is there a free plan?", a: "Golden Hour AI offers free credits to get started. You can create projects, write scripts, and explore the tools. Paid plans (Pro and Studio) unlock higher usage limits and premium features." },
  { q: "How do I export my videos?", a: "Once your project is assembled on the multi-track timeline, you can export your final cut directly from the Video Editor as a standard MP4 file compatible with all platforms." },
  { q: "What is the AI Studio?", a: "The AI Studio (/ai-studio) is your central hub for all AI generation — storyboard images, AI video clips via Luma Dream Machine, and AI music. Each tab shows your credit balance and generation controls." },
  { q: "How does the Video Editor timeline work?", a: "The timeline features separate tracks for Video, Dialog, Score, and Sound Design. Drag clips onto tracks, trim edges non-destructively, and use snap-to-grid for precise editing. A built-in player lets you preview your edit in real time." },
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
          <div className="flex items-center justify-center mb-4">
            <img src={logoImg} alt="Golden Hour AI" className="h-14 object-contain logo-gold-ring" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">
            Frequently Asked <span className="rainbow-text">Questions</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need to know about creating films with Golden Hour AI.
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
                className="neo-card rounded-xl px-5 data-[state=open]:border-[var(--gold-30)] data-[state=open]:shadow-[0_0_15px_var(--gold-10)]"
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
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
