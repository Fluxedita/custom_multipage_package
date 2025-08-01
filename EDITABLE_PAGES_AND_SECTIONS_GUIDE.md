# Editable Pages and Section Components Guide

## Overview

This guide explains how editable pages and their section components are structured in both the database and the frontend.  
It is intended for developers, admins, and new users to understand how to manage, extend, and customize the content system.

- **System/Root Pages** (e.g., Home, About, Gallery) use the `root_page_components` table for their editable sections.
- **Custom Pages** (user-created or dynamic) use the `custom_pages` and `page_content` tables.
- **Each section** (hero, gallery, text, etc.) is represented as a modular component, with its content stored in the database as JSONB.

This modular approach allows for flexible, dynamic page layouts and easy extension of new section types.

---

## 1. Database Structure

- **`root_page_components` table**:  
  Stores editable sections for system/root pages (e.g., `/`, `/about`, `/gallery`).  
  Each row represents a section/component (e.g., hero, content, etc.) for a specific page and type.

- **`custom_pages` table**:  
  Stores metadata for user-created or dynamic pages (slug, title, access type, etc.).

- **`page_content` table**:  
  Stores the actual content sections for custom pages.  
  Each row represents a section/component for a specific custom page.

- **Section content** is stored as JSONB in the `content` field, allowing for flexible properties per section type.

- **Other related tables**:
  - `gallery_data` and `media_items`: For organizing and storing media (images, videos) used in sections.
  - `contact_submissions`, `comments`, etc.: For interactive or user-generated content sections.

---

## 2. Editable Pages

### System/Root Pages

These are core pages that exist for every site (e.g., Home, About, Gallery, Members, Contact, etc.).

- **Examples:** `/`, `/about`, `/gallery`, `/members`, `/contact`
- **Database Table:** `root_page_components`
- **How it works:**
  - Each section (e.g., hero, content, features) is a row in `root_page_components`, identified by `page_slug` and `component_type`.
  - Content for each section is stored as JSONB in the `content` field.
  - The frontend dynamically renders these sections in the order and layout defined in the database.
- **Editing:** Admins can edit, add, or remove sections using the admin floating action buttons (FABs) on each page.

---

### Custom Pages

These are user-created or dynamic pages, which can be public or premium.

- **Examples:** `/custom_pages/my-story`, `/custom_pages/premium-guide`
- **Database Tables:** `custom_pages` (page metadata), `page_content` (sections)
- **How it works:**
  - Each custom page has a row in `custom_pages` (with slug, title, access type, etc.).
  - Each section for a custom page is a row in `page_content`, linked by `page_id` or `page_slug`.
  - Section content is stored as JSONB in the `content` field.
  - The frontend renders these sections in the order defined by the `sort_order` field.
- **Editing:** Admins can fully customize these pages using the admin FABs, adding any available section/component type.

---

### Access Control

- **System/Root Pages:** Access is determined by page type (public, member, premium, admin) and enforced by RLS policies and frontend checks.
- **Custom Pages:** Access type (public or premium) is set at creation and enforced in both the database and frontend.

### Home Page (Public Access Page)
- **Route**: `/` (root)
- **Layout**: `app/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **HeroSection Component**: Populated by admin user
    - **Database**: Stored in `page_content.sections` as `{ "type": "hero", ... }`
    - **Table**: `page_content` where `page_slug = 'home'`
  - **Rest of page**: Fully customizable by admin using page's admin edit control fabs
    - **Database**: Additional sections in `page_content.sections` array
    - **Components**: Any section type from the available library

### Public Gallery Page (Public Access Page)
- **Route**: `/gallery`
- **Layout**: `app/gallery/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **HeroSection Component**: Populated by admin user
    - **Database**: Stored in `page_content.sections` as `{ "type": "hero", ... }`
    - **Table**: `page_content` where `page_slug = 'gallery'`
  - **Add Media Set Function**: Below the HeroSection (public access auth route)
    - **Database**: `gallery_data` table with `type = 'gallery'`
    - **Components**: Image and Video tabs for media upload
    - **Tables**: `gallery_data`, `media_items` (linked via `gallery_data_id`)

