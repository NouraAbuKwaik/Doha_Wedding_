import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CalendarDays, CalendarPlus, Check, ChevronDown, Clock3, Copy, Heart, MapPin, Share2, Sparkles } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const weddingDate = new Date('2026-11-14T18:00:00+03:00');

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const difference = Math.max(0, weddingDate.getTime() - Date.now());
  const totalSeconds = Math.floor(difference / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    { value: timeLeft.days, label: 'يوم' },
    { value: timeLeft.hours, label: 'ساعة' },
    { value: timeLeft.minutes, label: 'دقيقة' },
    { value: timeLeft.seconds, label: 'ثانية' },
  ];

  return (
    <section className="invitation-section countdown-section" id="countdown" data-testid="section-countdown">
      <Reveal testId="reveal-countdown">
        <p className="eyebrow"></p>
        <h2 className="countdown-section__heading">نقترب من أجمل يوم</h2>
        <p className="countdown-section__intro">نعدّ اللحظات حتى نلتقي بكم في صالة النعمان</p>
        <div className="countdown-grid" dir="rtl" aria-live="polite" data-testid="wedding-countdown">
          {units.map((unit) => (
            <div className="countdown-cell" key={unit.label}>
              <strong>{String(unit.value).padStart(2, '0')}</strong>
              <span>{unit.label}</span>
            </div>
          ))}
        </div>
        <p className="countdown-section__date">الجمعة · 13/11/2026 · الساعة الثامنة والنصف مساءً</p>
      </Reveal>
    </section>
  );
}

function ShareActions() {
  const [copied, setCopied] = useState(false);
  const invitationUrl = window.location.href;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
    } catch {
      const input = document.createElement('input');
      input.value = invitationUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'دعوة أحمد وكريمته',
        text: 'يسعدنا دعوتكم لمشاركتنا فرحتنا',
        url: invitationUrl,
      });
      return;
    }
    await copyLink();
  };

  const addToCalendar = () => {
    const event = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'DTSTART:20261114T150000Z',
      'DTEND:20261114T190000Z',
      'SUMMARY: زفاف أحمد وكريمته',
      'LOCATION:صالة النعمان',
      'DESCRIPTION:دعوة زفاف أحمد عاشور و كريمته ',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([event], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wedding-dhua-ahmed.ics';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="share-actions" data-testid="share-actions">
      <p className="share-actions__label">شاركونا فرحتنا</p>
      <div className="share-actions__buttons">
        <button type="button" className="share-action" onClick={copyLink} data-testid="button-copy-link">
          {copied ? <Check size={17} /> : <Copy size={17} />}
          <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
        </button>
        <button type="button" className="share-action" onClick={shareLink} data-testid="button-share-link">
          <Share2 size={17} />
          <span>مشاركة الرابط</span>
        </button>
        <button type="button" className="share-action share-action--wide" onClick={addToCalendar} data-testid="button-add-calendar">
          <CalendarPlus size={17} />
          <span>إضافة إلى التقويم</span>
        </button>
      </div>
    </div>
  );
}

function Botanical({ variant = '' }: { variant?: string }) {
  return (
    <div className={`botanical botanical--${variant}`} aria-hidden="true">
      <span className="leaf leaf--1" />
      <span className="leaf leaf--2" />
      <span className="leaf leaf--3" />
      <span className="leaf leaf--4" />
      <span className="leaf leaf--5" />
    </div>
  );
}

function Ornament() {
  return <div className="ornament" aria-hidden="true"></div>;
}

function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span className="divider__diamond" />
    </div>
  );
}

