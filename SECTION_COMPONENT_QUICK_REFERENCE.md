# Section Component Quick Reference

## 🚀 Quick Start Checklist

### Creating a New Section Component

- [ ] Add type to `SectionType` union in `types/sections.ts`
- [ ] Create interface extending `BaseSection` in `types/sections.ts`
- [ ] Add interface to `Section` union type in `types/sections.ts`
- [ ] Create component file in `components/sections/`
- [ ] Export component in `components/sections/index.ts`
- [ ] Add to `sectionTypes` array in `PageControls.tsx`
- [ ] Add to `createDefaultSection` function in `CustomPageClient.tsx`
- [ ] Add case to `renderSection` function in `CustomPageClient.tsx`

Summary: If you add new section components in the future, just ensure they are:
Imported and handled in the page client’s render logic.
Registered in the sectionTypes array in PageControls.tsx.

---

## 📝 Component Template

```typescript
import { MySection as MySectionType } from '../../types/sections';
import { TextStyleEditor, TextStyle, textStyleToCSS } from './TextStyleEditor';

interface MySectionProps {
  section: MySectionType;
  isEditMode: boolean;
  onSectionChange: (section: MySectionType) => void;
  speakText: (text: string) => void;
  onMediaSelect?: () => void; // If media support needed
}

export function MySection({ 
  section, 
  isEditMode, 
  onSectionChange, 
  speakText,
  onMediaSelect 
}: MySectionProps) {
  // Handler functions
  const handleTitleChange = (title: string) => {
    onSectionChange({ ...section, title });
  };

  const handleTextStyleChange = (style: TextStyle) => {
    onSectionChange({ 
      ...section, 
      textStyle: { ...section.textStyle, ...style } 
    });
  };

  // Edit mode
  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Edit controls */}
          <TextStyleEditor
            value={section.textStyle || {}}
            onChange={handleTextStyleChange}
            label="Text Style"
          />
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div className="my-section">
      <h2 style={textStyleToCSS(section.textStyle)}>{section.title}</h2>
    </div>
  );
}
```

---

## 🎨 Text Styling Integration

### Required Imports
```typescript
import { TextStyleEditor, TextStyle, textStyleToCSS } from './TextStyleEditor';
```

### In Edit Mode
```typescript
<TextStyleEditor
  value={section.textStyle || {}}
  onChange={handleTextStyleChange}
  label="Text Style"
/>
```

### In View Mode
```typescript
<span style={textStyleToCSS(section.textStyle)}>
  {section.content}
</span>
```

---

## 🖼️ Media Library Integration

### Add Media Support
```typescript
// In props interface
onMediaSelect?: () => void;

// In edit mode
<button onClick={onMediaSelect}>
  Add Media
</button>

// In CustomPageClient.tsx
onMediaSelect={() => setMediaDialogIdx(idx)}
```

### Media Dialog Setup
```typescript
// Add state
const [mediaDialogIdx, setMediaDialogIdx] = useState<number | null>(null);

// Add dialog
{mediaDialogIdx !== null && (
  <MediaLibrary
    isDialog
    type="all"
    onCloseAction={() => setMediaDialogIdx(null)}
    onSelectAction={(url, type) => {
      // Handle media selection
      setMediaDialogIdx(null);
    }}
  />
)}
```

---

## 📋 Available Section Types

| Type | Component | Media | Text Styling | Description |
|------|-----------|-------|--------------|-------------|
| `hero` | HeroSection | ✅ | ✅ | Full-width hero with background |
| `text` | TextSection | ❌ | ✅ | Simple text content |
| `content` | ContentSection | ❌ | ✅ | Default content section |
| `media-text-left` | MediaTextSection | ✅ | ✅ | Media with left text |
| `media-text-right` | MediaTextSection | ✅ | ✅ | Media with right text |
| `mediaTextColumns` | MediaTextColumnsSection | ✅ | ✅ | Media and text columns |
| `feature` | FeatureSection | ✅ | ✅ | Feature list with icons |
| `feature-card-grid` | FeatureCardGridSection | ✅ | ✅ | Feature cards grid |
| `info-card` | InfoCardSection | ✅ | ✅ | Info cards with media |
| `slider` | SliderSection | ✅ | ✅ | Image/video carousel |
| `advanced-slider` | AdvancedSliderSection | ✅ | ✅ | Advanced slider |
| `gallery` | GallerySection | ✅ | ✅ | Image gallery grid |
| `cta` | CTASection | ❌ | ✅ | Call-to-action section |
| `quote` | QuoteSection | ❌ | ✅ | Quote with author |
| `heading` | HeadingSection | ❌ | ✅ | Standalone heading |
| `twoColumnText` | TwoColumnTextSection | ❌ | ✅ | Two-column text |
| `divider` | DividerSection | ❌ | ❌ | Visual separator |
| `footer` | FooterSection | ✅ | ✅ | Multi-column footer |

---

## 🔧 Common Patterns

### State Update Pattern
```typescript
const handleChange = (newValue: string) => {
  onSectionChange({ ...section, property: newValue });
};
```

### Text Style Update Pattern
```typescript
const handleTextStyleChange = (style: TextStyle) => {
  onSectionChange({ 
    ...section, 
    textStyle: { ...section.textStyle, ...style } 
  });
};
```

### Media Update Pattern
```typescript
const handleMediaChange = (mediaUrl: string, mediaType: 'image' | 'video') => {
  onSectionChange({ ...section, mediaUrl, mediaType });
};
```

---

## 🐛 Troubleshooting

### Component Not in Sidebar
- Check `sectionTypes` array in `PageControls.tsx`
- Check component export in `index.ts`
- Check default enabled sections list

### Text Styling Not Working
- Import `TextStyleEditor` and `textStyleToCSS`
- Use `TextStyleEditor` in edit mode
- Use `textStyleToCSS()` in view mode

### Media Upload Not Working
- Add `onMediaSelect` prop
- Add media dialog to `CustomPageClient.tsx`
- Check `mediaDialogIdx` state management

### TypeScript Errors
- Add type to `SectionType` union
- Add interface to `Section` union
- Check interface extends `BaseSection`

---
#To add a comment section/if you app support this and has been wired

#### Usage Example

To add comments to any page:
```tsx
import CommentsSection from '@/components/CommentsSection'

<CommentsSection 
  title="Your Title"
  description="Your description"
/>
```
### Admin Access

- Admin access is determined by the `role` column in the `profiles` table. Membership is determined by the 'membership_type' column in the 'profiles' table.
- The `is_admin()` function is used in RLS policies to check for admin privileges.

## 📚 Key Files

- **`types/sections.ts`** - TypeScript definitions
- **`components/sections/index.ts`** - Component exports
- **`components/PageControls.tsx`** - Sidebar management
- **`[slug]/CustomPageClient.tsx`** - Main page editor
- **`components/sections/TextStyleEditor.tsx`** - Text styling system

---

## 🎯 Best Practices

1. **Always use the standard props pattern**
2. **Render differently for edit vs view modes**
3. **Use TextStyleEditor for all text styling**
4. **Include proper error handling**
5. **Follow the established CSS class patterns**
6. **Use immutable state updates**
7. **Include accessibility attributes**
8. **Optimize for performance**

---

*For detailed information, see the full [Editable Section Component Guide](./EDITABLE_SECTION_COMPONENT_GUIDE.md)* 