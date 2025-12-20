# Pitch My Page - Wireframes & UI Structure

## Wireframe Diagrams (Mermaid)

### 1. Landing Page

```mermaid
graph TB
    A[Header: Logo + Nav: Features, Gallery, Pricing, Login] --> B[Hero Section]
    B --> C[Value Props: Ethical Backlinks, Fair Voting, Indie-Focused]
    C --> D[CTA: Get Started Free]
    D --> E[Stats: Users, Pitches, Backlinks]
    E --> F[Features Grid: 3 columns]
    F --> G[Testimonials/Examples]
    G --> H[Pricing Preview]
    H --> I[Footer: Links, Social, Legal]
```

**Key Elements:**
- Hero: "The Fairer Product Hunt for Indie Creators"
- Value props: Free reciprocal backlinks, Anti-bot voting, Ethical SEO boost
- Social proof: User count, active pitches, verified backlinks
- Clear CTA: "Start Pitching Free" button

### 2. Dashboard

```mermaid
graph TB
    A[Header: Logo + User Menu + Notifications] --> B[Dashboard Tabs: Overview, Pitches, Backlinks, Analytics]
    B --> C[Overview Tab]
    C --> D[Stats Cards: Points, Streak, Level, Badges]
    C --> E[Quick Actions: Submit Pitch, Add Backlink]
    C --> F[Recent Activity Feed]
    C --> G[Daily Challenge Widget]
    C --> H[Leaderboard Preview]
```

**Key Elements:**
- Gamification sidebar: Points balance, level progress bar, active streak
- Quick stats: Total pitches, active backlinks, total votes received
- Activity timeline: Recent votes, comments, achievements
- Challenge card: "Vote on 5 pitches today" + progress + reward

### 3. Submission Form

```mermaid
graph TB
    A[Header: Back to Dashboard] --> B[Form Title: Pitch Your Page]
    B --> C[URL Input + Auto-fetch OG data]
    C --> D[Title - Auto-filled, editable]
    D --> E[Description - Min 100 chars, counter]
    E --> F[Tags - Multi-select or autocomplete]
    F --> G[Category - Radio buttons]
    G --> H[Thumbnail Preview - Auto-generated, can upload]
    H --> I[Reciprocal Link Section - If free tier]
    I --> J[CAPTCHA/Verification]
    J --> K[Submit Button + Points Reward Info]
    K --> L[Tips Sidebar: Best practices, examples]
```

**Key Elements:**
- Real-time validation with helpful error messages
- Preview card showing how pitch will appear
- Points reward display: "You'll earn 10 points for this submission"
- Bulk upload option (for Plus/Power tiers): CSV upload button

### 4. Gallery/Search

```mermaid
graph TB
    A[Header + Search Bar] --> B[Filter Bar: Category, Sort, Time Range]
    B --> C[Gallery Grid - 3 columns responsive]
    C --> D[Pitch Card 1: Thumbnail, Title, Description, Tags, Vote buttons, Comments count]
    C --> E[Pitch Card 2: Same structure]
    C --> F[Pitch Card N: Same structure]
    D --> G[Featured Section: Top pitches this week]
    E --> H[Pagination/Infinite Scroll]
```

**Pitch Card Structure:**
```
┌─────────────────────────┐
│  [Thumbnail Image]      │
│  Title (link)           │
│  Description (truncated)│
│  Tags: #ai #saas        │
│  👆 42  👇 2  💬 8      │
│  By @username • 2h ago  │
│  [View Details]         │
└─────────────────────────┘
```

**Key Elements:**
- Advanced search: Keywords, tags, category, date range
- Sort options: Newest, Most Voted, Trending, Underrepresented
- Fair exposure: "Indie Spotlight" section for smaller creators
- Voting: One vote per user, verified accounts only

### 5. Pitch Detail Page

```mermaid
graph TB
    A[Header] --> B[Pitch Hero Section]
    B --> C[Large Thumbnail/Preview]
    B --> D[Title + Meta: Author, Date, Category]
    B --> E[Vote Section: Upvote/Downvote buttons + counts]
    B --> F[Action Buttons: Share, Add to Backlink]
    B --> G[Full Description]
    G --> H[Tags List]
    H --> I[Backlink Status: If user added this]
    I --> J[Comments Section]
    J --> K[Comment Input]
    J --> L[Comment Threads]
    L --> M[Related Pitches Section]
```

**Key Elements:**
- Live voting with instant feedback
- Share buttons: Twitter, LinkedIn, direct link
- Backlink CTA: "Get a backlink for this pitch" (if user owns it)
- Related pitches: Similar tags/category
- SEO info: Domain authority, uptime if backlinked

### 6. Backlinks Management

```mermaid
graph TB
    A[Header + Tabs: Active, Pending, Expired] --> B[Add New Backlink Form]
    B --> C[Source URL Input]
    B --> D[Target Pitch Selector]
    B --> E[Reciprocal Options]
    B --> F[Submit + Verification Process]
    F --> G[Backlinks List Table]
    G --> H[Row: URL, Status, Uptime%, Last Check, Actions]
    G --> I[Status Badges: Verified, Pending, Failed]
    G --> J[Bulk Actions: Check All, Export CSV]
```

**Table Columns:**
- Source URL (where link is placed)
- Target Pitch
- Type (dofollow/nofollow)
- Status (Verified/Pending/Failed)
- Uptime % (with trend indicator)
- Last Checked
- Actions (Edit, Remove, View Details)

### 7. Authentication (Login/Signup)

```mermaid
graph TB
    A[Header: Logo] --> B[Auth Card: Toggle Login/Signup]
    B --> C[Email Input]
    B --> D[Password Input]
    B --> E[Signup: Additional Fields - Username, Confirm Password]
    B --> F[Social Auth Buttons: Google, X/Twitter]
    B --> G[Submit Button]
    B --> H[Links: Forgot Password, Terms, Privacy]
    G --> I[Onboarding Wizard - Step 1]
    I --> J[Welcome + Tour]
    I --> K[Profile Setup]
    I --> L[First Pitch Tutorial]
    I --> M[Complete: Redirect to Dashboard]
```

**Key Elements:**
- Single form component with mode toggle
- Social auth prominent (Google, X)
- Password strength indicator on signup
- GDPR consent checkbox
- Skip-able onboarding for returning users

### 8. Leaderboard

```mermaid
graph TB
    A[Header] --> B[Period Selector: Daily, Weekly, Monthly, All-time]
    B --> C[Leaderboard Table]
    C --> D[Rank Column]
    C --> E[User Avatar + Username]
    C --> F[Points Column]
    C --> G[Stats: Pitches, Votes, Comments]
    C --> H[Badges Display]
    C --> I[Current User Highlighted Row]
    I --> J[Pagination]
```

**Key Elements:**
- Top 3 get special highlighting/gold/silver/bronze
- Click username to view profile
- Filter by category/achievement type
- Export option for Power tier users

## Responsive Breakpoints

- Mobile: < 640px (single column, stacked cards)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (3 columns gallery, full sidebar)

## Design Principles

1. **Fairness First**: Prominent "Indie Spotlight" sections, transparent vote counts
2. **Trust Indicators**: Verification badges, uptime guarantees, anti-bot badges
3. **Gamification Visibility**: Points, badges, streaks always visible in header/nav
4. **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, screen reader support
5. **Dark Mode**: Toggle in header, respects system preference

