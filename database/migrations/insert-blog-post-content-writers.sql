-- Insert blog post: For Content Writers
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
    
    SELECT id INTO blog_post_id FROM blog_posts WHERE slug = 'why-content-writers-need-pitch-my-page';
    
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
        'Why Content Writers Need Pitch My Page: Beyond Publishing',
        'why-content-writers-need-pitch-my-page',
        'Content writing doesn''t end at publishing. Discover how Pitch My Page helps writers get their articles discovered, build SEO, and grow their readership.',
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
  
  <h2>✍️ The Content Writer''s Challenge</h2>
  
  <p>You''ve spent hours researching, writing, and editing your article. You''ve crafted compelling headlines, added valuable insights, and ensured every word serves your readers. You hit publish, share it on social media, and then... silence. Your article disappears into the void, barely reaching the audience it deserves.</p>
  
  <div style="background: #f3f4f6; padding: 1.5rem; border-left: 4px solid #3b82f6; margin: 2rem 0;">
    <p style="margin: 0; font-style: italic;">💡 Writing great content is only half the battle. The other half is getting it discovered by people who need it.</p>
  </div>
  
  <p>Content writers face a unique challenge: creating quality content is already time-consuming, and promotion often feels like a second full-time job. Social media algorithms favor engagement over quality. SEO requires backlinks you don''t have time to build. Content discovery platforms favor established publications with marketing budgets.</p>
  
  <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop" alt="Content writing" style="width: 100%; height: auto; border-radius: 8px; margin: 2rem 0;" />
  
  <h2>❓ What If Content Promotion Was Simpler?</h2>
  
  <p>What if you could submit an article once and have it discovered by a community that values quality writing? What if you could earn SEO backlinks without endless outreach? What if promotion happened alongside creation, not as a separate exhausting process?</p>
  
  <p>Pitch My Page transforms content promotion from a burden into an integrated part of your writing workflow. Instead of spending hours on promotion for every article, you submit your pitch and let the community discovery process work for you.</p>
  
  <img src="https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=800&h=400&fit=crop" alt="Writing workflow" style="width: 100%; height: auto; border-radius: 8px; margin: 2rem 0;" />
  
  <h2>🎯 How Pitch My Page Serves Content Writers</h2>
  
  <p>Pitch My Page is built with content writers in mind. Every feature addresses the real challenges writers face:</p>
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin: 2rem 0;">
    <h3 style="color: white; margin-top: 0;">🌟 Key Benefits</h3>
    <ul style="margin-bottom: 0;">
      <li><strong>Community Discovery:</strong> Your articles get seen by readers who value quality content</li>
      <li><strong>SEO Backlinks:</strong> Earn dofollow backlinks that improve your domain authority</li>
      <li><strong>Long-Term Visibility:</strong> Articles remain discoverable, not buried by algorithms</li>
      <li><strong>Feedback and Engagement:</strong> Real comments from readers who appreciate your work</li>
      <li><strong>Zero Cost to Start:</strong> Free tier provides immediate value without budget concerns</li>
    </ul>
  </div>
  
  <h2>✅ The Content Writer Workflow</h2>
  
  <h3>1. Submit Your Article</h3>
  
  <p>After publishing your article, submit it to Pitch My Page. The platform automatically pulls your article''s title, description, and featured image from Open Graph data, making submission quick and easy. No manual data entry required.</p>
  
  <img src="https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&h=400&fit=crop" alt="Article submission" style="width: 100%; height: auto; border-radius: 8px; margin: 2rem 0;" />
  
  <h3>2. Add Reciprocal Link (Optional but Recommended)</h3>
  
  <p>Add a simple link to Pitch My Page on your blog. This reciprocal link earns you a dofollow backlink in return—valuable SEO that helps your entire site rank better. The free tier gives you 2 of these backlinks, enough to get started.</p>
  
  <div style="background: #ecfdf5; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
    <h4 style="margin-top: 0; color: #065f46;">📊 SEO Impact</h4>
    <p style="margin-bottom: 0;">Each dofollow backlink improves your domain authority. Over time, as you submit more articles and earn more backlinks, your entire blog''s search rankings improve. One submission helps all your content.</p>
  </div>
  
  <h3>3. Community Discovery</h3>
  
  <p>Your article enters the Pitch My Page gallery, where it can be discovered by readers actively looking for quality content. Community voting determines visibility—quality writing rises to the top, regardless of your blog''s size or marketing budget.</p>
  
  <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop" alt="Community discovery" style="width: 100%; height: auto; border-radius: 8px; margin: 2rem 0;" />
  
  <h3>4. Ongoing Benefits</h3>
  
  <p>Unlike social media posts that disappear quickly, your articles on Pitch My Page remain discoverable. Readers can find them through search, browsing, and community recommendations. This provides lasting promotional value that compounds over time.</p>
  
  <h2>🔍 Why This Matters for Writers</h2>
  
  <p>Traditional content promotion requires constant effort: posting on multiple social platforms, engaging with comments, building email lists, conducting outreach for backlinks. It''s exhausting, and it takes time away from what you do best: writing.</p>
  
  <p>Pitch My Page simplifies this by providing a single platform that handles discovery, SEO, and engagement. You write, you submit, and the platform does the rest.</p>
  
  <div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
    <p style="margin: 0;"><strong>💡 Writer''s Perspective:</strong> "I used to spend more time promoting articles than writing them. With Pitch My Page, I submit my article once and focus on writing the next one. My readership has grown, my SEO has improved, and I''m actually enjoying content creation again."</p>
  </div>
  
  <h3>The SEO Advantage</h3>
  
  <p>For content writers, SEO isn''t optional—it''s essential. Your articles need to rank in search results to reach readers who are actively looking for your topics. Pitch My Page''s reciprocal linking system provides the backlinks needed to improve domain authority and search rankings.</p>
  
  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop" alt="SEO benefits" style="width: 100%; height: auto; border-radius: 8px; margin: 2rem 0;" />
  
  <p>Each article you submit can earn a dofollow backlink. Over time, as you build your backlink profile, your entire blog benefits. New articles rank better because your domain authority has improved. It''s a compounding effect that grows with every submission.</p>
  
  <h2>📝 Getting Started as a Content Writer</h2>
  
  <p>If you''re a content writer looking to get your articles discovered and improve your SEO, Pitch My Page offers everything you need:</p>
  
  <ul>
    <li>Submit unlimited articles on the free tier</li>
    <li>Earn 2 free dofollow backlinks to improve SEO</li>
    <li>Get discovered by a community that values quality writing</li>
    <li>Receive feedback and engagement from readers</li>
    <li>Build long-term visibility that compounds over time</li>
  </ul>
  
  <p>The platform is designed to work with your existing workflow. You don''t need to change how you write or publish—just add Pitch My Page submission to your post-publication checklist.</p>
  
  <p>Content writing is challenging enough without promotion adding to the burden. Pitch My Page simplifies content promotion, improves SEO, and helps quality writing find its audience. Start submitting your articles today and see the difference it makes.</p>
</div>',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630&fit=crop',
        admin_user_id,
        'published',
        CURRENT_TIMESTAMP,
        'Why Content Writers Need Pitch My Page',
        'Content writing doesn''t end at publishing. Discover how Pitch My Page helps writers get their articles discovered, build SEO, and grow their readership.',
        ARRAY['content writing', 'article promotion', 'blogging', 'SEO for writers', 'content discovery']
    );
    
    RAISE NOTICE 'Blog post created: why-content-writers-need-pitch-my-page';
END $$;

