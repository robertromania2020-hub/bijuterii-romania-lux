# Contributing Guide

## 🎯 How to Contribute

Thank you for your interest in contributing to BIJUTERII Romania Lux! This guide will help you get started.

---

## 🚀 Getting Started

### 1. Fork the Repository
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/bijuterii-romania-lux.git
cd bijuterii-romania-lux
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Set Up Development Environment
```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📝 Commit Guidelines

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add product filtering by price range"
git commit -m "Fix cart item quantity calculation bug"
git commit -m "Update Supabase connection string"

# Avoid
git commit -m "fix stuff"
git commit -m "update"
```

---

## 🎨 Code Style

### TypeScript
- Always use type annotations
- Avoid `any` type unless absolutely necessary
- Use interfaces over types when possible

```typescript
// Good
interface Product {
  id: string;
  name: string;
  price: number;
}

// Avoid
const product: any = { ... };
```

### React Components
- Use functional components with hooks
- Prefer descriptive component names
- Keep components small and focused

```typescript
// Good
export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.price} lei</p>
    </div>
  );
}

// Avoid
export const PC = (p: any) => <div>{p.name}</div>;
```

### CSS & Tailwind
- Use Tailwind classes for styling
- Avoid inline styles
- Keep CSS classes organized

```typescript
// Good
<div className="flex items-center gap-4 rounded-lg bg-gray-100 p-4">
  Content
</div>

// Avoid
<div style={{ display: 'flex', gap: '16px', ... }}>
  Content
</div>
```

---

## 🧪 Testing

Before submitting a PR:

```bash
# Check for linting errors
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

---

## 📤 Submitting a Pull Request

1. **Push your changes**
```bash
git push origin feature/your-feature-name
```

2. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

3. **PR Description Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Related Issues
Closes #123

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes
```

---

## ✅ PR Review Checklist

Your PR must meet these requirements:

- [ ] Code follows the style guide
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] TypeScript types are correct
- [ ] Comments explain complex logic
- [ ] Documentation is updated
- [ ] Commit messages are clear

---

## 🐛 Reporting Bugs

### Bug Report Template

**Title**: Short, descriptive summary

**Description**:
- What is the bug?
- When does it occur?
- What should happen instead?

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Expected result vs actual result

**Environment**:
- Browser: Chrome, Firefox, Safari, Edge
- OS: Windows, macOS, Linux
- Device: Desktop, Mobile

**Screenshots**:
Attach screenshots if applicable

---

## 💡 Feature Requests

### Feature Request Template

**Title**: Brief description of feature

**Problem**:
What problem does this solve?

**Solution**:
How should it work?

**Use Case**:
Who would benefit from this?

**Examples**:
Any reference implementations or mockups?

---

## 📚 Documentation

When contributing code:

1. **Update README.md** if needed
2. **Add code comments** for complex logic
3. **Update ARCHITECTURE.md** if changing architecture
4. **Add JSDoc** to exported functions

```typescript
/**
 * Calculates the total price of cart items including tax and shipping
 * @param items - Array of cart items
 * @param shippingCost - Shipping cost in lei
 * @returns Total price in lei
 */
export function calculateTotal(items: CartItem[], shippingCost: number): number {
  // implementation
}
```

---

## 🌐 Internationalization (i18n)

All user-facing text must be in **Romanian**:

```typescript
// Good
<button>Adaugă în coș</button>

// Avoid
<button>Add to cart</button>
```

---

## 🔒 Security

- Never commit API keys or secrets
- Use `.env.example` for templates
- Validate all user inputs
- Report security issues privately

---

## 📋 Development Workflow

1. **Pick an issue** from GitHub Issues
2. **Comment** to let others know you're working on it
3. **Create a branch** with descriptive name
4. **Make changes** following code style
5. **Write tests** if applicable
6. **Submit PR** with clear description
7. **Address feedback** from reviewers
8. **Merge** when approved

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Router](https://tanstack.com/router)
- [Supabase Docs](https://supabase.com/docs)

---

## 💬 Questions?

- Open a GitHub Discussion
- Ask in Pull Request comments
- Email: dev@bijuterii-romania-lux.com

---

## 🙏 Thank You!

Your contributions help make BIJUTERII Romania Lux better for everyone!
