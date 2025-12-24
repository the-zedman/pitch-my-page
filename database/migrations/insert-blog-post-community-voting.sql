-- Insert blog post: Community-Driven Voting System
-- Run after add_blog_posts.sql migration

DO $$
DECLARE
    admin_user_id UUID;
    blog_post_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM profiles WHERE role = 'admin' LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No admin user found. Please create an admin user first.';
        RETURN;
    END IF;
    
    SELECT id INTO blog_post_id FROM blog_posts WHERE slug = 'how-community-voting-transforms-content-discovery';
    
    IF blog_post_id IS NOT NULL THEN
        RAISE NOTICE 'Blog post already exists';
        RETURN;
    END IF;
    
    INSERT INTO blog_posts (
        title,
        slug,
        excerpt,
        content,
        featured_image_url,
        author_id,
        status,
        published_at,
        meta_title,
        meta_description,
        keywords
    ) VALUES (
        'How Community-Driven Voting Transforms Content Discovery',
        'how-community-voting-transforms-content-discovery',
        'Discover how transparent, community-driven voting creates a fair playing field for content creators and helps quality content rise to the top.',
        '<div class="blog-post-content">
  <style>
    .blog-post-content p {
      margin-bottom: 1.5rem;
      line-height: 1.8;
    }
    .blog-post-content h2 {
      margin-top: 3rem;
      margin-bottom: 1.5rem;
    }
    .blog-post-content h3 {
      margin-top: 2.5rem;
      margin-bottom: 1rem;
    }
    .blog-post-content ul, .blog-post-content ol {
      margin-bottom: 1.5rem;
      padding-left: 2rem;
    }
    .blog-post-content li {
      margin-bottom: 0.75rem;
      line-height: 1.8;
    }
  </style>
  
  <h2>🗳️ The Problem with Traditional Content Ranking</h2>
  
  <p>In most content platforms today, what you see is determined by algorithms you can''t see. These black-box systems prioritize engagement metrics that might not reflect actual value, favor established brands with marketing budgets, and make it nearly impossible for quality content from independent creators to compete.</p>
  
  <div style="background: #f3f4f6; padding: 1.5rem; border-left: 4px solid #3b82f6; margin: 2rem 0;">
    <p style="margin: 0; font-style: italic;">💡 The core issue: when ranking is hidden, it''s hard to trust that quality content has a fair chance to succeed.</p>
  </div>
  
  <p>Content writers watch their carefully researched articles buried under sponsored content. Indie developers see their innovative products ignored in favor of well-funded competitors. Bloggers struggle to get visibility despite producing exceptional work. The problem isn''t the content—it''s the system.</p>
  
  <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop" alt="Community voting" style="width: 100%; height: auto; border-radius: 8px; margin: 2rem 0;" />
  
  <h2>❓ What If Ranking Was Transparent?</h2>
  
  <p>What if every vote was public? What if content creators could see exactly why their work was or wasn''t getting traction? What if rankings reflected genuine community appreciation rather than algorithm manipulation?</p>
  
  <p>These questions drive Pitch My Page''s community voting system. By making every vote transparent and every ranking earned through genuine engagement, we create a system where quality content naturally rises to the top.</p>
  
  <ul>
    <li><strong>Transparency builds trust:</strong> When votes are public, creators understand what''s happening and why.</li>
    <li><strong>Quality over budget:</strong> Content succeeds based on merit, not marketing spend.</li>
    <li><strong>Authentic engagement:</strong> Real people voting on real content creates genuine rankings.</li>
    <li><strong>Fair competition:</strong> Every pitch gets an equal opportunity to be discovered.</li>
  </ul>
  
  <h2>🎯 The Solution: Public, Transparent Voting</h2>
  
  <p>Pitch My Page operates on a simple principle: <strong>every vote should be public, every ranking should be earned.</strong> This transparency transforms content discovery from a mysterious process into a democratic one.</p>
  
  <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop" alt="Transparent voting" style="width: 100%; height: auto; border-radius: 8px; margin: 2rem 0;" />
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin: 2rem 0;">
    <h3 style="color: white; margin-top: 0;">🌟 How It Works</h3>
    <ul style="margin-bottom: 0;">
      <li>Every user can vote on any pitch they find valuable</li>
      <li>All votes are visible to everyone—no hidden algorithms</li>
      <li>Content with the most community support rises in rankings</li>
      <li>Comments and feedback provide context for votes</li>
    </ul>
  </div>
  
  <p>For content writers, this means articles are ranked by readers who actually engage with your work. For indie developers, product pitches succeed based on genuine interest, not paid promotion.</p>
  
  <h2>✅ Real-World Benefits</h2>
  
  <h3>1. Fair Competition</h3>
  
  <p>When votes are transparent, small creators can compete with established players. A well-written article from an independent writer has the same opportunity to gain visibility as content from major publications.</p>
  
  <img src="https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=400&fit=crop" alt="Fair competition" style="width: 100%; height: auto; border-radius: 8px; margin: 2rem 0;" />
  
  <h3>2. Authentic Feedback</h3>
  
  <p>Public votes combined with comments give creators real insights into what resonates with their audience. This feedback loop helps improve future content and product development.</p>
  
  <h3>3. Trust and Credibility</h3>
  
  <p>Transparency builds trust. When users know how rankings work, they''re more likely to engage meaningfully. This creates a healthier ecosystem where quality content thrives.</p>
  
  <div style="background: #ecfdf5; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
    <h4 style="margin-top: 0; color: #065f46;">📊 The Impact</h4>
    <p style="margin-bottom: 0;">Content creators report higher engagement rates and more meaningful interactions when votes are transparent. The community becomes more invested because they understand their role in shaping rankings.</p>
  </div>
  
  <h3>4. No Pay-to-Play</h3>
  
  <p>Unlike platforms where visibility can be purchased, Pitch My Page ensures that rankings are earned through community support. This levels the playing field and rewards quality content regardless of marketing budget.</p>
  
  <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop" alt="No pay to play" style="width: 100%; height: auto; border-radius: 8px; margin: 2rem 0;" />
  
  <h2>🔍 Why This Matters</h2>
  
  <p>Traditional content platforms often prioritize engagement metrics that can be gamed or purchased. By contrast, transparent community voting ensures that rankings reflect genuine value and interest.</p>
  
  <p>For content writers, this means your well-researched articles can compete on merit. For indie developers, it means product launches succeed based on solving real problems, not marketing spend.</p>
  
  <p>The community voting system on Pitch My Page represents a return to fundamentals: quality content, genuine engagement, and transparent processes. In an era where algorithm manipulation is common, this transparency is revolutionary.</p>
  
  <div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
    <p style="margin: 0;"><strong>💡 Key Takeaway:</strong> When voting is transparent and rankings are earned, quality content naturally rises to the top. This creates a fairer, more trustworthy content discovery experience for creators and readers alike.</p>
  </div>
  
  <h2>📝 The Bottom Line</h2>
  
  <p>Community-driven voting transforms content discovery from a mysterious algorithm into a democratic process. By making every vote public and every ranking earned, Pitch My Page creates a fair playing field where quality content can thrive regardless of budget or brand recognition.</p>
  
  <p>If you''re a content creator looking for a platform that values transparency and rewards quality, Pitch My Page''s community voting system offers exactly that. Join us and experience content promotion the way it should be: fair, transparent, and community-driven.</p>
</div>',
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&h=630&fit=crop',
        admin_user_id,
        'published',
        CURRENT_TIMESTAMP,
        'Community-Driven Voting: Fair Content Discovery',
        'Discover how transparent, community-driven voting creates a fair playing field for content creators and helps quality content rise to the top.',
        ARRAY['community voting', 'transparency', 'content discovery', 'fair rankings', 'democratic voting']
    );
    
    RAISE NOTICE 'Blog post created: how-community-voting-transforms-content-discovery';
END $$;

