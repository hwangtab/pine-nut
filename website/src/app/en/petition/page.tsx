"use client";

import { useState, useEffect, useRef, useCallback, type FormEvent, type ReactNode } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Send, Check, Loader2, HeartHandshake, Megaphone } from "lucide-react";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableList, EditableText, EditableValue } from "@/components/editable";
import { events } from "@/lib/analytics";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

interface Signature {
  name: string;
  message: string;
  created_at: string;
}

function AnimatedCounter({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (value) => Math.round(value).toLocaleString("en-US"));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, target, { duration: 2, ease: "easeOut" });
    const unsubscribe = rounded.on("change", (value) => setDisplay(value));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, rounded, target]);

  return <motion.span className="text-5xl sm:text-6xl font-black text-[var(--color-warm)]">{display}</motion.span>;
}

function Confetti() {
  const colors = ["#C75000", "#FF6B1A", "#2D5016", "#4A7A2E", "#D4A843", "#1B4965"];
  const pieces = Array.from({ length: 40 }, (_, index) => ({
    id: index,
    left: (index * 17.3) % 100,
    delay: (index % 10) * 0.05,
    size: 6 + (index % 8),
    rotation: (index * 37) % 360,
    borderRadius: index % 2 === 0 ? "50%" : "2px",
    color: colors[index % colors.length],
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.borderRadius,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall 2.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
}

function RecentSignatures({ signatures, loading }: { signatures: Signature[]; loading: boolean }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (signatures.length === 0) return;
    const timer = setInterval(() => {
      setOffset((prev) => (prev + 1) % signatures.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [signatures.length]);

  const ordered = signatures.length > 0 ? [...signatures.slice(offset), ...signatures.slice(0, offset)] : [];

  return (
    <section className="w-full" aria-label="Recent signatures">
      <EditableText
        contentKey="en.petition.recent.heading"
        defaultValue="Recent signatures"
        as="h2"
        page="en/petition"
        section="recent"
        className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]"
      />
      {loading ? (
        <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <EditableText
            contentKey="en.petition.recent.loading"
            defaultValue="Loading..."
            as="span"
            page="en/petition"
            section="recent"
          />
        </div>
      ) : signatures.length === 0 ? (
        <EditableText
          contentKey="en.petition.recent.empty"
          defaultValue="No signatures yet. Be the first to add your name."
          as="p"
          page="en/petition"
          section="recent"
          className="text-center py-8 text-[var(--color-text-muted)]"
        />
      ) : (
        <div className="space-y-3 overflow-hidden max-h-[320px]">
          <AnimatePresence mode="popLayout">
            {ordered.slice(0, 5).map((sig, index) => (
              <motion.div
                key={`${sig.name}-${(offset + index) % signatures.length}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white border border-[var(--color-border)] rounded-xl px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-text)]">{sig.name}</span>
                  <time dateTime={sig.created_at} className="text-sm text-[var(--color-text-muted)]">
                    {new Date(sig.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </time>
                </div>
                {sig.message && <p className="mt-1 text-[var(--color-text-muted)] text-[15px]">&ldquo;{sig.message}&rdquo;</p>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

export default function EnglishPetitionPage() {
  const { getContent, isEditMode } = useAdminEdit();
  const [signatureCount, setSignatureCount] = useState(0);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loadingSignatures, setLoadingSignatures] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [signatureStartedTracked, setSignatureStartedTracked] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shareTitle = getContent("en.petition.share.title") ?? "Save Pungcheon-ri";
  const shareText =
    getContent("en.petition.share.text") ?? "Stand with residents of Pungcheon-ri and sign the petition.";
  const namePlaceholder = getContent("en.petition.form.namePlaceholder") ?? "Your name";
  const emailPlaceholder =
    getContent("en.petition.form.emailPlaceholder") ?? "name@example.com";
  const messagePlaceholder =
    getContent("en.petition.form.messagePlaceholder") ?? "Leave a short message for the residents";
  const errorName =
    getContent("en.petition.form.errorName") ?? "Please enter your name.";
  const errorEmailRequired =
    getContent("en.petition.form.errorEmailRequired") ?? "Please enter your email address.";
  const errorEmailInvalid =
    getContent("en.petition.form.errorEmailInvalid") ?? "Please enter a valid email address.";
  const errorPrivacy =
    getContent("en.petition.form.errorPrivacy") ?? "Please agree to the privacy notice.";
  const errorAge =
    getContent("en.petition.form.errorAge") ?? "You must confirm that you are at least 14 years old.";
  const errorSubmit =
    getContent("en.petition.form.errorSubmit") ?? "Failed to submit signature.";

  const formRef = useRef<HTMLFormElement>(null);

  const fetchSignatures = useCallback(async () => {
    try {
      const response = await fetch("/api/signatures");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setSignatureCount(data.count);
      setSignatures(data.signatures || []);
    } finally {
      setLoadingSignatures(false);
    }
  }, []);

  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) nextErrors.name = errorName;
    if (!email.trim()) {
      nextErrors.email = errorEmailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = errorEmailInvalid;
    }
    if (!agreePrivacy) nextErrors.agreePrivacy = errorPrivacy;
    if (!agreeAge) nextErrors.agreeAge = errorAge;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [agreeAge, agreePrivacy, email, errorAge, errorEmailInvalid, errorEmailRequired, errorName, errorPrivacy, name]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          agreePrivacy,
          agreeAge,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || errorSubmit);

      setSignatureCount(data.count);
      setSubmittedName(name.trim());
      setSubmitted(true);
      setShowConfetti(true);
      events.signatureComplete();
      fetchSignatures();
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : errorSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      events.shareClick("copy_url");
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // no-op
    }
  };

  const handleShareX = useCallback(() => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(window.location.href);
    events.shareClick("twitter");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  }, [shareText]);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
        events.shareClick("web_share");
      } catch {
        // no-op
      }
    } else {
      handleCopyUrl();
    }
  }, [shareText, shareTitle]);

  const handleScrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {showConfetti && <Confetti />}

      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg"
        imageContentKey="en.petition.hero.image"
        imagePage="en/petition"
        imageSection="hero"
        title={<EditableText contentKey="en.petition.hero.title" defaultValue="Take Action" as="span" page="en/petition" section="hero" />}
        subtitle={<EditableText contentKey="en.petition.hero.subtitle" defaultValue="Sign, donate, or share. Any action you can take today helps residents keep fighting." as="span" page="en/petition" section="hero" />}
        eyebrow={<EditableText contentKey="en.petition.hero.eyebrow" defaultValue="Petition" as="span" page="en/petition" section="hero" />}
        variant="emphasis"
        metric={
          <div className="flex flex-col items-center gap-1">
            <AnimatedCounter target={signatureCount} />
            <EditableText
              contentKey="en.petition.hero.metricLabel"
              defaultValue="people have signed so far"
              as="span"
              page="en/petition"
              section="hero"
              className="text-white/80 text-lg mt-1"
            />
          </div>
        }
      />

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-16">
        <section aria-label="Ways to help">
          <EditableList
            contentKey="en.petition.cta.cards"
            defaultItems={[
              { title: "Sign", desc: "Add your name to strengthen the residents' public voice." },
              { title: "Donate", desc: "Help cover transport, legal costs, and campaign materials." },
              { title: "Share", desc: "Spread the story so the project cannot advance quietly." },
            ]}
            page="en/petition"
            section="cta"
            fields={[{ key: "title", label: "Title" }, { key: "desc", label: "Description", type: "textarea" }]}
          >
            {(items) => {
              const icons = [
                { Icon: Send, colorClass: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]" },
                { Icon: HeartHandshake, colorClass: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]" },
                { Icon: Megaphone, colorClass: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]" },
              ];
              const wrappers = [
                (children: ReactNode) => (
                  <button key="cta-0" type="button" onClick={handleScrollToForm} className="text-left bg-white border border-[var(--color-border)] rounded-2xl p-6 transition-colors hover:bg-[var(--color-bg-warm)] cursor-pointer">
                    {children}
                  </button>
                ),
                (children: ReactNode) => (
                  <EditableLink key="cta-1" contentKey="en.petition.cta.cards.1.href" defaultHref="/en/donate" page="en/petition" section="cta" className="block rounded-2xl border border-[var(--color-border)] bg-white p-6 transition-colors hover:bg-[var(--color-bg-warm)]">
                    {children}
                  </EditableLink>
                ),
                (children: ReactNode) => (
                  <EditableLink key="cta-2" contentKey="en.petition.cta.cards.2.href" defaultHref="/en/share" page="en/petition" section="cta" className="block rounded-2xl border border-[var(--color-border)] bg-white p-6 transition-colors hover:bg-[var(--color-bg-warm)]">
                    {children}
                  </EditableLink>
                ),
              ];

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {items.map((item, index) => {
                    const icon = icons[index] || icons[0];
                    const wrap = wrappers[index] || wrappers[0];

                    return wrap(
                      <>
                        <div className={`w-11 h-11 rounded-full ${icon.colorClass} flex items-center justify-center mb-4`}>
                          <icon.Icon className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">{item.title}</h2>
                        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
                      </>,
                    );
                  })}
                </div>
              );
            }}
          </EditableList>
        </section>

        <EditableText
          contentKey="en.petition.emotional.prompt"
          defaultValue="Add your name to more than 680 cries of resistance"
          as="p"
          page="en/petition"
          section="emotional"
          className="text-center text-xl font-serif text-[var(--color-text-muted)] mb-6"
        />

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.section key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                onFocusCapture={() => {
                  if (!signatureStartedTracked) {
                    events.signatureStart();
                    setSignatureStartedTracked(true);
                  }
                }}
                noValidate
                className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div>
                  <label htmlFor="en-sig-name" className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]">
                    <EditableText
                      contentKey="en.petition.form.nameLabel"
                      defaultValue="Name"
                      as="span"
                      page="en/petition"
                      section="form"
                    /> <span className="text-[var(--color-warm)]">*</span>
                  </label>
                  <input id="en-sig-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder={namePlaceholder} className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]" />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="en-sig-email" className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]">
                    <EditableText
                      contentKey="en.petition.form.emailLabel"
                      defaultValue="Email"
                      as="span"
                      page="en/petition"
                      section="form"
                    /> <span className="text-[var(--color-warm)]">*</span>
                  </label>
                  <input id="en-sig-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={emailPlaceholder} className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]" />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="en-sig-message" className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]">
                    <EditableText
                      contentKey="en.petition.form.messageLabel"
                      defaultValue="Message of support"
                      as="span"
                      page="en/petition"
                      section="form"
                    /> <EditableText
                      contentKey="en.petition.form.messageOptional"
                      defaultValue="(optional)"
                      as="span"
                      page="en/petition"
                      section="form"
                      className="font-normal text-[var(--color-text-muted)]"
                    />
                  </label>
                  <textarea id="en-sig-message" value={message} onChange={(event) => { if (event.target.value.length <= 100) setMessage(event.target.value); }} maxLength={100} rows={3} placeholder={messagePlaceholder} className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] resize-none" />
                  <p className="mt-1 text-right text-sm text-[var(--color-text-muted)]">{message.length}/100</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                    <input type="checkbox" checked={agreePrivacy} onChange={(event) => setAgreePrivacy(event.target.checked)} className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer" />
                    <span className="text-[15px] text-[var(--color-text)]">
                      <EditableText
                        contentKey="en.petition.form.privacyPrefix"
                        defaultValue="I agree to the"
                        as="span"
                        page="en/petition"
                        section="form"
                      />{" "}
                      <button type="button" className="underline text-[var(--color-sky)] hover:text-[var(--color-sky)]/80" onClick={() => setShowPrivacy(!showPrivacy)}>
                        <EditableText
                          contentKey="en.petition.form.privacyToggle"
                          defaultValue="privacy notice"
                          as="span"
                          page="en/petition"
                          section="form"
                        />
                      </button>
                      <EditableText
                        contentKey="en.petition.form.privacySuffix"
                        defaultValue="."
                        as="span"
                        page="en/petition"
                        section="form"
                      /> <span className="text-[var(--color-warm)]">*</span>
                    </span>
                  </label>
                  {showPrivacy && (
                    <div className="ml-8 mt-2 p-4 bg-[var(--color-bg-warm)] rounded-xl text-sm text-[var(--color-text-muted)] leading-relaxed">
                      <EditableText
                        contentKey="en.petition.form.privacyLine1"
                        defaultValue="Data collected: name and email"
                        as="p"
                        page="en/petition"
                        section="form"
                      />
                      <EditableText
                        contentKey="en.petition.form.privacyLine2"
                        defaultValue="Purpose: petition verification and campaign updates"
                        as="p"
                        page="en/petition"
                        section="form"
                      />
                      <EditableText
                        contentKey="en.petition.form.privacyLine3"
                        defaultValue="Retention: deleted after the campaign ends"
                        as="p"
                        page="en/petition"
                        section="form"
                      />
                    </div>
                  )}
                  {errors.agreePrivacy && <p className="ml-8 mt-1 text-sm text-red-600">{errors.agreePrivacy}</p>}

                  <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                    <input type="checkbox" checked={agreeAge} onChange={(event) => setAgreeAge(event.target.checked)} className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer" />
                    <span className="text-[15px] text-[var(--color-text)]">
                      <EditableText
                        contentKey="en.petition.form.ageLabel"
                        defaultValue="I confirm that I am at least 14 years old."
                        as="span"
                        page="en/petition"
                        section="form"
                      /> <span className="text-[var(--color-warm)]">*</span>
                    </span>
                  </label>
                  {errors.agreeAge && <p className="ml-8 mt-1 text-sm text-red-600">{errors.agreeAge}</p>}
                </div>

                {submitError && <p className="text-sm text-red-600 text-center">{submitError}</p>}

                <button type="submit" disabled={submitting} className="w-full min-h-[52px] rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <EditableText
                        contentKey="en.petition.form.submitting"
                        defaultValue="Submitting..."
                        as="span"
                        page="en/petition"
                        section="form"
                      />
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <EditableText
                        contentKey="en.petition.form.submit"
                        defaultValue="Sign the petition"
                        as="span"
                        page="en/petition"
                        section="form"
                      />
                    </>
                  )}
                </button>
              </form>
              {isEditMode && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <EditableValue contentKey="en.petition.form.namePlaceholder" defaultValue="Your name" page="en/petition" section="form" buttonLabel="Name hint" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue contentKey="en.petition.form.emailPlaceholder" defaultValue="name@example.com" page="en/petition" section="form" buttonLabel="Email hint" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue contentKey="en.petition.form.messagePlaceholder" defaultValue="Leave a short message for the residents" page="en/petition" section="form" multiline buttonLabel="Message hint" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue contentKey="en.petition.form.errorName" defaultValue="Please enter your name." page="en/petition" section="form" buttonLabel="Name error" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue contentKey="en.petition.form.errorEmailRequired" defaultValue="Please enter your email address." page="en/petition" section="form" buttonLabel="Email required" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue contentKey="en.petition.form.errorEmailInvalid" defaultValue="Please enter a valid email address." page="en/petition" section="form" buttonLabel="Email invalid" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue contentKey="en.petition.form.errorPrivacy" defaultValue="Please agree to the privacy notice." page="en/petition" section="form" buttonLabel="Privacy error" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue contentKey="en.petition.form.errorAge" defaultValue="You must confirm that you are at least 14 years old." page="en/petition" section="form" buttonLabel="Age error" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue contentKey="en.petition.form.errorSubmit" defaultValue="Failed to submit signature." page="en/petition" section="form" buttonLabel="Submit error" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="bg-white border border-[var(--color-border)] rounded-2xl p-8 sm:p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-forest)]/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-[var(--color-forest)]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text)] mb-2">
                <EditableText
                  contentKey="en.petition.success.titlePrefix"
                  defaultValue="Thank you,"
                  as="span"
                  page="en/petition"
                  section="success"
                />{" "}
                {submittedName}
                <EditableText
                  contentKey="en.petition.success.titleSuffix"
                  defaultValue="."
                  as="span"
                  page="en/petition"
                  section="success"
                />
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] mb-8">
                <EditableText
                  contentKey="en.petition.success.countPrefix"
                  defaultValue="You are signer number"
                  as="span"
                  page="en/petition"
                  section="success"
                /> <span className="font-bold text-[var(--color-warm)]">{signatureCount.toLocaleString("en-US")}</span><EditableText
                  contentKey="en.petition.success.countSuffix"
                  defaultValue="."
                  as="span"
                  page="en/petition"
                  section="success"
                />
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={handleShare} className="min-h-[48px] px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white font-semibold">
                  <EditableText
                    contentKey="en.petition.success.share"
                    defaultValue="Share"
                    as="span"
                    page="en/petition"
                    section="success"
                  />
                </button>
                <button onClick={handleShareX} className="min-h-[48px] px-6 py-3 rounded-xl bg-[#1DA1F2] text-white font-semibold">
                  <EditableText
                    contentKey="en.petition.success.shareX"
                    defaultValue="Share on X"
                    as="span"
                    page="en/petition"
                    section="success"
                  />
                </button>
                <button onClick={handleCopyUrl} className="min-h-[48px] px-6 py-3 rounded-xl bg-[var(--color-bg)] text-[var(--color-text)] font-semibold">
                  <EditableText
                    contentKey={urlCopied ? "en.petition.success.copied" : "en.petition.success.copy"}
                    defaultValue={urlCopied ? "Copied" : "Copy URL"}
                    as="span"
                    page="en/petition"
                    section="success"
                  />
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <RecentSignatures signatures={signatures} loading={loadingSignatures} />
      </div>

      {isEditMode && (
        <div className="fixed bottom-20 sm:bottom-4 left-2 right-2 sm:left-4 sm:right-auto z-40 flex flex-wrap gap-2 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-xl backdrop-blur max-w-sm sm:max-w-none">
          <EditableValue contentKey="en.petition.share.title" defaultValue="Save Pungcheon-ri" page="en/petition" section="share" buttonLabel="Share title" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue contentKey="en.petition.share.text" defaultValue="Stand with residents of Pungcheon-ri and sign the petition." page="en/petition" section="share" multiline buttonLabel="Share text" wrapperClassName="relative" buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
        </div>
      )}
    </div>
  );
}
