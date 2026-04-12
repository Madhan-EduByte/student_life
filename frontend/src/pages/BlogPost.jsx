import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft } from 'react-icons/hi';
import { blogs } from './Blog'; // Import the data from our main Blog page

function BlogPost() {
  const { slug } = useParams();
  
  // Find the exact blog post by the slug in the URL
  const blog = blogs.find((b) => b.slug === slug);

  // If someone types an invalid URL, redirect them back to the main blog page safely
  if (!blog) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16" id={`blog-post-${blog.id}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Back Button */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition-colors mb-8">
            <HiArrowLeft /> Back to all articles
          </Link>

          {/* Hero Header */}
          <div className={`w-full h-1 rounded-full bg-gradient-to-r mb-8 ${blog.color}`} />
          <div className="flex items-center gap-4 text-sm font-semibold text-surface-400 mb-4 uppercase tracking-wider">
            <span className="text-primary-400">{blog.category}</span>
            <span>•</span>
            <span>{blog.date}</span>
            <span>•</span>
            <span>{blog.readTime}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-10 leading-tight">
            {blog.title}
          </h1>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none text-surface-300">
            {blog.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6 leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default BlogPost;