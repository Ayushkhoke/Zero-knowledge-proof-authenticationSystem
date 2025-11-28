'use client';

import Hero from '@/components/ui/neural-network-hero';
import { signOut, useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Key, Link as LinkIcon, Hash, Code, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth' });
  };

  const openEtherscan = (type: 'tx' | 'address' | 'block', value: string) => {
    const baseUrl = 'https://sepolia.etherscan.io';
    const url = `${baseUrl}/${type}/${value}`;
    window.open(url, '_blank');
  };

  return (
    <div className='min-h-screen min-w-screen'>
      <Hero
        title='Zero-Knowledge Proof Auth Dashboard'
        description='Experience the power of zero-knowledge proof authentication with a stunning neural network visualization. Your secure workspace awaits.'
        badgeText='ZKP Powered'
        badgeLabel='Secure'
        ctaButtons={[{ text: 'Logout', onClick: handleLogout, primary: true }]}
      />

      {/* Dashboard Content */}
      <div className='container mx-auto max-w-7xl px-4 py-16 md:py-20'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-12 text-center'
        >
          <h2 className='mb-3 text-3xl font-extralight tracking-tight text-white md:text-4xl'>Your Secure Dashboard</h2>
          <p className='text-base font-light text-white/60 md:text-lg'>
            Complete overview of your zero-knowledge authentication and blockchain commitments
          </p>
        </motion.div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* User Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          >
            <Card className='group relative overflow-hidden border border-white/10 bg-gradient-to-br from-black/60 via-black/40 to-black/60 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-white/5'>
              {/* Gradient Overlay */}
              <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

              <CardHeader className='relative'>
                <div className='mb-2 flex items-center gap-3'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-lg transition-transform duration-300 group-hover:scale-110'>
                    <User className='h-6 w-6 text-white/90' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-extralight tracking-tight text-white'>
                      User Information
                    </CardTitle>
                    <CardDescription className='text-xs font-light text-white/50'>Your account details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='relative space-y-5'>
                <div className='group/item rounded-lg border border-white/5 bg-white/5 p-4 transition-all duration-200 hover:border-white/10 hover:bg-white/10'>
                  <div className='mb-2 flex items-center gap-2 text-sm'>
                    <User className='h-4 w-4 text-blue-400/80' />
                    <span className='font-light text-white/50'>Name</span>
                  </div>
                  <p className='text-lg font-light text-white'>{user?.name || 'ZKP User'}</p>
                </div>

                <div className='group/item rounded-lg border border-white/5 bg-white/5 p-4 transition-all duration-200 hover:border-white/10 hover:bg-white/10'>
                  <div className='mb-2 flex items-center gap-2 text-sm'>
                    <Mail className='h-4 w-4 text-green-400/80' />
                    <span className='font-light text-white/50'>Email</span>
                  </div>
                  <p className='text-lg font-light break-all text-white'>{user?.email || 'N/A'}</p>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='group/item rounded-lg border border-white/5 bg-white/5 p-4 transition-all duration-200 hover:border-white/10 hover:bg-white/10'>
                    <div className='mb-2 flex items-center gap-2 text-xs'>
                      <Shield className='h-4 w-4 text-purple-400/80' />
                      <span className='font-light text-white/50'>Auth Method</span>
                    </div>
                    <Badge className='border-purple-500/20 bg-purple-500/10 font-light text-purple-200 hover:bg-purple-500/20'>
                      {user?.authMethod === 'zkp' ? 'ZKP' : 'Standard'}
                    </Badge>
                  </div>

                  <div className='group/item rounded-lg border border-white/5 bg-white/5 p-4 transition-all duration-200 hover:border-white/10 hover:bg-white/10'>
                    <div className='mb-2 flex items-center gap-2 text-xs'>
                      <Key className='h-4 w-4 text-yellow-400/80' />
                      <span className='font-light text-white/50'>Role</span>
                    </div>
                    <Badge variant='outline' className='border-white/20 font-light text-white/80'>
                      {user?.role || 'USER'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Blockchain Information Card */}
          {user?.blockchain && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className='md:col-span-2'
            >
              <Card className='group relative overflow-hidden border border-white/10 bg-gradient-to-br from-black/60 via-black/40 to-black/60 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-white/5'>
                {/* Animated Gradient Overlay */}
                <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                <CardHeader className='relative'>
                  <div className='mb-2 flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-lg transition-transform duration-300 group-hover:scale-110'>
                      <LinkIcon className='h-6 w-6 text-cyan-400/90' />
                    </div>
                    <div>
                      <CardTitle className='text-xl font-extralight tracking-tight text-white'>
                        Blockchain Information
                      </CardTitle>
                      <CardDescription className='text-xs font-light text-white/50'>
                        Your commitment stored on Sepolia testnet
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='relative space-y-5'>
                  <div className='grid gap-5 md:grid-cols-2'>
                    {/* Blockchain Address */}
                    <div className='group/item rounded-lg border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition-all duration-200 hover:border-cyan-500/20 hover:bg-white/10'>
                      <div className='mb-3 flex items-center gap-2 text-xs'>
                        <Shield className='h-4 w-4 text-cyan-400/80' />
                        <span className='font-light tracking-wider text-white/50 uppercase'>Blockchain Address</span>
                      </div>
                      {user.blockchain?.address ? (
                        <Button
                          variant='ghost'
                          onClick={() => openEtherscan('address', user.blockchain?.address!)}
                          className='h-auto w-full cursor-pointer justify-between gap-2 p-3 text-left font-mono text-sm text-white/90 hover:bg-cyan-500/10 hover:text-white'
                        >
                          <span>{`${user.blockchain.address.slice(0, 10)}...${user.blockchain.address.slice(-6)}`}</span>
                          <ExternalLink className='h-4 w-4 flex-shrink-0 text-cyan-400/70' />
                        </Button>
                      ) : (
                        <p className='font-light text-white/40'>Not available</p>
                      )}
                    </div>

                    {/* Transaction Hash */}
                    <div className='group/item rounded-lg border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition-all duration-200 hover:border-blue-500/20 hover:bg-white/10'>
                      <div className='mb-3 flex items-center gap-2 text-xs'>
                        <Hash className='h-4 w-4 text-blue-400/80' />
                        <span className='font-light tracking-wider text-white/50 uppercase'>Transaction Hash</span>
                      </div>
                      {user.blockchain?.transactionHash ? (
                        <Button
                          variant='ghost'
                          onClick={() => openEtherscan('tx', user.blockchain?.transactionHash!)}
                          className='h-auto w-full cursor-pointer justify-between gap-2 p-3 text-left font-mono text-sm text-white/90 hover:bg-blue-500/10 hover:text-white'
                        >
                          <span>{`${user.blockchain.transactionHash.slice(0, 10)}...${user.blockchain.transactionHash.slice(-6)}`}</span>
                          <ExternalLink className='h-4 w-4 flex-shrink-0 text-blue-400/70' />
                        </Button>
                      ) : (
                        <p className='font-light text-white/40'>Not available</p>
                      )}
                    </div>

                    {/* Block Number */}
                    <div className='group/item rounded-lg border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition-all duration-200 hover:border-purple-500/20 hover:bg-white/10'>
                      <div className='mb-3 flex items-center gap-2 text-xs'>
                        <Code className='h-4 w-4 text-purple-400/80' />
                        <span className='font-light tracking-wider text-white/50 uppercase'>Block Number</span>
                      </div>
                      {user.blockchain?.blockNumber ? (
                        <Button
                          variant='ghost'
                          onClick={() => {
                            if (user.blockchain?.blockNumber) {
                              openEtherscan('block', user.blockchain.blockNumber.toString());
                            }
                          }}
                          className='h-auto w-full cursor-pointer justify-between gap-2 p-3 text-left font-mono text-base text-white/90 hover:bg-purple-500/10 hover:text-white'
                        >
                          <span>#{user.blockchain.blockNumber}</span>
                          <ExternalLink className='h-4 w-4 flex-shrink-0 text-purple-400/70' />
                        </Button>
                      ) : (
                        <p className='font-light text-white/40'>Not available</p>
                      )}
                    </div>

                    {/* Chain ID */}
                    <div className='group/item rounded-lg border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition-all duration-200 hover:border-green-500/20 hover:bg-white/10'>
                      <div className='mb-3 flex items-center gap-2 text-xs'>
                        <LinkIcon className='h-4 w-4 text-green-400/80' />
                        <span className='font-light tracking-wider text-white/50 uppercase'>Network</span>
                      </div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge className='border-green-500/20 bg-green-500/10 font-mono text-sm font-light text-green-200'>
                          {user.blockchain?.chainId || 11155111}
                        </Badge>
                        <Badge variant='outline' className='border-white/20 text-sm font-light text-white/80'>
                          Sepolia
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className='mt-6 rounded-xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-4 shadow-lg'>
                    <div className='flex items-start gap-3'>
                      <div className='mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/10'>
                        <span className='text-sm'>💡</span>
                      </div>
                      <p className='text-sm leading-relaxed font-light text-white/70'>
                        Your ZKP commitment is permanently stored on the Ethereum Sepolia testnet. Click on any value
                        above to view it on Etherscan.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Security Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className='lg:col-span-3'
          >
            <Card className='group relative overflow-hidden border border-white/10 bg-gradient-to-br from-black/60 via-black/40 to-black/60 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-white/5'>
              {/* Gradient Overlay */}
              <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

              <CardHeader className='relative'>
                <div className='mb-2 flex items-center gap-3'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-green-500/10 to-purple-500/10 shadow-lg transition-transform duration-300 group-hover:scale-110'>
                    <Shield className='h-6 w-6 text-green-400/90' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-extralight tracking-tight text-white'>
                      Security Features
                    </CardTitle>
                    <CardDescription className='text-xs font-light text-white/50'>
                      Your account security highlights
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='relative'>
                <div className='grid gap-5 md:grid-cols-3'>
                  <div className='group/item relative overflow-hidden rounded-xl border border-green-500/10 bg-gradient-to-br from-green-500/5 to-transparent p-5 transition-all duration-300 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10'>
                    <div className='absolute -top-6 -right-6 h-24 w-24 rounded-full bg-green-500/5 blur-2xl transition-all duration-300 group-hover/item:bg-green-500/10' />
                    <Shield className='relative mb-4 h-8 w-8 text-green-400/80 transition-transform duration-300 group-hover/item:scale-110' />
                    <h4 className='relative mb-2 text-lg font-light text-white'>Zero-Knowledge Proof</h4>
                    <p className='relative text-sm leading-relaxed font-light text-white/60'>
                      Your credentials are verified without exposing your secret
                    </p>
                  </div>

                  <div className='group/item relative overflow-hidden rounded-xl border border-blue-500/10 bg-gradient-to-br from-blue-500/5 to-transparent p-5 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10'>
                    <div className='absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all duration-300 group-hover/item:bg-blue-500/10' />
                    <LinkIcon className='relative mb-4 h-8 w-8 text-blue-400/80 transition-transform duration-300 group-hover/item:scale-110' />
                    <h4 className='relative mb-2 text-lg font-light text-white'>Blockchain Verified</h4>
                    <p className='relative text-sm leading-relaxed font-light text-white/60'>
                      Commitment stored immutably on Ethereum blockchain
                    </p>
                  </div>

                  <div className='group/item relative overflow-hidden rounded-xl border border-purple-500/10 bg-gradient-to-br from-purple-500/5 to-transparent p-5 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10'>
                    <div className='absolute -top-6 -right-6 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl transition-all duration-300 group-hover/item:bg-purple-500/10' />
                    <Key className='relative mb-4 h-8 w-8 text-purple-400/80 transition-transform duration-300 group-hover/item:scale-110' />
                    <h4 className='relative mb-2 text-lg font-light text-white'>End-to-End Encrypted</h4>
                    <p className='relative text-sm leading-relaxed font-light text-white/60'>
                      All data is encrypted at rest and in transit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