### Exclusive Page (Premium Access Page)
- **Route**: `/exclusive`
- **Layout**: `app/exclusive/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **HeroSection Component**: Populated by admin user
    - **Database**: Stored in `page_content.sections` as `{ "type": "hero", ... }`
    - **Table**: `page_content` where `page_slug = 'exclusive'`
  - **Add Media Set Function**: Below the HeroSection (premium access auth route)
    - **Database**: `gallery_data` table with `type = 'exclusive'`
    - **Components**: Image and Video tabs for media upload
    - **Tables**: `gallery_data`, `media_items` (linked via `gallery_data_id`)

### Behind Scenes Page (Premium Access Page)
- **Route**: `/behind-scenes`
- **Layout**: `app/behind-scenes/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **HeroSection Component**: Populated by admin user
    - **Database**: Stored in `page_content.sections` as `{ "type": "hero", ... }`
    - **Table**: `page_content` where `page_slug = 'behind-scenes'`
  - **Add Media Set Function**: Below the HeroSection (premium access auth route)
    - **Database**: `gallery_data` table with `type = 'behind-scenes'`
    - **Components**: Image and Video tabs for media upload
    - **Tables**: `gallery_data`, `media_items` (linked via `gallery_data_id`)

### About Page (Public Access Page)
- **Route**: `/about`
- **Layout**: `app/about/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **HeroSection Component**: Populated by admin user
    - **Database**: Stored in `page_content.sections` as `{ "type": "hero", ... }`
    - **Table**: `page_content` where `page_slug = 'about'`
  - **Rest of page**: Fully customizable by admin using page's admin edit control fabs
    - **Database**: Additional sections in `page_content.sections` array
    - **Components**: Any section type from the available library

### Contact Page (Public Access Page)
- **Route**: `/contact`
- **Layout**: `app/contact/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **HeroSection Component**: Populated by admin user
    - **Database**: Stored in `page_content.sections` as `{ "type": "hero", ... }`
    - **Table**: `page_content` where `page_slug = 'contact'`
  - **Contact Form**: Built-in contact functionality
    - **Database**: Form submissions stored in `contact_submissions` table
    - **Components**: Contact form with validation and submission handling
  - **CommentsSection**: User comments and interactions
    - **Database**: `comments` table linked to `profiles` via `user_id`
    - **Components**: Comment posting, viewing, and moderation
  - **Rest of page**: Fully customizable by admin using page's admin edit control fabs
    - **Database**: Additional sections in `page_content.sections` array
    - **Components**: Any section type from the available library

### Members Page (Premium Access Page)
- **Route**: `/members`
- **Layout**: `app/members/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **HeroSection Component**: Populated by admin user
    - **Database**: Stored in `page_content.sections` as `{ "type": "hero", ... }`
    - **Table**: `page_content` where `page_slug = 'members'`
  - **Membership Benefits**: Display member benefits and features
    - **Database**: `membership_benefits` table
    - **Components**: Animated benefits display, benefit modals
  - **Rest of page**: Fully customizable by admin using page's admin edit control fabs
    - **Database**: Additional sections in `page_content.sections` array
    - **Components**: Any section type from the available library

### Custom Pages (Dynamic Pages - Public or Premium Access)
- **Route**: `/custom_pages/[slug]`
- **Layout**: `app/custom_pages/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **HeroSection Component**: Populated by admin user
    - **Database**: Stored in `page_content.sections` as `{ "type": "hero", ... }`
    - **Table**: `page_content` where `page_slug = [dynamic_slug]`
  - **Contact Form**: Optional contact functionality
    - **Database**: Form submissions stored in `contact_submissions` table
    - **Components**: Contact form with validation and submission handling
  - **Rest of page**: Fully customizable by admin using page's admin edit control fabs
    - **Database**: Additional sections in `page_content.sections` array
    - **Components**: Any section type from the available library
  - **Access Control**: User choice at point of creation (public or premium)

### Admin Pages (Admin Access Only)
- **Route**: `/admin/*`
- **Layout**: `app/admin/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **HeroSection Component**: Populated by admin user
    - **Database**: Stored in `page_content.sections` as `{ "type": "hero", ... }`
    - **Table**: `page_content` where `page_slug = 'admin-[page_name]'`
  - **Admin Dashboard Components**: Various admin tools and interfaces
    - **Database**: Multiple tables (`profiles`, `gallery_data`, `comments`, etc.)
    - **Components**: Analytics, content management, member management, settings
  - **Rest of page**: Fully customizable by admin using page's admin edit control fabs
    - **Database**: Additional sections in `page_content.sections` array
    - **Components**: Any section type from the available library

### Profile Pages (User Access Pages)
- **Route**: `/profile/[id]`
- **Layout**: `app/profile/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **Profile Information**: User profile data
    - **Database**: `profiles` table with user details
    - **Components**: Editable profile content, image upload
  - **Profile Media**: User's personal media
    - **Database**: `media_items` table linked to user profile
    - **Components**: Media upload, gallery display
  - **Rest of page**: Fully customizable by admin using page's admin edit control fabs
    - **Database**: Additional sections in `page_content.sections` array
    - **Components**: Any section type from the available library

