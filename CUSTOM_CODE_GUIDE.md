# Custom Code Component Guide

## Overview
The Custom Code Component allows you to add custom HTML, CSS, and JavaScript to your pages. **All code must be wrapped in a function that returns JSX.**

## Basic JSX Rules
- Use `className` instead of `class`
- Use `style={{}}` for inline styles
- All attributes should be camelCase (e.g., `frameBorder`, `allowFullScreen`)
- Always return JSX from a function

## Examples

### 1. Adding a Heading

**Basic Heading:**
```jsx
() => <h1>This is a heading</h1>
```

**Styled Heading with Tailwind CSS:**
```jsx
() => (
  <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">
    This is a styled heading
  </h1>
)
```

**Heading with Inline Styles:**
```jsx
() => (
  <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', color: '#2563eb' }}>
    This is a styled heading
  </h1>
)
```

### 2. Adding a Paragraph

**Basic Paragraph:**
```jsx
() => <p>This is a paragraph of text.</p>
```

**Styled Paragraph:**
```jsx
() => (
  <p className="text-lg leading-relaxed text-gray-700 mb-4">
    This is a styled paragraph with proper spacing and typography.
  </p>
)
```

**Multiple Paragraphs:**
```jsx
() => (
  <div>
    <p className="mb-4">First paragraph with margin bottom.</p>
    <p className="text-gray-600">Second paragraph with different styling.</p>
  </div>
)
```

### 3. Adding an Image

**Basic Image:**
```jsx
() => <img src="/path/to/image.jpg" alt="Description" />
```

**Responsive Image with Styling:**
```jsx
() => (
  <img 
    src="/path/to/image.jpg" 
    alt="Description"
    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
  />
)
```

**Image with Inline Styles:**
```jsx
() => (
  <img 
    src="/path/to/image.jpg" 
    alt="Description"
    style={{ 
      width: '100%', 
      maxWidth: '400px', 
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}
  />
)
```

### 4. Adding a Video (YouTube, Vimeo, etc.)

**YouTube Video:**
```jsx
() => (
  <div className="flex justify-center">
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/d9qINcjWdd0?si=Me0_5bHJgD1HxyoV"
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  </div>
)
```

**Responsive Video Container:**
```jsx
() => (
  <div className="relative w-full max-w-4xl mx-auto">
    <div className="relative pb-[56.25%] h-0">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src="https://www.youtube.com/embed/d9qINcjWdd0?si=Me0_5bHJgD1HxyoV"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  </div>
)
```

**Vimeo Video:**
```jsx
() => (
  <div className="flex justify-center">
    <iframe
      src="https://player.vimeo.com/video/123456789"
      width="640"
      height="360"
      frameBorder="0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  </div>
)
```

### 5. Adding Custom Page Section Snippets

**Card Layout:**
```jsx
() => (
  <div className="bg-white rounded-lg shadow-md p-6 max-w-sm mx-auto">
    <h2 className="text-xl font-semibold mb-3">Card Title</h2>
    <p className="text-gray-600 mb-4">This is a card description with some content.</p>
    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      Click Me
    </button>
  </div>
)
```

**Feature Grid:**
```jsx
() => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
    <div className="text-center p-6">
      <div className="text-4xl mb-4">🚀</div>
      <h3 className="text-lg font-semibold mb-2">Feature 1</h3>
      <p className="text-gray-600">Description of feature 1</p>
    </div>
    <div className="text-center p-6">
      <div className="text-4xl mb-4">⚡</div>
      <h3 className="text-lg font-semibold mb-2">Feature 2</h3>
      <p className="text-gray-600">Description of feature 2</p>
    </div>
    <div className="text-center p-6">
      <div className="text-4xl mb-4">🎯</div>
      <h3 className="text-lg font-semibold mb-2">Feature 3</h3>
      <p className="text-gray-600">Description of feature 3</p>
    </div>
  </div>
)
```

**Hero Section:**
```jsx
() => (
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        Welcome to Our Platform
      </h1>
      <p className="text-xl mb-8 opacity-90">
        Discover amazing features and possibilities
      </p>
      <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100">
        Get Started
      </button>
    </div>
  </div>
)
```

## Common Patterns

### Multiple Elements
```jsx
() => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Main Title</h1>
    <p className="text-lg">Introduction paragraph</p>
    <img src="/image.jpg" alt="Description" className="rounded-lg" />
    <p className="text-gray-600">Conclusion paragraph</p>
  </div>
)
```

### Conditional Rendering
```jsx
() => {
  const showImage = true;
  return (
    <div>
      <h2>Conditional Content</h2>
      {showImage && (
        <img src="/image.jpg" alt="Conditional image" />
      )}
    </div>
  );
}
```

### Using Variables
```jsx
() => {
  const title = "Dynamic Title";
  const description = "This content can be dynamic";
  
  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
```

## Troubleshooting

### Common Errors:
1. **Missing function wrapper**: Always wrap your JSX in `() =>`
2. **Using `class` instead of `className`**: Use `className` for CSS classes
3. **Missing closing tags**: Ensure all JSX elements are properly closed
4. **Invalid attributes**: Use camelCase for all attributes

### Best Practices:
- Use Tailwind CSS classes for styling when possible
- Keep your code readable with proper indentation
- Test your code in the editor before saving
- Use semantic HTML elements (`<section>`, `<article>`, `<header>`, etc.)

## Need Help?
If you encounter issues with your custom code, check:
1. JavaScript console for errors
2. That all JSX is properly wrapped in a function
3. That all attributes use the correct JSX syntax
4. That your code returns valid JSX 