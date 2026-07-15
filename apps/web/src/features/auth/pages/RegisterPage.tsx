import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import nileshopWordmark from '@/assets/logo/nileshop-wordmark.png';
import { Button } from '@/components/ui/button';
import { AuthField } from '@/features/auth/components/AuthField';
import { SocialAuthButtons } from '@/features/auth/components/SocialAuthButtons';
import { authApi } from '@/features/auth/api/authApi';
import { setCredentials } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/';
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterForm) => {
    try {
      const response = await authApi.register(values);
      if (response.success && response.data) {
        dispatch(setCredentials({ user: response.data.user, token: response.data.token }));
        navigate(redirectTo, { replace: true });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          if (field in registerSchema.shape || field === 'password_confirmation') {
            setError(field as keyof RegisterForm, { message: messages[0] });
          }
        });
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

        <h2 className="font-display text-2xl font-bold text-foreground">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Join NileShop — South Sudan&apos;s marketplace</p>

        <SocialAuthButtons className="mt-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthField
            id="name"
            icon={User}
            label="Full name"
            error={errors.name?.message}
            {...register('name')}
          />
          <AuthField
            id="email"
            type="email"
            icon={Mail}
            label="Email address"
            error={errors.email?.message}
            {...register('email')}
          />
          <AuthField
            id="phone"
            icon={Phone}
            label="Phone (optional)"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <AuthField
            id="password"
            type="password"
            icon={Lock}
            label="Password"
            error={errors.password?.message}
            {...register('password')}
          />
          <AuthField
            id="password_confirmation"
            type="password"
            icon={ShieldCheck}
            label="Confirm password"
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
