"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SubHero from "@/components/SubHero";
import { EditableText } from "@/components/editable";
import PetitionActionCards from "@/components/petition/PetitionActionCards";
import PetitionAnimatedCounter from "@/components/petition/PetitionAnimatedCounter";
import PetitionShareEditControls from "@/components/petition/PetitionShareEditControls";
import PetitionSignatureForm from "@/components/petition/PetitionSignatureForm";
import PetitionSuccess from "@/components/petition/PetitionSuccess";
import RecentSignatures from "@/components/petition/RecentSignatures";
import SignatureConfetti from "@/components/petition/SignatureConfetti";
import {
  englishPetitionFormCopy,
  englishPetitionShareEditFields,
  englishPetitionSuccessCopy,
} from "@/components/petition/petition-copy";
import { usePetitionSignatureSummary } from "@/components/petition/usePetitionSignatureSummary";
import { events } from "@/lib/analytics";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

export default function EnglishPetitionPage() {
  const { getContent, isEditMode } = useAdminEdit();
  const {
    signatureCount,
    setSignatureCount,
    signatures,
    loadingSignatures,
    refreshSignatures,
  } = usePetitionSignatureSummary();
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const shareTitle = getContent("en.petition.share.title") ?? "Save Pungcheon-ri";
  const shareText =
    getContent("en.petition.share.text") ?? "Stand with residents of Pungcheon-ri and sign the petition.";
  const formRef = useRef<HTMLFormElement>(null);

  const handleSignatureSubmitted = useCallback(
    ({ name, count }: { name: string; count: number }) => {
      setSignatureCount(count);
      setSubmittedName(name);
      setSubmitted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    },
    [setSignatureCount],
  );

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      events.shareClick("copy_url");
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // no-op
    }
  }, []);

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
      void handleCopyUrl();
    }
  }, [handleCopyUrl, shareText, shareTitle]);

  const handleScrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {showConfetti && <SignatureConfetti />}

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
            <PetitionAnimatedCounter target={signatureCount} locale="en-US" />
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
        <PetitionActionCards
          onScrollToForm={handleScrollToForm}
          ariaLabel="Ways to help"
          contentKey="en.petition.cta.cards"
          page="en/petition"
          defaultItems={[
            { title: "Sign", desc: "Add your name to strengthen the residents' public voice." },
            { title: "Donate", desc: "Help cover transport, legal costs, and campaign materials." },
            { title: "Share", desc: "Spread the story so the project cannot advance quietly." },
          ]}
          titleLabel="Title"
          descLabel="Description"
          donateHrefKey="en.petition.cta.cards.1.href"
          donateDefaultHref="/en/donate"
          shareHrefKey="en.petition.cta.cards.2.href"
          shareDefaultHref="/en/share"
        />

        <EditableText
          contentKey="en.petition.emotional.prompt"
          defaultValue="Add your name to more than 680 cries of resistance"
          as="p"
          page="en/petition"
          section="emotional"
          className="text-center text-xl font-serif-display text-[var(--color-text-muted)] mb-6"
        />

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.section
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              id="signature-form"
              aria-label="Signature form"
            >
              <PetitionSignatureForm
                formRef={formRef}
                onSubmitted={handleSignatureSubmitted}
                onRefreshSignatures={refreshSignatures}
                copy={englishPetitionFormCopy}
              />
            </motion.section>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <PetitionSuccess
                submittedName={submittedName}
                signatureCount={signatureCount}
                urlCopied={urlCopied}
                onPrimaryShare={handleShare}
                onShareTwitter={handleShareX}
                onCopyUrl={handleCopyUrl}
                copy={englishPetitionSuccessCopy}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <RecentSignatures
          signatures={signatures}
          loading={loadingSignatures}
          ariaLabel="Recent signatures"
          page="en/petition"
          headingKey="en.petition.recent.heading"
          headingDefault="Recent signatures"
          loadingKey="en.petition.recent.loading"
          loadingDefault="Loading..."
          emptyKey="en.petition.recent.empty"
          emptyDefault="No signatures yet. Be the first to add your name."
          dateLocale="en-US"
        />
      </div>

      {isEditMode && (
        <PetitionShareEditControls fields={englishPetitionShareEditFields} />
      )}
    </div>
  );
}
