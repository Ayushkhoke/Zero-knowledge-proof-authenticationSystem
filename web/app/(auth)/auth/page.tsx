'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Shield, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { AuthService } from '@/services/auth.service';
import { ZkpClientUtils } from '@/lib/zkp-client';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Name is required').optional(),
  secret: z.string().min(8, 'Secret must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  secret: z.string().min(1, 'Secret is required'),
});

type RegisterForm = z.infer<typeof registerSchema>;
type LoginForm = z.infer<typeof loginSchema>;

export default function ZkpAuthPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('login');
  const [showSecret, setShowSecret] = React.useState(false);
  const router = useRouter();

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      name: '',
      secret: '',
    },
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      secret: '',
    },
  });

  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      // Generate commitment and public key from secret using Poseidon
      const commitment = await ZkpClientUtils.generateCommitment(data.secret);
      const publicKey = await ZkpClientUtils.generatePublicKey(data.secret);

      // Check if user is already registered
      const statusResponse = await AuthService.getZkpStatus(data.email);
      if (statusResponse.error) {
        toast.error(statusResponse.error.message);
        return;
      }

      if (statusResponse.data?.isRegistered) {
        toast.error('User already registered with ZKP');
        return;
      }

      // Register user with ZKP commitment and public key
      const registerResponse = await AuthService.zkpRegister({
        email: data.email,
        name: data.name || 'ZKP User',
        commitment,
        publicKey,
      });

      if (registerResponse.error) {
        toast.error(registerResponse.error.message);
        return;
      }

      if (registerResponse.data?.success) {
        // Store secret securely for login
        ZkpClientUtils.storeSecret(data.email, data.secret);

        toast.success('Registration successful! You can now login.');
        setActiveTab('login');
        loginForm.setValue('email', data.email);
        registerForm.reset();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Check if user is registered
      const statusResponse = await AuthService.getZkpStatus(data.email);
      if (statusResponse.error) {
        toast.error(statusResponse.error.message);
        return;
      }

      if (!statusResponse.data?.isRegistered) {
        toast.error('User not registered. Please register first.');
        setActiveTab('register');
        return;
      }

      // Generate proof using the secret - try real proof first, fallback to mock
      let proof, publicSignals;
      try {
        toast.info('Generating ZKP proof...');
        const proofData = await ZkpClientUtils.generateProof(data.secret);
        proof = proofData.proof;
        publicSignals = proofData.publicSignals;
      } catch (proofError) {
        console.warn('Real proof generation failed, using mock proof:', proofError);
        toast.warning('Using development mode (mock proof)');
        const mockProofData = await ZkpClientUtils.generateMockProof(data.secret);
        proof = mockProofData.proof;
        publicSignals = mockProofData.publicSignals;
      }

      // Use NextAuth signIn with ZKP credentials
      const result = await signIn('zkp-credentials', {
        email: data.email,
        proof: JSON.stringify(proof),
        publicSignals: JSON.stringify(publicSignals),
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.ok) {
        toast.success('Login successful! Redirecting...');
        // Store secret for convenience (optional)
        ZkpClientUtils.storeSecret(data.email, data.secret);

        // Redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your secret.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomSecret = () => {
    const secret = ZkpClientUtils.generateSecret();
    if (activeTab === 'register') {
      registerForm.setValue('secret', secret);
    } else {
      loginForm.setValue('secret', secret);
    }
    toast.info('Random secret generated!');
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-black p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md'
      >
        <Card className='border border-white/10 bg-black/40 shadow-2xl backdrop-blur-md'>
          <CardHeader className='pb-6 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5'>
              <Shield className='h-6 w-6 text-white/80' />
            </div>
            <CardTitle className='text-2xl font-extralight tracking-tight text-white'>ZKP Authentication</CardTitle>
            <CardDescription className='font-light text-white/60'>
              Secure login using Zero-Knowledge Proofs
            </CardDescription>
          </CardHeader>

          <CardContent className='pt-0'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
              <TabsList className='mb-6 grid w-full grid-cols-2 border border-white/10 bg-white/5 p-1'>
                <TabsTrigger
                  value='login'
                  className='border-0 font-light tracking-tight text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white'
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value='register'
                  className='border-0 font-light tracking-tight text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white'
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode='wait'>
                <TabsContent key='login-tab' value='login' className='space-y-4'>
                  <motion.div
                    key='login'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className='space-y-4'>
                        <FormField
                          control={loginForm.control}
                          name='email'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='font-light text-white/80'>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Enter your email'
                                  type='email'
                                  {...field}
                                  className='border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20 focus:ring-white/20'
                                />
                              </FormControl>
                              <FormMessage className='text-red-400/80' />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name='secret'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='flex items-center justify-between font-light text-white/80'>
                                Secret
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  onClick={generateRandomSecret}
                                  className='h-auto p-1 text-xs text-white/60 hover:bg-white/5 hover:text-white'
                                >
                                  <KeyRound className='mr-1 h-3 w-3' />
                                  Generate
                                </Button>
                              </FormLabel>
                              <FormControl>
                                <div className='relative'>
                                  <Input
                                    placeholder='Enter your secret'
                                    type={showSecret ? 'text' : 'password'}
                                    {...field}
                                    className='border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20 focus:ring-white/20'
                                  />
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    className='absolute top-0 right-0 h-full px-3 py-2 text-white/60 hover:bg-transparent hover:text-white'
                                    onClick={() => setShowSecret(!showSecret)}
                                  >
                                    {showSecret ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage className='text-red-400/80' />
                            </FormItem>
                          )}
                        />

                        <Button
                          type='submit'
                          className='w-full border border-white/10 bg-white/10 font-light tracking-tight text-white backdrop-blur-sm hover:bg-white/20'
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                          Login with ZKP
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                </TabsContent>

                <TabsContent key='register-tab' value='register' className='space-y-4'>
                  <motion.div
                    key='register'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegister)} className='space-y-4'>
                        <FormField
                          control={registerForm.control}
                          name='email'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='font-light text-white/80'>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Enter your email'
                                  type='email'
                                  {...field}
                                  className='border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20 focus:ring-white/20'
                                />
                              </FormControl>
                              <FormMessage className='text-red-400/80' />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='font-light text-white/80'>Name (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Enter your name'
                                  {...field}
                                  className='border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20 focus:ring-white/20'
                                />
                              </FormControl>
                              <FormMessage className='text-red-400/80' />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name='secret'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='flex items-center justify-between font-light text-white/80'>
                                Secret
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  onClick={generateRandomSecret}
                                  className='h-auto p-1 text-xs text-white/60 hover:bg-white/5 hover:text-white'
                                >
                                  <KeyRound className='mr-1 h-3 w-3' />
                                  Generate
                                </Button>
                              </FormLabel>
                              <FormControl>
                                <div className='relative'>
                                  <Input
                                    placeholder='Create a secret (min 8 characters)'
                                    type={showSecret ? 'text' : 'password'}
                                    {...field}
                                    className='border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20 focus:ring-white/20'
                                  />
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    className='absolute top-0 right-0 h-full px-3 py-2 text-white/60 hover:bg-transparent hover:text-white'
                                    onClick={() => setShowSecret(!showSecret)}
                                  >
                                    {showSecret ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage className='text-red-400/80' />
                              <p className='text-xs font-light text-white/50'>
                                Keep this secret safe! You'll need it to log in.
                              </p>
                            </FormItem>
                          )}
                        />

                        <Button
                          type='submit'
                          className='w-full border border-white/10 bg-white/10 font-light tracking-tight text-white backdrop-blur-sm hover:bg-white/20'
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                          Register with ZKP
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </CardContent>

          <CardFooter className='text-center'>
            <p className='w-full text-xs font-light tracking-tight text-white/50'>
              Powered by Zero-Knowledge Proofs for enhanced privacy and security
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
