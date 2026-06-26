import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { setCredentials } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  store_name: z.string().min(2),
  password: z.string().min(8),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, { message: 'Passwords do not match', path: ['password_confirmation'] });

type Form = z.infer<typeof schema>;

export function VendorRegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    const { data } = await api.post('/auth/vendor/register', values);
    if (data.success && data.data) {
      dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
      navigate('/vendor');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle>Become a Vendor</CardTitle>
          <CardDescription>Start selling on NileShop marketplace</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {(['name', 'email', 'phone', 'store_name', 'password', 'password_confirmation'] as const).map((field) => (
              <div key={field}>
                <Label htmlFor={field}>{field.replace('_', ' ')}</Label>
                <Input id={field} type={field.includes('password') ? 'password' : 'text'} {...register(field)} />
                {errors[field] && <p className="text-sm text-destructive">{errors[field]?.message}</p>}
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Register as Vendor'}
            </Button>
            <Link to="/auth/login" className="text-sm text-primary hover:underline">Already have an account?</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
