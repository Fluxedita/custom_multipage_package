# Editable Section Component Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Current Implementation Status](#current-implementation-status)
3. [Component Architecture](#component-architecture)
4. [Creating New Section Components](#creating-new-section-components)
5. [Text Styling Integration](#text-styling-integration)
6. [Media Library Integration](#media-library-integration)
7. [Component Registration](#component-registration)
8. [Best Practices](#best-practices)
9. [Component Reference](#component-reference)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

The editable section component system allows users to create dynamic, customizable pages through a visual editor. Each section is a self-contained component that can be added, edited, and managed through the Page Controls sidebar.

### Key Concepts

- **Section Components**: Individual UI components that represent different content types (text, media, features, etc.)
- **Page Controls**: Sidebar interface for managing sections and page properties
- **TextStyleEditor**: Unified text styling system for consistent typography
- **MediaLibrary**: Centralized media management for images and videos
- **Edit Mode**: Toggle between view and edit states for content management

### File Structure

```
app/custom_pages/
├── components/
│   ├── sections/           # Section component library
│   │   ├── index.ts        # Component exports
│   │   ├── TextStyleEditor.tsx
│   │   ├── HeroSection.tsx
│   │   ├── TextSection.tsx
│   │   └── ...
│   └── PageControls.tsx    # Sidebar management
├── types/
│   └── sections.ts         # TypeScript definitions
└── [slug]/
    └── CustomPageClient.tsx # Main page editor
```

---

## Current Implementation Status

For a comprehensive audit of all implemented sections across all page types, see **[SECTION_AUDIT_REPORT.md](./SECTION_AUDIT_REPORT.md)**.

### Quick Summary
- **Total Section Types**: 23
- **Page Coverage**: All root pages (home, about, products, custom pages) have complete section support
- **Status**: ✅ **EXCELLENT** - All sections are fully implemented and working

### Available Section Types
1. **hero** - Hero Section
2. **hero-responsive** - Hero Section (Responsive)
3. **text** - Text Section
4. **content** - Content Section
5. **media-text-left** - Media/Text (Left)
6. **media-text-right** - Media/Text (Right)
7. **divider** - Divider
8. **heading** - Heading
9. **quote** - Quote
10. **cta** - Call-to-Action
11. **gallery** - Image Gallery
12. **mediaTextColumns** - Media/Text Columns
13. **twoColumnText** - Two Column Text
14. **feature** - Feature Section
15. **slider** - Slider Section
16. **feature-card-grid** - Feature Card Grid
17. **advanced-slider** - Advanced Slider Section
18. **info-card** - Info Card Grid
19. **privacy** - Privacy Section
20. **custom-code** - Custom Code Section
21. **contact-form** - Contact Form Section
22. **fluxedita_advanced_form** - Fluxedita Advanced Form
23. **footer** - Footer Section

### Page Controls System
- **PageControlsFab**: All 23 section types available
- **PageControls**: All 23 section types with customization system
- **Default Sections**: 9 most commonly used sections enabled by default
- **User Customization**: Checkbox interface to enable/disable sections
- **Persistence**: User preferences saved to localStorage

---

## Component Architecture

### Base Section Interface

All section components extend the `BaseSection` interface:

```typescript
export interface BaseSection {
  id: string;
  type: SectionType;
  visible: boolean;
  enableSpeech: boolean;
}
```

### Component Props Pattern

Section components follow a consistent props pattern:

```typescript
interface SectionComponentProps {
  section: SectionType;
  isEditMode: boolean;
  onSectionChange: (section: SectionType) => void;
  speakText: (text: string) => void;
  // Optional props for media sections
  onMediaSelect?: () => void;
}
```

### Edit Mode Pattern

Components render differently based on `isEditMode`:

```typescript
export function MySection({ section, isEditMode, onSectionChange }: MySectionProps) {
  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Edit controls */}
      </div>
    );
  }

  return (
    <div className="section-content">
      {/* View mode */}
    </div>
  );
}
```

---

## Creating New Section Components

### Step 1: Define the Type

Add your section type to `app/custom_pages/types/sections.ts`:

```typescript
// Add to SectionType union
export type SectionType = 
  | 'hero'
  | 'text'
  | 'my-new-section'  // Add your type here
  | // ... other types

// Define the interface
export interface MyNewSection extends BaseSection {
  type: 'my-new-section';
  title: string;
  content: string;
  // Add your properties
  textStyle?: TextStyle;
}
```

### Step 2: Create the Component

Create `app/custom_pages/components/sections/MyNewSection.tsx`:

```typescript
import { MyNewSection as MyNewSectionType } from '../../types/sections';
import { TextStyleEditor, TextStyle } from './TextStyleEditor';

interface MyNewSectionProps {
  section: MyNewSectionType;
  isEditMode: boolean;
  onSectionChange: (section: MyNewSectionType) => void;
  speakText: (text: string) => void;
}

export function MyNewSection({ 
  section, 
  isEditMode, 
  onSectionChange, 
  speakText 
}: MyNewSectionProps) {
  const handleTitleChange = (title: string) => {
    onSectionChange({ ...section, title });
  };

  const handleContentChange = (content: string) => {
    onSectionChange({ ...section, content });
  };

  const handleTextStyleChange = (style: TextStyle) => {
    onSectionChange({ 
      ...section, 
      textStyle: { ...section.textStyle, ...style } 
    });
  };

  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={section.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Section Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={section.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={4}
              placeholder="Enter content"
            />
            <TextStyleEditor
              value={section.textStyle || {}}
              onChange={handleTextStyleChange}
              label="Text Style"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-section">
      <h2 style={textStyleToCSS(section.textStyle)}>{section.title}</h2>
      <p style={textStyleToCSS(section.textStyle)}>{section.content}</p>
    </div>
  );
}
```

### Step 3: Export the Component

Add to `app/custom_pages/components/sections/index.ts`:

```typescript
export { MyNewSection } from './MyNewSection';
```

### Step 4: Add to Page Controls

Add to `app/custom_pages/components/PageControls.tsx`:

```typescript
const sectionTypes = [
  // ... existing types
  { type: 'my-new-section', label: 'My New Section', icon: YourIcon },
];
```

### Step 5: Add to CustomPageClient

Add to `app/custom_pages/[slug]/CustomPageClient.tsx`:

```typescript
// In createDefaultSection function
case 'my-new-section':
  return {
    ...baseSection,
    type: 'my-new-section',
    title: 'New Section',
    content: 'Default content',
    textStyle: {},
    enableSpeech: false,
    visible: true
  };

// In renderSection function
case 'my-new-section':
  sectionComponent = (
    <div className="relative group">
      <MyNewSection
        section={section as MyNewSectionType}
        isEditMode={baseProps.isEditMode}
        onSectionChange={handleSectionChange}
        speakText={baseProps.speakText}
      />
      {baseProps.isEditMode && (
        <div className="absolute top-2 right-2 z-10">
          {renderSectionControls(section.id)}
        </div>
      )}
    </div>
  );
  break;
```

---

## Text Styling Integration

### Using TextStyleEditor

The `TextStyleEditor` component provides consistent text styling across all sections:

```typescript
import { TextStyleEditor, TextStyle, textStyleToCSS } from './TextStyleEditor';

// In your component
const handleTextStyleChange = (style: TextStyle) => {
  onSectionChange({ 
    ...section, 
    textStyle: { ...section.textStyle, ...style } 
  });
};

// In edit mode
<TextStyleEditor
  value={section.textStyle || {}}
  onChange={handleTextStyleChange}
  label="Text Style"
/>

// In view mode
<span style={textStyleToCSS(section.textStyle)}>
  {section.content}
</span>
```

### TextStyle Properties

```typescript
interface TextStyle {
  fontStyle?: 'normal' | 'italic' | 'bold';
  fontColor?: string;
  fontSize?: string;
  textShadow?: {
    color: string;
    offsetX: string;
    offsetY: string;
    blur: string;
  };
  textOutline?: {
    color: string;
    width: string;
  };
  textBackground?: {
    color: string;
    opacity: number;
    blur: string;
    borderRadius: string;
    padding: string;
  };
}
```

### CSS Conversion

Use `textStyleToCSS()` to convert TextStyle to CSS properties:

```typescript
const cssStyle = textStyleToCSS(section.textStyle);
// Returns: { color: '#333', fontSize: '16px', ... }
```

---

## Media Library Integration

### Adding Media Upload to Sections

For sections that need media upload functionality:

```typescript
interface MyMediaSectionProps {
  section: MyMediaSectionType;
  isEditMode: boolean;
  onSectionChange: (section: MyMediaSectionType) => void;
  speakText: (text: string) => void;
  onMediaSelect: () => void; // Add this prop
}

export function MyMediaSection({ 
  section, 
  isEditMode, 
  onSectionChange, 
  speakText,
  onMediaSelect 
}: MyMediaSectionProps) {
  const handleMediaChange = (mediaUrl: string, mediaType: 'image' | 'video') => {
    onSectionChange({ ...section, mediaUrl, mediaType });
  };

  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Media</label>
            <div className="mt-1 flex items-center space-x-4">
              {section.mediaUrl ? (
                <div className="relative w-24 h-24">
                  {section.mediaType === 'video' ? (
                    <video
                      src={section.mediaUrl}
                      className="w-full h-full object-cover rounded"
                      controls
                    />
                  ) : (
                    <img
                      src={section.mediaUrl}
                      alt="Media"
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                  <button
                    onClick={() => handleMediaChange('', 'image')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onMediaSelect}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Media
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-media-section">
      {section.mediaUrl && (
        <div className="relative aspect-video">
          {section.mediaType === 'video' ? (
            <video
              src={section.mediaUrl}
              className="w-full h-full object-cover rounded-lg"
              controls
            />
          ) : (
            <img
              src={section.mediaUrl}
              alt="Media"
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
      )}
    </div>
  );
}
```

### Media Dialog Integration

In `CustomPageClient.tsx`, add media dialog support:

```typescript
// Add state for media dialog
const [mediaDialogIdx, setMediaDialogIdx] = useState<number | null>(null);

// In your section case
case 'my-media-section':
  sectionComponent = (
    <div className="relative group">
      <MyMediaSection
        section={section as MyMediaSectionType}
        isEditMode={baseProps.isEditMode}
        onSectionChange={handleSectionChange}
        speakText={baseProps.speakText}
        onMediaSelect={() => setMediaDialogIdx(idx)}
      />
      {baseProps.isEditMode && (
        <div className="absolute top-2 right-2 z-10">
          {renderSectionControls(section.id)}
        </div>
      )}
    </div>
  );
  break;

// Add MediaLibrary dialog
{mediaDialogIdx !== null && (
  <MediaLibrary
    isDialog
    type="all"
    onCloseAction={() => setMediaDialogIdx(null)}
    onSelectAction={(url, type) => {
      setSections(prev => {
        const newSections = [...prev];
        if (newSections[mediaDialogIdx] && newSections[mediaDialogIdx].type === 'my-media-section') {
          newSections[mediaDialogIdx] = {
            ...newSections[mediaDialogIdx],
            mediaUrl: url,
            mediaType: (type === 'image' || type === 'video') ? type : 'image',
          };
        }
        return newSections;
      });
      setIsDirty(true);
      setMediaDialogIdx(null);
    }}
  />
)}
```

---

## Component Registration

### Adding to Page Controls Sidebar

1. **Add to sectionTypes array** in `PageControls.tsx`:
```typescript
const sectionTypes = [
  // ... existing types
  { type: 'my-new-section', label: 'My New Section', icon: YourIcon },
];
```

2. **Add to default enabled sections** (optional):
```typescript
const defaultEnabledSections = [
  'hero', 'hero-responsive', 'text', 'feature', 'cta', 'gallery', 'slider', 'divider', 'info-card', 'my-new-section'
];
```

**Note**: The PageControls now includes a customization system where users can enable/disable sections. New sections are automatically available in the customization panel, and you can choose whether to include them in the default enabled sections.

### Adding to CustomPageClient

1. **Add to createDefaultSection function**:
```typescript
case 'my-new-section':
  return {
    ...baseSection,
    type: 'my-new-section',
    // ... default properties
  };
```

2. **Add to renderSection function**:
```typescript
case 'my-new-section':
  sectionComponent = (
    <div className="relative group">
      <MyNewSection
        section={section as MyNewSectionType}
        isEditMode={baseProps.isEditMode}
        onSectionChange={handleSectionChange}
        speakText={baseProps.speakText}
      />
      {baseProps.isEditMode && (
        <div className="absolute top-2 right-2 z-10">
          {renderSectionControls(section.id)}
        </div>
      )}
    </div>
  );
  break;
```

---

## Best Practices

### 1. Component Structure

- **Consistent Props**: Always use the standard props pattern
- **Edit Mode Toggle**: Always render differently for edit vs view modes
- **Error Handling**: Include proper error boundaries and fallbacks
- **Accessibility**: Include proper ARIA labels and keyboard navigation

### 2. Styling

- **Consistent Classes**: Use the established CSS class patterns
- **Responsive Design**: Ensure components work on all screen sizes
- **Theme Support**: Use CSS variables for theming
- **Performance**: Optimize for rendering performance

### 3. State Management

- **Immutable Updates**: Always create new objects when updating state
- **Debounced Updates**: Use debouncing for frequent updates
- **Validation**: Validate data before saving
- **Error Recovery**: Provide ways to recover from errors

### 4. Media Handling

- **Type Safety**: Always specify media types (image/video)
- **Fallbacks**: Provide fallback content for missing media
- **Optimization**: Use appropriate image sizes and formats
- **Loading States**: Show loading indicators for media

### 5. Text Styling

- **Consistent API**: Use TextStyleEditor for all text styling
- **CSS Conversion**: Use textStyleToCSS for view mode
- **Default Values**: Provide sensible defaults for text styles
- **Validation**: Validate CSS values before applying

---

## Component Reference

### Summary Table of All Editable Page Components

| Section Component         | Type | In Sidebar | TextStyleEditor | Add Media Dialog | Description |
|--------------------------|------|:----------:|:---------------:|:----------------:|-------------|
| HeroSection              | hero | Yes        | Yes             | Yes              | Full-width hero with background media |
| HeroSectionResponsive    | hero-responsive | Yes | Yes             | Yes              | Responsive hero with flexible layout |
| SliderSection            | slider | Yes      | Yes             | Yes              | Image/video carousel with navigation |
| AdvancedSliderSection    | advanced-slider | Yes        | Yes             | Yes              | Advanced slider with custom controls |
| TextSection              | text | Yes        | Yes             | Yes              | Text content with optional media support |
| ContentSection           | content | Yes        | Yes             | No               | Default content section |
| FeatureSection           | feature | Yes        | Yes             | Yes (cards)      | Feature list with icons and descriptions |
| CTASection               | cta | Yes        | Yes             | No               | Call-to-action with buttons |
| GallerySection           | gallery | Yes        | Yes             | Yes              | Image gallery with grid layout |
| DividerSection           | divider | Yes        | No              | No               | Visual separator line |
| InfoCardSection          | info-card | Yes        | Yes             | Yes (cards)      | Card grid with media and text |
| FeatureCardGridSection   | feature-card-grid | Yes        | Yes             | Yes (cards)      | Feature cards in grid layout |
| MediaTextSection         | media-text-left/right | Yes        | Yes             | Yes              | Media with text (left or right) |
| MediaTextColumnsSection  | mediaTextColumns | Yes        | Yes             | Yes              | Media and text in columns |
| TwoColumnTextSection     | twoColumnText | Yes        | Yes             | No               | Two-column text layout |
| QuoteSection             | quote | Yes        | Yes             | No               | Quote with author attribution |
| HeadingSection           | heading | Yes        | Yes             | No               | Standalone heading with styling |
| FooterSection            | footer | Yes        | Yes             | Yes (media col)  | Multi-column footer with content |
| ContactFormSection       | contact-form | Yes        | No              | No               | Contact form with customizable fields |
| FluxeditaAdvancedFormSection | fluxedita_advanced_form | Yes | No              | No               | Advanced contact form with enhanced features |
| PrivacySection           | privacy | Yes        | Yes             | No               | Privacy policy content section |
| CustomCodeSection        | custom-code | Yes        | No              | No               | Custom HTML/CSS/JS code injection |

### Component Details

#### HeroSection
- **Purpose**: Full-width hero area with background media
- **Key Features**: Background image/video, overlay text, CTA buttons
- **Media Support**: Background images and videos
- **Text Styling**: Title and description with full TextStyleEditor support

#### TextSection
- **Purpose**: Simple text content with styling
- **Key Features**: Rich text editing, alignment, font styling
- **Media Support**: None
- **Text Styling**: Full TextStyleEditor integration

#### MediaTextSection
- **Purpose**: Media with accompanying text
- **Key Features**: Left/right media positioning, title/description
- **Media Support**: Images and videos with media dialog
- **Text Styling**: Separate styling for title and description

#### FeatureSection
- **Purpose**: Feature list with icons and descriptions
- **Key Features**: Grid/list layout, feature cards, icons
- **Media Support**: Feature card images
- **Text Styling**: Title, description, and feature text styling

#### SliderSection
- **Purpose**: Image/video carousel
- **Key Features**: Navigation, pagination, autoplay, effects
- **Media Support**: Slide images and videos
- **Text Styling**: Slide title and description styling

---

## Troubleshooting

### Common Issues

#### 1. Component Not Appearing in Sidebar
- **Check**: Component is exported in `index.ts`
- **Check**: Component is added to `sectionTypes` in `PageControls.tsx`
- **Check**: Component is enabled in default sections list

#### 2. Text Styling Not Working
- **Check**: TextStyleEditor is properly imported and used
- **Check**: textStyleToCSS is used in view mode
- **Check**: textStyle property is included in section interface

#### 3. Media Upload Not Working
- **Check**: onMediaSelect prop is passed to component
- **Check**: MediaLibrary dialog is added to CustomPageClient
- **Check**: mediaDialogIdx state is properly managed

#### 4. TypeScript Errors
- **Check**: Section type is added to SectionType union
- **Check**: Section interface extends BaseSection
- **Check**: Section is added to Section union type

#### 5. Edit Mode Not Working
- **Check**: isEditMode prop is passed correctly
- **Check**: Component renders different content for edit mode
- **Check**: onSectionChange is called with updated section

### Debugging Tips

1. **Console Logging**: Add console.log to track state changes
2. **React DevTools**: Use React DevTools to inspect component state
3. **Type Checking**: Enable strict TypeScript checking
4. **Error Boundaries**: Wrap components in error boundaries
5. **Performance**: Use React.memo for expensive components

### Performance Optimization

1. **Memoization**: Use React.memo for components that don't need frequent updates
2. **Debouncing**: Debounce frequent state updates
3. **Lazy Loading**: Lazy load heavy components
4. **Image Optimization**: Use appropriate image sizes and formats
5. **Bundle Splitting**: Split large components into smaller chunks

---

## Real-World Example: Adding Media Support to TextSection

This section demonstrates a practical example of extending an existing component with new functionality, specifically adding media support to the TextSection component.

### Problem Statement

The TextSection component originally only supported text content with styling. We needed to add media support (images/videos) with flexible positioning (top, bottom, left, right) while maintaining backward compatibility.

### Implementation Steps

#### 1. Extend the Type Definition

First, we extended the TextSection interface to include optional media properties:

```typescript
// In app/custom_pages/types/sections.ts
export interface TextSection extends BaseSection {
  type: 'text';
  content: string;
  textStyle: TextStyle;
  // New media properties
  media?: {
    type: 'image' | 'video';
    url: string;
    alt?: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    size: 'small' | 'medium' | 'large';
  };
}
```

#### 2. Update the Component

We enhanced the TextSection component to include media upload controls and preview:

```typescript
// In app/custom_pages/components/sections/TextSection.tsx
interface TextSectionProps {
  section: TextSection;
  isEditMode: boolean;
  onSectionChange: (section: TextSection) => void;
  speakText?: (text: string) => void;
  onMediaSelect?: (media: MediaItem) => void; // New prop
}

export default function TextSection({ 
  section, 
  isEditMode, 
  onSectionChange, 
  speakText,
  onMediaSelect 
}: TextSectionProps) {
  // ... existing code ...

  // Add media controls in edit mode
  const renderMediaControls = () => {
    if (!isEditMode) return null;
    
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Media</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMediaSelect?.(section.media as MediaItem)}
          >
            {section.media ? 'Change Media' : 'Add Media'}
          </Button>
        </div>
        
        {section.media && (
          <div className="space-y-3">
            {/* Media preview */}
            <div className="relative">
              {section.media.type === 'image' ? (
                <img
                  src={section.media.url}
                  alt={section.media.alt || 'Section media'}
                  className="w-full h-32 object-cover rounded"
                />
              ) : (
                <video
                  src={section.media.url}
                  className="w-full h-32 object-cover rounded"
                  controls
                />
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleMediaChange(null)}
              >
                Remove
              </Button>
            </div>
            
            {/* Position and size controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Position</Label>
                <Select
                  value={section.media.position}
                  onValueChange={(value) => handleMediaChange({
                    ...section.media,
                    position: value as 'top' | 'bottom' | 'left' | 'right'
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Size</Label>
                <Select
                  value={section.media.size}
                  onValueChange={(value) => handleMediaChange({
                    ...section.media,
                    size: value as 'small' | 'medium' | 'large'
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
}
```

#### 3. Update View Mode Rendering

We modified the view mode to render media with flexible positioning:

```typescript
// In the view mode section
const renderContent = () => {
  const textContent = (
    <div 
      className="prose max-w-none"
      style={textStyleToCSS(section.textStyle)}
      dangerouslySetInnerHTML={{ __html: section.content }}
    />
  );

  if (!section.media) {
    return textContent;
  }

  const mediaElement = section.media.type === 'image' ? (
    <img
      src={section.media.url}
      alt={section.media.alt || 'Section media'}
      className={`object-cover rounded-lg ${
        section.media.size === 'small' ? 'w-32 h-32' :
        section.media.size === 'medium' ? 'w-48 h-48' :
        'w-64 h-64'
      }`}
    />
  ) : (
    <video
      src={section.media.url}
      className={`object-cover rounded-lg ${
        section.media.size === 'small' ? 'w-32 h-32' :
        section.media.size === 'medium' ? 'w-48 h-48' :
        'w-64 h-64'
      }`}
      controls
    />
  );

  // Render based on position
  switch (section.media.position) {
    case 'top':
      return (
        <div className="space-y-4">
          {mediaElement}
          {textContent}
        </div>
      );
    case 'bottom':
      return (
        <div className="space-y-4">
          {textContent}
          {mediaElement}
        </div>
      );
    case 'left':
      return (
        <div className="flex gap-6 items-start">
          {mediaElement}
          <div className="flex-1">{textContent}</div>
        </div>
      );
    case 'right':
      return (
        <div className="flex gap-6 items-start">
          <div className="flex-1">{textContent}</div>
          {mediaElement}
        </div>
      );
    default:
      return textContent;
  }
};
```

#### 4. Update CustomPageClient

We ensured the TextSection receives the onMediaSelect prop and can handle media selection:

```typescript
// In app/custom_pages/[slug]/CustomPageClient.tsx
case 'text':
  sectionComponent = (
    <div className="relative group">
      <TextSection
        section={section as TextSection}
        isEditMode={baseProps.isEditMode}
        onSectionChange={handleSectionChange}
        speakText={baseProps.speakText}
        onMediaSelect={(media) => {
          setMediaDialogIdx(section.id);
          setSelectedMedia(media);
        }}
      />
      {baseProps.isEditMode && (
        <div className="absolute top-2 right-2 z-10">
          {renderSectionControls(section.id)}
        </div>
      )}
    </div>
  );
  break;
```

### Key Benefits of This Implementation

1. **Backward Compatibility**: Existing TextSection instances continue to work without media
2. **Flexible Positioning**: Media can be positioned top, bottom, left, or right relative to text
3. **Size Control**: Three size options (small, medium, large) for different use cases
4. **Seamless Integration**: Uses existing MediaLibrary dialog and onMediaSelect pattern
5. **Type Safety**: Full TypeScript support with proper interfaces
6. **User-Friendly**: Intuitive controls for adding, changing, and removing media

### Usage Examples

```typescript
// Text-only section (existing functionality)
const textOnlySection: TextSection = {
  id: '1',
  type: 'text',
  content: '<p>This is a text-only section.</p>',
  textStyle: defaultTextStyle,
};

// Text with media section (new functionality)
const textWithMediaSection: TextSection = {
  id: '2',
  type: 'text',
  content: '<p>This section has both text and media.</p>',
  textStyle: defaultTextStyle,
  media: {
    type: 'image',
    url: '/path/to/image.jpg',
    alt: 'Description',
    position: 'right',
    size: 'medium'
  }
};
```

This example demonstrates how to extend existing components while maintaining the established patterns and ensuring a smooth user experience.

---

## Conclusion

This guide provides a comprehensive overview of the editable section component system. By following these patterns and best practices, developers can create consistent, maintainable, and user-friendly section components that integrate seamlessly with the existing system.

### Related Documentation

- **[SECTION_AUDIT_REPORT.md](./SECTION_AUDIT_REPORT.md)** - Comprehensive audit of all implemented sections across all page types
- **[CUSTOM_CODE_GUIDE.md](./CUSTOM_CODE_GUIDE.md)** - Guide for using the Custom Code Section component
- **[EDITABLE_PAGES_AND_SECTIONS_GUIDE.md](./EDITABLE_PAGES_AND_SECTIONS_GUIDE.md)** - Overview of editable pages and sections system

### Additional Resources

For additional support or questions, refer to:
- Existing component implementations in `app/custom_pages/components/sections/`
- TypeScript definitions in `app/custom_pages/types/sections.ts`
- Page implementation examples in `app/custom_pages/[slug]/CustomPageClient.tsx` 