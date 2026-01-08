# Contributing to ng-signals-utils

Thank you for your interest in contributing! We welcome contributions from the community.

## How to Contribute

### Reporting Issues

- Check if the issue already exists
- Provide a clear description and reproduction steps
- Include Angular and TypeScript versions

### Submitting Pull Requests

1. **Fork the repository**
   ```bash
   # On GitHub, click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ng-signals-utils.git
   cd ng-signals-utils
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Make your changes**
   - Add your utility function in `projects/ng-signals-utils/src/lib/`
   - Export it in `projects/ng-signals-utils/src/public-api.ts`
   - Add JSDoc comments for documentation
   - Write tests in a `.spec.ts` file

6. **Test your changes**
   ```bash
   npm test
   ng build ng-signals-utils
   ```

7. **Update documentation**
   - Add examples to `EXAMPLES.md`
   - Update `README.md` if needed

8. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add yourFeature utility"
   ```

9. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

10. **Create Pull Request**
    - Go to the original repository on GitHub
    - Click "New Pull Request"
    - Select your fork and branch
    - Provide a clear description of your changes

## Code Style

- Use TypeScript with strict type checking
- Follow Angular style guide
- Add JSDoc comments for all public functions
- Include type parameters and return types

## Example Utility Function

```typescript
/**
 * Description of what the function does
 * @param source - Description of parameter
 * @param fn - Description of parameter
 * @returns Description of return value
 * @example
 * const source = signal(5);
 * const result = yourUtility(source, x => x * 2);
 */
export function yourUtility<T, R>(
  source: Signal<T>,
  fn: (value: T) => R
): Signal<R> {
  return computed(() => fn(source()));
}
```

## Testing

All new features must include tests:

```typescript
import { describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { yourUtility } from './your-file';

describe('yourUtility', () => {
  it('should do something', () => {
    const source = signal(5);
    const result = yourUtility(source, x => x * 2);
    expect(result()).toBe(10);
  });
});
```

## Documentation

Add comprehensive examples to `EXAMPLES.md`:

- Basic usage
- Real-world scenarios
- Edge cases
- TypeScript types

## Questions?

Feel free to open an issue for any questions or clarifications.

Thank you for contributing! 🚀
