import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import nileshopWordmark from '@/assets/logo/nileshop-wordmark.png';
import { Button } from '@/components/ui/button';
import { AuthField } from '@/features/auth/components/AuthField';
import { SocialAuthButtons } from '@/features/auth/components/SocialAuthButtons';
import { authApi } from '@/features/auth/api/authApi';
import { dashboardPathForRoles } from '@/features/auth/utils/dashboardPath';
import { setCredentials } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const socialAuthFailed = searchParams.get('error') === 'social_auth_failed';
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
    <div className="flex min-h-screen items-center justify-center bg-background p-6 sm:p-10">
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

        {socialAuthFailed && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            That sign-in didn&apos;t go through. Please try again.
          </p>
        )}

        <SocialAuthButtons className="mt-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
  );
}