function Reveal({
  children,
  className = '',
  testId,
}: {
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  const [visible, setVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.14 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal ${visible ? 'is-visible' : ''} ${className}`}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

function DetailRow({
  title,
  text,
  children,
  testId,
}: {
  title: string;
  text: string;
  children: ReactNode;
  testId: string;
}) {
  return (
    <div className="detail-row" data-testid={`detail-${testId}`}>
      <div className="detail-row__icon" aria-hidden="true">{children}</div>
      <div>
        <p className="detail-row__title" data-testid={`text-detail-title-${testId}`}>{title}</p>
        <p className="detail-row__text" data-testid={`text-detail-value-${testId}`}>{text}</p>
      </div>
    </div>
  );
}

function OpeningCurtain({ dismissed, onOpen }: { dismissed: boolean; onOpen: () => void }) {
  return (
    <div className={`opening-curtain ${dismissed ? 'is-dismissed' : ''}`} aria-hidden={dismissed}>
      <div className="opening-card">
        <Botanical variant="right" />
        <div>
          <div className="opening-card__eyebrow">دعوة خاصة</div>
          <Ornament />
          <p className="opening-card__intro">بسم الله الرحمن الرحيم<br />وبكل الحب والفرح</p>
          <div className="opening-card__names" data-testid="text-opening-couple">
            أحمد عاشور <span aria-hidden="true">&</span>  كريمته
          </div>
          <div className="opening-card__date" data-testid="text-opening-date">13/11/2026</div>
        </div>
        <div className="opening-card__footer">
          <p className="opening-card__eyebrow">يسعدنا حضوركم</p>
          <button type="button" className="open-button" onClick={onOpen} data-testid="button-open-invitation">
            <span className="open-button__label">افتح الدعوة</span>
            <span className="open-button__arrow" aria-hidden="true">↓</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [isOpen, setIsOpen] = useState(false);

  const openInvitation = () => {
    setIsOpen(true);
    window.setTimeout(() => {
      document.getElementById('invitation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
  };

  const showCountdown = () => {
    document.getElementById('countdown')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className={`invitation-shell ${isOpen ? 'is-open' : ''}`} data-testid="page-wedding-invitation">
      <OpeningCurtain dismissed={isOpen} onOpen={openInvitation} />

      <article className="paper-stage">
        <section id="invitation" className="invitation-section hero-section" data-testid="section-hero">
          <Botanical variant="left" />
          <Botanical variant="right" />
          <div className="hero-section__topline reveal">دعوة زفاف</div>
          <div className="ornate-arch reveal reveal--delay-1" aria-hidden="true" />
          <h1 className="hero-section__title reveal reveal--delay-1" data-testid="text-couple-names">
            أحمد عاشور
            <span className="hero-section__ampersand" aria-hidden="true">&</span>
            كريمته 
          </h1>
          <div className="hero-section__date reveal reveal--delay-2" data-testid="text-event-date">13/11/2026</div>
          <p className="hero-section__note reveal reveal--delay-3" data-testid="text-hero-note">فصلٌ جديد يبدأ بحضوركم</p>
          <div className="hero-section__scroll-hint reveal reveal--delay-3" aria-hidden="true">
            <ChevronDown size={16} strokeWidth={1.2} color="var(--champagne)" />
          </div>
        </section>

        <section className="invitation-section message-section" data-testid="section-message">
          <Botanical variant="lower-left" />
          <Reveal className="reveal-content" testId="reveal-message">
            <Ornament />
            <p className="message-section__copy" data-testid="text-invitation-message">
              ومن آياته أن خلق لكم من أنفسكم أزواجاً لتسكنوا إليها وجعل بينكم مودة ورحمة
            </p>
            <Divider />
            <p className="message-section__subcopy">
              بقلوب يملؤها الامتنان، ندعوكم لتشاركونا فرحة يومٍ انتظرناه طويلاً، وتضيئوا معنا أولى لحظات عمرنا معاً.
            </p>
          </Reveal>
        </section>

        <section className="invitation-section moment-section" data-testid="section-date-moment">
          <Botanical variant="lower-right" />
          <Reveal testId="reveal-date-moment">
            <p className="moment-section__label">موعدنا</p>
            <p className="moment-section__date" data-testid="text-date-day">13</p>
            <p className="moment-section__month" data-testid="text-date-month">11</p>
            <p className="moment-section__year" data-testid="text-date-year">2026</p>
            <p className="moment-section__caption">ننتظركم لنحتفل معاً بيومٍ سيبقى في القلب إلى الأبد</p>
            <div className="date-seal" aria-hidden="true"><span className="date-seal__mark">A & D</span></div>
          </Reveal>
        </section>

        <section className="invitation-section details-section" data-testid="section-details">
          <Reveal testId="reveal-details-heading">
            <p className="eyebrow" style={{ color: 'var(--champagne)' }}>التفاصيل الجميلة</p>
            <h2 className="details-section__heading" data-testid="text-details-heading">كل الطرق تقود إلى فرحتنا</h2>
          </Reveal>
          <Reveal testId="reveal-event-details">
            <div>
              <DetailRow title="اليوم" text="الجمعة · 13/11/2026" testId="day">
                <CalendarDays size={21} strokeWidth={1.2} />
              </DetailRow>
              <a
                className="detail-row detail-row--link"
                href="https://www.google.com/maps/search/?api=1&query=قاعة النعمان,31.99250146515074,35.86480110365035"
                target="_blank"
                rel="noreferrer"
                data-testid="link-venue-location"
                aria-label="فتح موقع صالة النعمان على الخريطة"
              >
                <div className="detail-row__icon" aria-hidden="true"><MapPin size={21} strokeWidth={1.2} /></div>
                <div>
                  <p className="detail-row__title">المكان</p>
                  <p className="detail-row__text">صالة النعمان <span className="detail-row__action">فتح الخريطة</span></p>
                </div>
              </a>
              <DetailRow title="موعد اللقاء" text="ابتداءً من الساعة الثامنة والنصف مساءً" testId="time">
                <Clock3 size={21} strokeWidth={1.2} />
              </DetailRow>
            </div>
            <button type="button" className="countdown-button" onClick={showCountdown} data-testid="button-show-countdown">
              <ChevronDown size={17} />
            </button>
          </Reveal>
        </section>

        <Countdown />

        <section className="invitation-section couple-section" data-testid="section-couple">
          <Botanical variant="left" />
          <Reveal testId="reveal-couple">
            <Sparkles size={21} strokeWidth={1.1} color="var(--champagne)" aria-hidden="true" />
            <h2 className="couple-section__title" data-testid="text-couple-moment">حين يلتقي قلبان</h2>
            <div className="couple-section__line" aria-hidden="true" />
            <p className="couple-section__copy">
              بدأت الحكاية بخطوة، وكبرت بدعاء الأهل، واليوم تكتمل بوجودكم. حضوركم هو الهدية التي نعتز بها.
            </p>
          </Reveal>
        </section>

        <section className="invitation-section closing-section" data-testid="section-closing">
          <Botanical variant="right" />
          <Botanical variant="lower-left" />
          <Reveal testId="reveal-closing">
            <p className="eyebrow">إلى آخر العمر</p>
            <h2 className="closing-section__title">  وجودكم<br />جزءاً من فرحتنا</h2>
            <p className="closing-section__copy">شكراً لأنكم تجعلون أيامنا أكثر دفئاً، وذكرياتنا أجمل.</p>
          </Reveal>
          <div className="closing-section__footer">
            <div className="closing-section__monogram" aria-hidden="true">A <Heart size={13} fill="currentColor" /> D</div>
            <p className="closing-section__thanks" data-testid="text-closing-thanks">مع محبتنا، أحمد وكريمته</p>


            <p className="closing-section__date">13/11/2026</p>
            <ShareActions />
          </div>
        </section>
      </article>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
