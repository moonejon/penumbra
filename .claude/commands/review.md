---
description: Review recent code changes for quality and best practices
---

Review recent code changes in the Penumbra project.

Review checklist:
1. **TypeScript:** Type safety, proper typing, no 'any' types
2. **React patterns:** Proper use of Server/Client Components, hooks, component composition
3. **Performance:** Unnecessary re-renders, N+1 queries, bundle size
4. **Security:** Input validation, authentication checks, SQL injection prevention
5. **Code quality:** Readability, maintainability, DRY principle
6. **Project patterns:** Consistency with existing architecture
7. **Error handling:** Proper try-catch, user-friendly error messages
8. **Accessibility:** ARIA labels, keyboard navigation, semantic HTML

Project-specific considerations:
- Server actions should have proper error handling
- Material-UI components follow theme configuration
- Database queries use Prisma best practices
- User data is properly isolated (filtered by user ID)
- API responses are properly typed

Run `git status` and `git diff` to see recent changes, then provide a detailed review with specific recommendations.
