# GitHub OAuth Setup Guide

## 1. Create GitHub OAuth App

1. GitHub Settings-руу очоорой: https://github.com/settings/developers
2. "OAuth Apps" дээр дараад "New OAuth App" дарна
3. Дараах мэдээллийг оруулна:
   - **Application name**: Adoptable Dev
   - **Homepage URL**: `http://localhost:4200`
   - **Authorization callback URL**: `http://localhost:4200/api/auth/callback/github`
4. "Register application" дарна
5. Client ID болон Client Secret-ийг хуулна

## 2. Environment Variables тохируулах

`.env.local` файл үүсгэж дараах өгөгдлийг оруулна:

```bash
NEXTAUTH_URL=http://localhost:4200
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
DATABASE_URL="postgresql://user:password@localhost:5432/adoptable?schema=public"
```

### NEXTAUTH_SECRET үүсгэх:
```bash
openssl rand -base64 32
```

## 3. Database Migration ажиллуулах

```bash
cd apps/adoptable
npx prisma migrate dev --name add_auth_models
npx prisma generate
npm run prisma:seed
```

## 4. Package суулгах

```bash
npm install next-auth@beta @auth/prisma-adapter
```

## 5. Ажиллуулах

```bash
nx serve adoptable
```

## 6. Тестлэх

1. http://localhost:4200 руу очоод
2. Admin хэсэг (http://localhost:4200/admin) руу орохыг оролдоно
3. Sign in хуудас руу redirect хийгдэнэ
4. GitHub-ээр нэвтэрнэ
5. Admin эрхтэй хэрэглэгч (admin@adoptable.com) байвал admin хэсэг рүү нэвтэрнэ

## Үүсгэсэн файлууд:

### Auth Configuration
- `src/auth.ts` - NextAuth тохиргоо
- `src/app/api/auth/[...nextauth]/route.ts` - Auth API route
- `src/types/next-auth.d.ts` - TypeScript type declarations

### Middleware & Guards
- `src/middleware.ts` - Route protection middleware
- `src/lib/auth-guards.ts` - API route guards
- `src/app/admin/layout.tsx` - Admin layout with SSR guard

### CSRF Protection
- `src/lib/csrf.ts` - CSRF token utilities
- `src/lib/use-csrf.ts` - Client-side CSRF hook
- `src/app/api/csrf/route.ts` - CSRF token endpoint

### Admin Routes
- `src/app/admin/page.tsx` - Admin dashboard
- `src/app/api/admin/example/route.ts` - Protected API example

### Database
- `prisma/schema.prisma` - Updated with auth models
- `prisma/seed.ts` - Updated with admin user

## API Endpoint Examples:

### Protected API Route:
```typescript
import { requireAdmin } from "@/lib/auth-guards";

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  
  // Your logic here
}
```

### With CSRF Protection:
```typescript
import { csrfProtection } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrfError = await csrfProtection(request);
  if (csrfError) return csrfError;
  
  // Your logic here
}
```

## Notes:

- NextAuth v5 (beta) ашигласан
- CSRF protection нь cookie-based
- Admin эрхийн шалгалт SSR болон API хоёрт байна
- GitHub OAuth ашиглаж нэвтрэх
- Prisma adapter ашиглан database session management
