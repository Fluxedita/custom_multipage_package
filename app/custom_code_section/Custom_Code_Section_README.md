# Custom Code Section Guide

## Overview
The **Custom Code Section** allows trusted admin users to insert and edit their own JSX/HTML snippets as dynamic sections in the page builder. This feature is powerful for adding custom layouts, widgets, or interactive content directly from the admin interface.

---

## How to Add a Custom Code Section
1. Open the **Page Controls** sidebar in the admin interface.
2. Scroll to the bottom and find the **"Insert Custom Code Section"** dropdown.
3. Click **"Add Custom Code Section"**.
4. A new section will appear in your page. In edit mode, you'll see a code editor where you can write your JSX/HTML.

---

## Writing Custom JSX/HTML
- Write your code as a function component:
  ```jsx
  () => <div style={{padding: 20, color: '#333'}}>Hello, custom code!</div>
  ```
- You can use any valid JSX, inline styles, and standard React expressions.
- You can use basic JavaScript logic inside the function.

### Example: Button with Click Handler
```jsx
() => {
  const handleClick = () => alert('Button clicked!');
  return <button onClick={handleClick}>Click Me</button>;
}
```

---

## Editing and Saving
- Use the built-in code editor (Monaco) to write or edit your code.
- Changes are previewed live in the section.
- Click **Save** to persist your changes.

---

## Error Handling
- If your code has a syntax error, an error message will be shown instead of the section.
- Fix the error and save again to see your changes.

---

## Security & Best Practices
- **Only trusted admins should use this feature.**
- Do **not** use `window`, `document`, or perform side effects (e.g., network requests) in your code.
- No access to server-side resources or external npm packages.
- All code runs in the browser context.
- Avoid infinite loops or heavy computations.

---

## Advanced Tips
- You can use React hooks (e.g., `useState`, `useEffect`) if you import them at the top of your code (if supported by your setup).
- You can use inline styles or Tailwind classes (if Tailwind is globally available).
- For more complex widgets, consider creating a reusable component and referencing it via a component registry (future enhancement).

---

## Troubleshooting
- **Syntax error:** Check your code for typos or missing brackets.
- **Nothing renders:** Make sure your function returns valid JSX.
- **App crash:** Reload the page and fix your code in the editor.
- **Need help?** Contact your developer team or refer to this guide.

---

## FAQ
**Q: Can I use external libraries?**
A: No, only built-in React and browser APIs are available.

**Q: Is this safe for all users?**
A: No, this feature is for trusted admin use only. Do not enable for untrusted users.

**Q: Can I use TypeScript?**
A: Basic TypeScript syntax is supported, but keep code simple for best results.

---

Happy coding! 