### Subscription Management Pages (User Access Pages)
- **Route**: `/subscription/*`
- **Layout**: `app/subscription/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **Checkout Page**: `/subscription/checkout`
    - **Database**: Stripe integration for payment processing
    - **Components**: Payment form, pricing display, subscription options
  - **Success Page**: `/subscription/success`
    - **Database**: Subscription confirmation and user status updates
    - **Components**: Success confirmation, next steps guidance
  - **Cancel Page**: `/subscription/cancel`
    - **Database**: Subscription cancellation handling
    - **Components**: Cancellation confirmation, reactivation options

### Authentication Pages (Public Access Pages)
- **Route**: `/auth/*`
- **Layout**: `app/auth/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **Sign In**: `/auth/signin`
    - **Database**: Supabase Auth integration
    - **Components**: Login form, social auth options, password reset
  - **Sign Up**: `/auth/signup`
    - **Database**: User registration in `auth.users` and `profiles`
    - **Components**: Registration form, terms acceptance, email verification
  - **Callback**: `/auth/callback`
    - **Database**: OAuth callback handling
    - **Components**: Authentication redirect handling

### Login Page (Public Access Page)
- **Route**: `/login`
- **Layout**: `app/login/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **Login Form**: User authentication
    - **Database**: Supabase Auth integration
    - **Components**: Login form, social auth options, password reset
  - **Rest of page**: Fully customizable by admin using page's admin edit control fabs
    - **Database**: Additional sections in `page_content.sections` array
    - **Components**: Any section type from the available library

### Media Management Page (Admin Access Page)
- **Route**: `/media`
- **Layout**: `app/media/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **Media Library**: Centralized media management
    - **Database**: `media_items` table with Cloudinary integration
    - **Components**: Media upload, organization, tagging, search
  - **Media Upload**: File upload functionality
    - **Database**: Cloudinary storage with metadata in `media_items`
    - **Components**: Drag-and-drop upload, progress tracking, file validation
  - **Rest of page**: Fully customizable by admin using page's admin edit control fabs
    - **Database**: Additional sections in `page_content.sections` array
    - **Components**: Any section type from the available library

### Legal Pages (Public Access Pages)
- **Route**: `/cookies`, `/privacy`, `/terms`
- **Layout**: `app/[legal-page]/layout.tsx` for basic layout (header, footer, admin fabs...)
- **Default Editable Components**:
  - **Cookies Page**: `/cookies`
    - **Database**: Stored in `page_content.sections` as legal content
    - **Table**: `page_content` where `page_slug = 'cookies'`
    - **Components**: Cookie policy content, consent management
  - **Privacy Policy Page**: `/privacy`
    - **Database**: Stored in `page_content.sections` as legal content
    - **Table**: `page_content` where `page_slug = 'privacy'`
    - **Components**: Privacy policy content, data handling information
  - **Terms of Service Page**: `/terms`
    - **Database**: Stored in `page_content.sections` as legal content
    - **Table**: `page_content` where `page_slug = 'terms'`
    - **Components**: Terms of service content, user agreement information
  - **Rest of pages**: Fully customizable by admin using page's admin edit control fabs
    - **Database**: Additional sections in `page_content.sections` array
    - **Components**: Any section type from the available library

---

### **Quick Reference Table: All Editable Pages**

| Page | Route | Access Level | Key Components | Primary Database Tables | Special Features |
|------|-------|--------------|----------------|------------------------|------------------|
| **Home** | `/` | Public | HeroSection, Custom Sections | `page_content` | Landing page, fully customizable |
| **About** | `/about` | Public | HeroSection, Custom Sections | `page_content` | Biography, story content |
| **Gallery** | `/gallery` | Public | HeroSection, Media Sets, Custom Sections | `page_content`, `gallery_data`, `media_items` | Image/Video uploads, public access |
| **Exclusive** | `/exclusive` | Premium | HeroSection, Media Sets, Custom Sections | `page_content`, `gallery_data`, `media_items` | Premium content, member-only |
| **Behind Scenes** | `/behind-scenes` | Premium | HeroSection, Media Sets, Custom Sections | `page_content`, `gallery_data`, `media_items` | Process content, member-only |
| **Contact** | `/contact` | Public | HeroSection, Contact Form, Comments, Custom Sections | `page_content`, `contact_submissions`, `comments` | User interaction, form handling |
| **Members** | `/members` | Premium | HeroSection, Benefits, Custom Sections | `page_content`, `membership_benefits` | Member benefits, premium features |
| **Profile** | `/profile/[id]` | User | Profile Info, Profile Media, Custom Sections | `profiles`, `media_items`, `page_content` | User-specific content |
| **Custom Pages** | `/custom_pages/[slug]` | Public/Premium | HeroSection, Contact Form, Custom Sections | `page_content`, `contact_submissions` | Dynamic creation, flexible access |
| **Admin Pages** | `/admin/*` | Admin | HeroSection, Admin Tools, Custom Sections | `page_content`, `profiles`, `gallery_data`, `comments` | Administrative functions |
| **Subscription** | `/subscription/*` | User | Checkout, Success, Cancel | Stripe integration | Payment processing |
| **Auth** | `/auth/*` | Public | Sign In, Sign Up, Callback | `auth.users`, `profiles` | User authentication |
| **Login** | `/login` | Public | Login Form, Custom Sections | `auth.users`, `page_content` | Authentication entry |
| **Media** | `/media` | Admin | Media Library, Upload | `media_items` | Centralized media management |
| **Legal Pages** | `/cookies`, `/privacy`, `/terms` | Public | Legal Content, Custom Sections | `page_content` | Legal compliance |

**Legend:**
- **Public**: Accessible to all visitors
- **Premium**: Requires premium membership
- **User**: Requires user authentication
- **Admin**: Requires admin privileges

---

## 3. Section Types

Each editable page is composed of modular "sections" (also called components).  
Each section is represented as a row in either `root_page_components` (for system/root pages) or `page_content` (for custom pages).

- **Section content** is stored as JSONB in the `content` field, allowing each section type to have its own properties and structure.
- **Section types** include (but are not limited to):
  - `hero` (large banner with title, description, background image/video)
  - `gallery` (image or video gallery)
  - `text` (rich text or markdown content)
  - `feature` (highlighted features or benefits)
  - `cta` (call-to-action)
  - `divider` (visual separator)
  - `testimonial` (user/member testimonials)
  - `media` (embedded media, e.g., video, audio)
  - `contact` (contact form)
  - `comments` (comments section)
  - ...and any other custom section types you add

**Extending Section Types:**  
To add a new section type, create a new React component in the frontend and update the section type registry.  
The backend only needs to store the section's JSONB content; the frontend determines how to render it.

---

## 4. Admin Edit Controls

Admins can manage page sections directly from the frontend using floating action buttons (FABs) and edit controls.

- **FABs** appear on each editable page for admins, allowing them to:
  - Add a new section/component
  - Edit an existing section's content and properties
  - Reorder sections (drag-and-drop or up/down controls)
  - Remove sections
- **Section editors** are context-aware, showing the correct form fields for each section type.
- **Changes are saved** to the appropriate table (`root_page_components` or `page_content`) and reflected in real time.

---

## 5. Example Page Structures

Below are examples of how different pages are structured, which tables/components are used, and what sections are typically present.

---

### Home Page (`/`)

- **Table:** `root_page_components`
- **Sections:** Hero, content, features, etc. (each as a row in `root_page_components` with `page_slug = 'home'`)
- **Editing:** Admins can add/edit/remove sections via FABs.

---

### Gallery Page (`/gallery`)

- **Table:** `root_page_components` (for hero and static sections), `gallery_data` and `media_items` (for gallery content)
- **Sections:** Hero, gallery, featured sets, etc.
- **Media:** Managed via `gallery_data` (type = 'gallery') and `media_items`.
- **Editing:** Admins can manage gallery sections and media via FABs and media management UI.

---

### Exclusive Page (`/exclusive`)

- **Table:** `root_page_components` (for hero and static sections), `gallery_data` and `media_items` (for exclusive content)
- **Sections:** Hero, exclusive gallery, etc.
- **Access:** Premium members only (enforced by RLS and frontend).
- **Editing:** Admins manage sections and media as above.

---

### Behind Scenes Page (`/behind-scenes`)

- **Table:** `root_page_components`, `gallery_data`, `media_items`
- **Sections:** Hero, behind-the-scenes gallery, etc.
- **Access:** Premium members only.
- **Editing:** Admins manage sections and media.

---

### About Page (`/about`)

- **Table:** `root_page_components`
- **Sections:** Hero, about story, profile, etc.
- **Editing:** Admins manage sections via FABs.

---

### Contact Page (`/contact`)

- **Table:** `root_page_components`, `contact_submissions`, `comments`
- **Sections:** Hero, contact form, comments, etc.
- **Editing:** Admins manage sections; contact form submissions go to `contact_submissions`.

---

### Members Page (`/members`)

- **Table:** `root_page_components`, `membership_benefits`
- **Sections:** Hero, membership benefits, testimonials, etc.
- **Access:** Premium/member access.
- **Editing:** Admins manage sections and benefits.

---

### Custom Pages (`/custom_pages/[slug]`)

- **Tables:** `custom_pages` (page metadata), `page_content` (sections)
- **Sections:** Any available section/component type.
- **Access:** Public or premium, set at creation.
- **Editing:** Fully customizable by admins via FABs.

---

### Admin Pages (`/admin/*`)

- **Table:** `root_page_components` (for admin dashboard sections), plus all relevant data tables (profiles, gallery_data, comments, etc.)
- **Sections:** Hero, analytics, content management, member management, settings, etc.
- **Access:** Admin only.
- **Editing:** Admins manage all sections and data.

---

### Profile Pages (`/profile/[id]`)

- **Tables:** `profiles`, `media_items`
- **Sections:** Profile info, profile media, etc.
- **Editing:** Users can edit their own profile and media.

---

### Subscription Management Pages (`/subscription/*`)

- **Table:** `root_page_components`, Stripe integration
- **Sections:** Checkout, success, cancel, etc.
- **Editing:** Admins can manage subscription-related content.

---

### Authentication Pages (`/auth/*`), Login Page (`/login`)

- **Table:** Supabase Auth, `profiles`
- **Sections:** Sign in, sign up, callback, etc.
- **Editing:** Admins can customize layout and content sections.

---

### Media Management Page (`/media`)

- **Tables:** `media_items`, Cloudinary
- **Sections:** Media library, upload, organization, etc.
- **Editing:** Admins manage all media.

---

## How to Update the Header Dropdown List with Page Section Links

You can add links to specific sections of your main page (or any custom page) in the header's dropdown navigation menu. This allows users to jump directly to a section, such as a Hero, CTA, or Feature section.

### Step-by-Step Guide

1. **Find the Section ID**
   - Each section on your page has a unique `id` (e.g., `hero`, `cta`, `feature-card-grid`).
   - If you added a new section via the Page Controls sidebar, it will have an `id` property (visible in the section data or code).
   - You can inspect the page in your browser (right-click > Inspect) and look for `<section id="your-section-id">` to find the correct ID.

2. **Edit the Header Navigation**
   - Open `components/Header.tsx` in your code editor.
   - Locate the dropdown menu (often labeled "Services" or similar).
   - Add a new link using the section's ID as an anchor:

     ```tsx
     <Link href="#cta" className="block px-4 py-2 text-sm hover:bg-muted">
       Call To Action
     </Link>
     ```
   - Replace `#cta` with the actual section ID you want to link to.

3. **Save and Test**
   - Save your changes and reload the site.
   - Click the new link in the header dropdown; it should scroll the page to the corresponding section.

### Example
Suppose you have a section with `id="feature-card-grid"`. Add this to your header dropdown:

```tsx
<Link href="#feature-card-grid" className="block px-4 py-2 text-sm hover:bg-muted">
  Feature Card Grid
</Link>
```

### Tips
- Make sure each section has a unique `id`.
- You can add as many section links as you like.
- If you add a new section, repeat the steps above to link to it.
- For custom pages, use the format `<Link href="/custom_pages/your-page#your-section-id">...</Link>`.

---

## 6. Troubleshooting Tips

- If a page is missing content, check that its sections are present in the correct table (`root_page_components` for system/root pages, `page_content` for custom pages).
- If a section is not rendering, ensure its `type` matches a registered frontend component and that its JSONB content is valid.
- If admin FABs or edit controls are missing, verify you are logged in as an admin and have the correct permissions.
- For media issues, check that `gallery_data` and `media_items` are correctly linked and that Cloudinary credentials are valid.
- For access issues, review RLS policies and frontend access checks for the relevant page type.

---

## 7. Extending the System

- **To add a new section/component type:**
  1. Create a new React component in the frontend for the section type.
  2. Register the new section type in the section/component registry.
  3. Update the admin section editor to support the new type and its properties.
  4. No backend schema changes are needed unless you want to enforce specific structure in the JSONB content.
- **To add a new page type:**
  - For system/root pages, add a new `page_slug` and sections to `root_page_components`.
  - For custom pages, create a new entry in `custom_pages` and add sections to `page_content`.

---

## 8. Schema Reference

- **`root_page_components`**: `id`, `page_slug`, `component_type`, `content` (JSONB), `is_active`, `created_at`, `updated_at`, `created_by`, `updated_by`
- **`custom_pages`**: `id`, `slug`, `title`, `access_type`, `is_published`, `created_at`, `updated_at`, `created_by`, `updated_by`
- **`page_content`**: `id`, `page_id`, `page_slug`, `section_type`, `content` (JSONB), `sort_order`, `is_published`, `created_at`, `updated_at`, `created_by`
- **`gallery_data`**: `id`, `title`, `type`, `user_id`, `is_published`, `created_at`, `updated_at`, ...
- **`media_items`**: `id`, `title`, `url`, `type`, `created_by`, `created_at`, `updated_at`, ...
- **Other tables:** `contact_submissions`, `comments`, `membership_benefits`, etc. as needed for specific sections.

---

## 9. FAQ

**Q: Why is a section not showing up on a page?**  
A: Check that the section exists in the correct table (`root_page_components` for system/root pages, `page_content` for custom pages), that its `is_active` or `is_published` flag is true, and that its `type` matches a registered frontend component.

---

**Q: Why can't I see the admin edit controls (FABs) on a page?**  
A: Make sure you are logged in as an admin user. If you are, check that your session is valid and that your user has the correct role in the database.

---

**Q: How do I add a new section/component type?**  
A:  
1. Create a new React component for the section in the frontend.  
2. Register the new type in the section/component registry.  
3. Update the admin editor to support the new type's properties.  
4. No backend schema changes are needed unless you want to enforce structure in the JSONB content.

---

**Q: How do I make a page public, premium, or admin-only?**  
A:  
- For system/root pages, access is determined by the page type and enforced by RLS and frontend checks.
- For custom pages, set the `access_type` field in `custom_pages` to `public` or `premium` when creating the page.

---

**Q: Why is media not displaying or uploading?**  
A:  
- Check that your Cloudinary credentials are correct in `.env.local`.
- Ensure the `gallery_data` and `media_items` tables are correctly linked.
- Make sure the media file type is supported and the upload preset (if used) is valid.

---

**Q: How do I reorder sections on a page?**  
A:  
- Use the drag-and-drop or up/down controls in the admin editor.  
- The new order is saved in the `sort_order` field for each section.

---

**Q: Why are comments or contact form submissions not appearing?**  
A:  
- Check the `comments` or `contact_submissions` tables for new entries.
- Ensure the relevant section/component is present and published on the page.
- For comments, check moderation/approval status if enabled.

---

**Q: How do I troubleshoot access or permission errors?**  
A:  
- Review RLS policies for the relevant table.
- Check your user's role and membership type in the `profiles` table.
- Make sure you are logged in and your session is valid.

---

**Q: Where can I find more help or report a bug?**  
A:  
- Check the main [README.md](./README.md) and this guide.
- See [`supabase/SETUP_README.md`](./supabase/SETUP_README.md) for database setup.
- Open an issue on [GitHub](https://github.com/jamescroanin/fluxedita/issues).

---

This guide should help you and future users understand, extend, and troubleshoot the editable pages and section components system. If you add new section types or pages, please update this guide accordingly.

### Profiles Table

- The `profiles` table now includes a `role` column (`TEXT`, default `'user'`).
- Use `role = 'admin'` to grant admin privileges.
- `membership_type` is used for subscription tier (`'basic'`, `'premium'`, etc.), not for admin logic.

### Admin Access

- All admin access is now enforced via the `role` column in `profiles`, checked by the `is_admin()` Postgres function.
- RLS policies reference `public.is_admin()` for admin checks.

### Gallery Structure

- The `media_sets` table is not used. All gallery sets/pages are stored in `gallery_data`.
- All media (images/videos) are stored in `media_items`.