import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const QUICK_REPLIES = [
  'What is AEO?',
  'Tell me about pricing',
  'How does the audit work?',
  'What AI platforms do you cover?',
];

const KNOWLEDGE_BASE: Record<string, string> = {
  greeting:
    "Hi! I'm the AEO Strategy Assistant from Rudra Kasturi Inc. I can help you understand Answer Engine Optimization, our audit tool, pricing, and how to get your website AI-ready. What would you like to know?",
  aeo:
    "**Answer Engine Optimization (AEO)** is the practice of optimizing your website so AI-powered answer engines — like Google AI Overviews, ChatGPT, Claude, and Perplexity — can accurately read, understand, and cite your content.\n\nUnlike traditional SEO which focuses on search rankings, AEO ensures your brand shows up when AI assistants answer questions. Our audit tool checks 8+ categories including AI bot access, structured data, content quality, and E-E-A-T signals.",
  pricing:
    "We offer three plans:\n\n**Starter** — $12/mo (INR 999/mo)\n• 50 URL scans/month, full AEO + Resource Audit\n• PDF export, email reports, 30-day history\n\n**Professional** — $35/mo (INR 2,999/mo) ⭐ Most Popular\n• 300 URL scans/month, all industries\n• White-label reports, unlimited history\n• Competitor comparison (1 vs 4), bulk scanning\n\n**Enterprise** — $99/mo (INR 7,999/mo)\n• 2,000 URL scans/month, API access\n• 5 team seats, weekly monitoring & alerts\n• Slack & email notifications, priority support\n\nWe also offer Pay-As-You-Go credits and One-Time Audit Reports. Would you like to speak with our team?",
  audit:
    "Our AEO Audit scans your website across **8 critical categories**:\n\n1. **AI Bot Access** — checks robots.txt for 12+ AI bots (GPTBot, ClaudeBot, Google-Extended, etc.)\n2. **Content Quality** — word count, readability, answer-ready paragraphs\n3. **Structured Data** — JSON-LD schema markup (FAQPage, Article, HowTo)\n4. **Meta Tags & OG** — title, description, OpenGraph, Twitter Cards\n5. **Technical SEO** — HTTPS, response time, page size, JS payload\n6. **Branding & E-E-A-T** — trust signals, author attribution, social profiles\n7. **Heading Structure** — H1 presence, heading hierarchy\n8. **Link Profile** — internal/external links, breadcrumbs\n\nYou get a score from 0-100 (graded A+ to F) with prioritized action items. Takes just 2-5 seconds!",
  platforms:
    "We check your website's compatibility with all major AI answer engines:\n\n• **Google AI Overviews** — the AI snippets in Google Search\n• **ChatGPT (OpenAI)** — GPTBot crawler access\n• **Claude (Anthropic)** — ClaudeBot crawler access\n• **Perplexity** — PerplexityBot access\n• **Microsoft Bing/Copilot** — Bingbot compatibility\n• **Amazon (Alexa)** — Amazonbot access\n\nWe also check for Google-Extended, Bytespider, FacebookBot, and more. Our tool analyzes whether your robots.txt allows or blocks each of these AI crawlers.",
  contact:
    "You can reach us at:\n\n📧 **ai@appstudiox.com** — AI & product inquiries\n📧 **aeo@appstudiox.com** — AEO audit & strategy\n📧 **strategy@bestfreshfries.com** — Growth strategy\n📧 **contact@appstudiox.com** — General inquiries\n\n🔗 **LinkedIn:** linkedin.com/company/appstudiox-entertainment-pvt-limited\n\nWe'd love to discuss how we can help optimize your website for AI engines!",
  resource:
    "Our **Resource Audit** analyzes the technical health of your website:\n\n• **JS/CSS bloat** — identifies oversized scripts and stylesheets\n• **Third-party dependencies** — counts external vs first-party resources\n• **Render-blocking resources** — finds resources that slow page load\n• **Crawl budget usage** — ensures AI bots can efficiently crawl your site\n\nThis works alongside the AEO Audit to give you a complete picture of both content optimization and technical performance.",
  about:
    "**Rudra Kasturi Inc** is an AI-first digital strategy company founded by Rudra Prasad Kasturi, Chief Strategy & Growth Leader.\n\nWe're the team behind **AI Vidhyarthi** — India's first student-led AI literacy initiative. Our AEO Audit tool helps businesses ensure their websites are optimized for the new era of AI-powered search and answer engines.\n\nWe operate at the intersection of AI, SEO, and digital strategy with offices under **AppStudioX Entertainment Pvt. Limited**.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.match(/\b(hi|hello|hey|howdy|greetings)\b/))
    return KNOWLEDGE_BASE.greeting;
  if (lower.match(/\b(aeo|answer engine|what is aeo|what's aeo)\b/))
    return KNOWLEDGE_BASE.aeo;
  if (lower.match(/\b(pric|cost|plan|subscription|pay|how much|rate)\b/))
    return KNOWLEDGE_BASE.pricing;
  if (lower.match(/\b(audit|how does|scan|check|work|analyze)\b/))
    return KNOWLEDGE_BASE.audit;
  if (lower.match(/\b(platform|ai engine|google|chatgpt|claude|perplexity|bing|cover)\b/))
    return KNOWLEDGE_BASE.platforms;
  if (lower.match(/\b(contact|email|reach|talk|call|phone|linkedin)\b/))
    return KNOWLEDGE_BASE.contact;
  if (lower.match(/\b(resource|technical|js|css|bloat|speed|performance)\b/))
    return KNOWLEDGE_BASE.resource;
  if (lower.match(/\b(about|who|company|team|rudra|founder|appstudiox)\b/))
    return KNOWLEDGE_BASE.about;
  if (lower.match(/\b(seo|search engine|ranking|keyword)\b/))
    return "Great question! While traditional SEO focuses on search rankings and keywords, **AEO (Answer Engine Optimization)** focuses on making your content readable by AI engines like ChatGPT, Google AI Overviews, and Claude.\n\nOur tool bridges both worlds — we check traditional SEO factors like meta tags and headings, plus AI-specific factors like structured data, bot access, and answer-ready content formatting.\n\nWould you like to learn more about our audit categories?";
  if (lower.match(/\b(competitor|compare|comparison|vs)\b/))
    return "Our **Competitor Comparison** feature lets you audit your site alongside competitors to see how you stack up:\n\n• **Starter plan** — Compare 1 vs 1 competitor\n• **Professional plan** — Compare 1 vs 4 competitors\n\nYou get a side-by-side view of scores across all 8 audit categories, making it easy to identify where you're ahead and where you need improvement.\n\nWant to try an audit now? Just head to the main page!";
  if (lower.match(/\b(thank|thanks|thx|bye|goodbye)\b/))
    return "You're welcome! Feel free to reach out anytime at **ai@appstudiox.com** or start an audit right from our homepage. We're here to help you get AI-ready! 🚀";

  return "That's a great question! I can help you with:\n\n• **AEO & GEO concepts** — what it means and why it matters\n• **Our audit tool** — how it works and what it checks\n• **Pricing & plans** — finding the right fit for you\n• **AI platforms** — which engines we optimize for\n• **Contact & support** — how to reach our team\n\nWhat would you like to know more about?";
}

export function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: KNOWLEDGE_BASE.greeting },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay for a natural feel
    setTimeout(() => {
      const reply = getResponse(text);
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Simple markdown-like rendering for bold text and line breaks
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });
      return (
        <span key={i}>
          {i > 0 && <br />}
          {parts}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center print:hidden"
        title="Chat with our AEO Assistant"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Pulse indicator when closed */}
      {!open && (
        <span className="fixed bottom-5 right-5 z-40 w-16 h-16 bg-brand-400 rounded-full animate-ping opacity-20 print:hidden" />
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden print:hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M3.8 14.5h16.4a1 1 0 01.993 1.117l-.972 6.8a1 1 0 01-.993.883H4.572a1 1 0 01-.993-.883l-.972-6.8A1 1 0 013.8 14.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AEO Strategy Assistant</h3>
              <p className="text-white/70 text-xs">Powered by Rudra Kasturi Inc</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/70 text-xs">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-md'
                      : 'bg-white text-gray-700 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}
                >
                  {renderText(msg.text)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr}
                  onClick={() => sendMessage(qr)}
                  className="px-3 py-1.5 text-xs font-medium bg-brand-50 text-brand-700 rounded-full hover:bg-brand-100 transition-colors border border-brand-200"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-4 py-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about AEO, pricing, audits..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
