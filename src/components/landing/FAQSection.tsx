import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ECGPulse } from "./ECGLine";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "What exactly is HeartScore?",
    answer: "It's a 0-100 score that combines your BP, sugar, daily habits, and more into one easy number. Think of it as a credit score, but for your heart.",
  },
  {
    question: "Do I need any special devices?",
    answer: "Not at all. You can manually enter readings. But if you have an Omron BP monitor or use Apple Health/Google Fit, we sync automatically.",
  },
  {
    question: "Is my health data safe?",
    answer: "Absolutely. We use bank-grade encryption and are HIPAA compliant. Your data is never sold. Export or delete it anytime.",
  },
  {
    question: "Can my family see everything I log?",
    answer: "Only what you choose to share. You control permissions for each family member.",
  },
  {
    question: "Does it work without internet?",
    answer: "Yes. Beat caches everything locally. When you're back online, it syncs automatically.",
  },
  {
    question: "Is there Hindi support?",
    answer: "Yes! The entire app is available in Hindi. Switch anytime in settings.",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="py-24 bg-landing-bg">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-landing-primary mb-4">
            <ECGPulse className="w-16 h-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-landing-text">
            The Answers
          </h2>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-landing-card rounded-2xl border border-landing-border px-6 data-[state=open]:border-landing-primary/30 transition-colors"
            >
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-3 text-left">
                  {/* ECG indicator */}
                  <div className="w-6 h-4 text-landing-primary opacity-50">
                    <svg viewBox="0 0 24 8" className="w-full h-full">
                      <path
                        d="M0 4 L6 4 L8 4 L10 2 L12 6 L14 1 L16 7 L18 4 L20 4 L24 4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                  </div>
                  <span className="font-semibold text-landing-text">{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5 pl-9 text-landing-muted leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
