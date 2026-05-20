import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';

export const blogs = [
  {
    id: 1,
    slug: 'future-proof-score-matters',
    title: "The Future of Work: Why Your 'Future-Proof Score' Matters",
    excerpt: "With AI advancing rapidly, understanding your career's automation risk is more critical than ever. Learn how DestinAI calculates your future-proof score.",
    category: "Career Advice",
    date: "April 10, 2026",
    readTime: "5 min read",
    color: "from-blue-500 to-indigo-500",
    content: "The world of work is transforming at an unprecedented pace. As artificial intelligence and automation continue to evolve, the traditional advice of 'follow your passion' is no longer enough to guarantee a stable, fulfilling career.\n\nAt DestinAI, we developed the Future-Proof Score to help students look beyond tomorrow. This score is calculated by analyzing three critical pillars: AI automation risk, global market demand, and 20-year salary projections. A high score means the career relies heavily on uniquely human traits—like complex empathy, abstract strategy, and creative problem-solving.\n\nDon't let technology catch you off guard. By using your Future-Proof Score as a compass, you can confidently invest your time and education into a career path that will thrive alongside AI, rather than be replaced by it."
  },
  {
    id: 2,
    slug: 'top-5-careers-lowest-automation-risk',
    title: "Top 5 Careers with the Lowest AI Automation Risk in 2026",
    excerpt: "Discover which industries are thriving alongside AI instead of being replaced by it. Soft skills and complex problem-solving lead the way.",
    category: "Industry Trends",
    date: "April 5, 2026",
    readTime: "7 min read",
    color: "from-purple-500 to-pink-500",
    content: "While generative AI can write code and draft essays, it still struggles with the nuances of human experience. Here are five career paths showing incredible resilience in 2026.\n\n1. Healthcare Professionals & Therapists: AI can assist in diagnosis, but the empathy, physical care, and emotional intelligence required in nursing, physical therapy, and psychology are irreplaceable.\n\n2. AI Ethicists & Governance Leaders: As AI scales, companies desperately need humans to navigate the ethical, legal, and societal implications of these systems.\n\n3. Strategic Product Managers: While AI can optimize existing workflows, defining 'what to build next' requires understanding human desires, market gaps, and business strategy.\n\n4. Creative Directors: AI generates variations of existing ideas, but true, culture-shifting creativity and curation remain a strictly human domain.\n\n5. Specialized Trades: Plumbers, electricians, and advanced manufacturing technicians operate in highly unpredictable physical environments that robots cannot navigate easily."
  },
  {
    id: 3,
    slug: 'science-vs-commerce-data-driven',
    title: "How to Choose Between Science and Commerce: A Data-Driven Approach",
    excerpt: "Struggling to pick a stream? Let the data guide you. We breakdown how your natural strengths map to specific academic paths.",
    category: "Student Guide",
    date: "March 28, 2026",
    readTime: "4 min read",
    color: "from-emerald-500 to-teal-500",
    content: "Choosing between Science and Commerce is one of the most stressful decisions a student faces. Too often, this choice is driven by peer pressure or outdated societal expectations rather than a student's actual aptitude.\n\nA data-driven approach removes the guesswork. If your strengths lean heavily toward logical deduction, spatial reasoning, and curiosity about how the physical or digital world operates, Science provides the rigorous framework you need. Conversely, if you excel in communication, structural organization, resource management, and negotiation, Commerce opens doors to global business leadership.\n\nUsing DestinAI's 6-question assessment, we cross-reference your natural talents with decades of outcome data. We don't just tell you which stream to pick; we show you the exact careers each stream unlocks for someone with your specific profile."
  },
  {
    id: 4,
    slug: 'maximizing-college-matches-dna',
    title: "Maximizing Your College Matches: Understanding the DNA Algorithm",
    excerpt: "How does DestinAI match you with over 15,000 colleges globally? A deep dive into our personalized matching engine.",
    category: "Platform Updates",
    date: "March 15, 2026",
    readTime: "6 min read",
    color: "from-orange-500 to-red-500",
    content: "Finding the right college is like finding a needle in a haystack. With over 15,000 institutions globally, how do you know which one is truly the best fit for your budget, stream, and career goals?\n\nEnter the DestinAI College DNA Algorithm. Unlike traditional rankings that only look at academic prestige, our algorithm scores colleges based on how well they match your personal profile. We evaluate the institution's placement rates specifically for your targeted career, cross-reference their fee structures with your family's budget range, and factor in location preferences.\n\nThe result is a highly curated list of 'Matches' that you can realistically afford, get admitted to, and leverage to launch your exact dream career. Stop chasing generic top-10 lists, and start looking for your perfect match."
  }
];

function Blog() {
  return (
    <div className="min-h-screen pt-24 pb-16" id="blog-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-white mb-4">DestinAI <span className="gradient-text">Insights</span></h1>
          <p className="text-surface-400 text-lg max-w-2xl mx-auto">Discover the latest industry trends, career advice, and deep dives into how AI is shaping the future of education.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog, index) => (
            <motion.div 
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card-hover overflow-hidden flex flex-col h-full"
            >
              <div className={`h-48 w-full bg-gradient-to-br opacity-80 ${blog.color}`} />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between text-xs font-semibold text-surface-400 mb-3 uppercase tracking-wider">
                  <span className="text-primary-400">{blog.category}</span>
                  <span>{blog.readTime}</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-3 hover:text-primary-300 transition-colors cursor-pointer">{blog.title}</h2>
                <p className="text-surface-300 mb-6 flex-1">{blog.excerpt}</p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                  <span className="text-sm text-surface-500">{blog.date}</span>
                  <Link to={`/blog/${blog.slug}`} className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm font-medium transition-colors">Read More <HiArrowRight/></Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Blog;