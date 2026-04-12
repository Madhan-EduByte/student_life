import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';

const faqs = [
  {
    question: "What is DestinAI?",
    answer: "DestinAI is an intelligent career guidance platform that builds personalized, living career roadmaps based on 6 simple questions about your interests, strengths, and goals. It acts as your personalized career compass."
  },
  {
    question: "How does the AI Roadmap work?",
    answer: "Our engine analyzes your inputs against 2,000+ careers and 15,000+ colleges using advanced AI models. It then generates a personalized 12-week milestone plan to help you achieve your targeted career path."
  },
  {
    question: "What is the 'Future-Proof Score'?",
    answer: "The Future-Proof Score is a unique metric that evaluates a career's AI automation risk, market demand, and 20-year salary projection, helping you choose a career that won't be easily replaced by technology."
  },
  {
    question: "Can I change my answers later?",
    answer: "Absolutely! Your roadmap is a 'living' document. You can update your AI Profile inputs from the Roadmap page at any time, and our AI will instantly regenerate and pivot your path."
  },
  {
    question: "What is Career Simulation?",
    answer: "Career Simulation lets you 'shadow' a profession virtually. It gives you a detailed breakdown of a typical day, daily tasks, challenges, and rewards so you can experience a career before committing to it."
  }
];

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen pt-24 pb-16" id="faq-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-white mb-4">Frequently Asked <span className="gradient-text">Questions</span></h1>
          <p className="text-surface-400 text-lg">Everything you need to know about your AI career journey.</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-display font-semibold text-white text-lg">{faq.question}</span>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HiChevronDown className="text-primary-400" size={24} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6 text-surface-300 border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FAQ;