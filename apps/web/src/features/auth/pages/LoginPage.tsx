import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import type { UserRole } from '@nileshop/types';
import nileshopWordmark from '@/assets/logo/nileshop-wordmark.png';
import { Button } from '@/components/ui/button';
import { AuthField } from '@/features/auth/components/AuthField';
import { authApi } from '@/features/auth/api/authApi';
import { setCredentials } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function dashboardPathForRoles(roles: UserRole[]) {
  if (roles.includes('administrator')) return '/admin';
  if (roles.includes('vendor')) return '/vendor';
  if (roles.includes('delivery_rider')) return '/rider';
  return '/';
}

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const explicitRedirect = (location.state as { from?: { pathname?: string } })?.from?.pathname;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    try {
      const response = await authApi.login(values);
      if (response.success && response.data) {
        dispatch(setCredentials({ user: response.data.user, token: response.data.token }));
        const target = explicitRedirect ?? dashboardPathForRoles(response.data.user.roles);
        navigate(target, { replace: true });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.email) {
        setError('email', { message: apiErrors.email[0] });
      }
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark lg:flex lg:flex-col lg:justify-end lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent/10" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-sm"
        >
          <h1 className="font-display text-3xl font-bold leading-tight text-primary-foreground">
            Shop smarter across South Sudan
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
            Thousands of products from trusted vendors, delivered fast to Juba and beyond.
          </p>
        </motion.div>

        <p className="relative text-xs text-primary-foreground/50">© {new Date().getFullYear()} NileShop</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="mb-8 inline-block">
            <img src={nileshopWordmark} alt="NileShop" className="h-7 w-auto" />
          </Link>

          <h2 className="font-display text-2xl font-bold text-foreground">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your NileShop account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <AuthField
              id="email"
              type="email"
              icon={Mail}
              label="Email address"
              error={errors.email?.message}
              {...register('email')}
            />
            <AuthField
              id="password"
              type="password"
              icon={Lock}
              label="Password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
