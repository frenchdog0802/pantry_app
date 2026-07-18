import { useEffect, useRef, useState, type FormEvent } from 'react';
import { RefreshCwIcon, SendIcon } from 'lucide-react';

interface DemoChatBoxProps {
  onGetStarted: () => void;
  autoPlay?: boolean;
  showHeader?: boolean;
  size?: 'default' | 'large';
  className?: string;
}

interface DemoMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MESSAGE: DemoMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hi! Tell me what you need — plan dinner from your pantry, import a recipe, or ask what you can cook. Try a prompt below.',
};

const SUGGESTED_PROMPTS = [
  'What can I cook with what I have?',
  'Plan dinners for the rest of this week',
  'Add chicken, rice, and broccoli to my pantry',
];

const DEMO_RESPONSES: Record<string, string> = {
  'What can I cook with what I have?':
    'You have chicken breast, rice, broccoli, and soy sauce in your pantry. How about **Garlic Soy Chicken & Broccoli**? About 25 minutes — I only added garlic to your shopping list.',
  'Plan dinners for the rest of this week':
    'Here\'s your plan — skipping spicy meals (Alex\'s preference) and using your expiring spinach:\n\n• Mon: Lemon herb chicken & rice\n• Tue: Spinach lasagna\n• Wed: Veggie stir-fry with tofu\n• Thu: Slow-cooker chili\n• Fri: Fish tacos (kid-friendly)\n\nAdded 6 items to your grocery list.',
  'Add chicken, rice, and broccoli to my pantry':
    'Done — updated your pantry:\n\n• +2 lb chicken breast\n• +1 bag rice\n• +1 head broccoli\n\nI\'ll prioritize these in your next meal plan.',
};

const AUTO_PLAY_PROMPT = SUGGESTED_PROMPTS[0];

function renderContent(content: string, variant: 'user' | 'assistant') {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className={variant === 'user' ? 'font-semibold' : 'font-semibold text-ink'}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part.split('\n').map((line, lineIndex, lines) => (
      <span key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    ));
  });
}

export function DemoChatBox({
  onGetStarted,
  autoPlay = true,
  showHeader = true,
  size = 'default',
  className = '',
}: DemoChatBoxProps) {
  const [messages, setMessages] = useState<DemoMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Scroll only inside the chat panel — never scroll the page.
    container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
  }, [messages, isTyping]);

  const runExchange = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isTyping) return;

    const userMessage: DemoMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    const response =
      DEMO_RESPONSES[trimmed] ??
      'Great question! Sign up free to get personalized answers based on your pantry, family preferences, and calendar.';

    const assistantMessage: DemoMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  useEffect(() => {
    if (!autoPlay || hasAutoPlayed) return;

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoPlayed) {
          setHasAutoPlayed(true);
          window.setTimeout(() => {
            void runExchange(AUTO_PLAY_PROMPT);
          }, 1200);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when section enters view
  }, [autoPlay, hasAutoPlayed]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void runExchange(inputValue);
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInputValue('');
    setIsTyping(false);
  };

  const chatHeightClass =
    size === 'large' ? 'min-h-[440px] max-h-[520px]' : 'min-h-[360px] max-h-[420px]';

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {showHeader && (
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-sm font-medium text-ink">Try the assistant</p>
          <span className="rounded-full bg-sage/60 px-2.5 py-0.5 text-xs font-medium text-herb-deep">
            Demo
          </span>
        </div>
      )}

      <div
        className={`flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-md ${chatHeightClass}`}
      >
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex animate-fade-up ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-herb text-white'
                      : 'border border-line bg-sage/40 text-ink'
                  }`}
                >
                  {renderContent(message.content, message.role)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-line bg-sage/40 px-4 py-3">
                  <div className="flex space-x-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted/70 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted/70 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted/70 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-line p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={isTyping}
              className="rounded-full p-2 text-muted transition-colors hover:bg-sage/50 hover:text-ink disabled:opacity-50"
              title="Reset demo"
              aria-label="Reset demo chat"
            >
              <RefreshCwIcon size={18} />
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Ask LarderMind to plan, import, or organize..."
                className="w-full rounded-xl border border-line px-4 py-2.5 pr-11 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-herb/30"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-herb hover:text-herb-deep disabled:text-muted"
              >
                <SendIcon size={18} />
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void runExchange(prompt)}
                disabled={isTyping}
                className="rounded-full bg-sage/40 px-3 py-1 text-left text-xs text-ink transition-colors hover:bg-sage/60 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-muted">
            This is a demo.{' '}
            <button
              type="button"
              onClick={onGetStarted}
              className="font-medium text-herb underline hover:text-herb-deep"
            >
              Get started
            </button>{' '}
            for real pantry-aware answers.
          </p>
        </form>
      </div>
    </div>
  );
}
