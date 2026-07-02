"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { isAuthenticated, login, signUp, loginWithGoogle, redirectPath } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push(redirectPath || "/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath || "/");
    }
  }, [isAuthenticated, router, redirectPath]);

  // State values for Login and Signup
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      router.push(redirectPath || "/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to log in.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp(signupEmail, signupPassword);
      router.push(redirectPath || "/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Interactive/Visual section */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract background gradient */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-linear-to-br from-zinc-800 via-zinc-900 to-black opacity-50 z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] z-0" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">AI Agent</span>
          </div>
        </div>

        <div className="relative z-10 mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
            Unlock the power of <br/><span className="text-accent">intelligent conversations.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
            Experience next-generation AI assistance built to streamline your workflow and enhance your productivity.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-zinc-500 text-sm">
          <span>© 2026 AI Agent Chatbot</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-[400px] animate-fade-in">
          
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-text-100 text-xl font-bold tracking-tight">AI Agent</span>
          </div>

          {error && (
            <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-bg-200/50 rounded-xl">
              <TabsTrigger 
                value="login" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-text-100 data-[state=active]:shadow-sm transition-all cursor-pointer"
              >
                Log In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-text-100 data-[state=active]:shadow-sm transition-all cursor-pointer"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger 
                value="google"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-text-100 data-[state=active]:shadow-sm transition-all cursor-pointer"
              >
                Google
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0 outline-none">
              <form onSubmit={handleLogin}>
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="px-0 pt-0 pb-6 text-center lg:text-left">
                    <CardTitle className="text-2xl font-serif text-text-100">Welcome back</CardTitle>
                    <CardDescription className="text-text-400">
                      Enter your email and password to access your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 px-0">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-text-200 font-medium">Email</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="h-12 px-4 bg-bg-100 border-bg-300 focus-visible:ring-accent/20 focus-visible:border-accent rounded-xl transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-text-200 font-medium">Password</Label>
                        <a href="#" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                          Forgot password?
                        </a>
                      </div>
                      <Input 
                        id="login-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-12 px-4 bg-bg-100 border-bg-300 focus-visible:ring-accent/20 focus-visible:border-accent rounded-xl transition-all"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="px-0 pt-6 pb-0 flex flex-col gap-4">
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-accent hover:bg-accent-hover text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium text-[15px] cursor-pointer">
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                    <div className="relative w-full flex items-center justify-center my-1">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-bg-300 dark:border-zinc-700/50" />
                      </div>
                      <span className="relative px-3 text-xs uppercase text-text-400 bg-white dark:bg-zinc-950 rounded">Or continue with</span>
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleGoogleLogin} 
                      disabled={loading} 
                      className="w-full h-12 bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-[15px] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 0, 0)">
                          <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.28c1.92,-1.78 3.03,-4.41 3.03,-7.4C21.65,11.83 21.54,11.45 21.35,11.1z" fill="#4285F4" />
                          <path d="M12,20.5c2.3,0 4.23,-0.76 5.64,-2.07l-3.28,-2.6c-0.9,0.6 -2.06,0.97 -3.36,0.97 -2.59,0 -4.78,-1.75 -5.56,-4.1H2.07v2.68C3.52,18.23 7.5,20.5 12,20.5z" fill="#34A853" />
                          <path d="M6.44,12.7c-0.2,-0.6 -0.31,-1.24 -0.31,-1.9s0.11,-1.3 0.31,-1.9V6.22H2.07c-0.72,1.44 -1.13,3.06 -1.13,4.78s0.41,3.34 1.13,4.78l3.29,-2.58C6.13,13.94 6.24,13.3 6.44,12.7z" fill="#FBBC05" />
                          <path d="M12,5.7c1.25,0 2.37,0.43 3.25,1.27l2.43,-2.43C16.22,3.14 14.29,2.5 12,2.5c-4.5,0 -8.48,2.27 -9.93,5.79l3.29,2.58C6.14,6.45 8.33,5.7 12,5.7z" fill="#EA4335" />
                        </g>
                      </svg>
                      <span>Sign in with Google</span>
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-0 outline-none">
              <form onSubmit={handleSignup}>
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="px-0 pt-0 pb-6 text-center lg:text-left">
                    <CardTitle className="text-2xl font-serif text-text-100">Create an account</CardTitle>
                    <CardDescription className="text-text-400">
                      Enter your details below to create your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 px-0">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-text-200 font-medium">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="h-12 px-4 bg-bg-100 border-bg-300 focus-visible:ring-accent/20 focus-visible:border-accent rounded-xl transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-text-200 font-medium">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="Create a password" 
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="h-12 px-4 bg-bg-100 border-bg-300 focus-visible:ring-accent/20 focus-visible:border-accent rounded-xl transition-all"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="px-0 pt-6 pb-0 flex flex-col gap-4">
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-accent hover:bg-accent-hover text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium text-[15px] cursor-pointer">
                      {loading ? "Creating..." : "Create Account"}
                    </Button>
                    <div className="relative w-full flex items-center justify-center my-1">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-bg-300 dark:border-zinc-700/50" />
                      </div>
                      <span className="relative px-3 text-xs uppercase text-text-400 bg-white dark:bg-zinc-950 rounded">Or continue with</span>
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleGoogleLogin} 
                      disabled={loading} 
                      className="w-full h-12 bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-[15px] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 0, 0)">
                          <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.28c1.92,-1.78 3.03,-4.41 3.03,-7.4C21.65,11.83 21.54,11.45 21.35,11.1z" fill="#4285F4" />
                          <path d="M12,20.5c2.3,0 4.23,-0.76 5.64,-2.07l-3.28,-2.6c-0.9,0.6 -2.06,0.97 -3.36,0.97 -2.59,0 -4.78,-1.75 -5.56,-4.1H2.07v2.68C3.52,18.23 7.5,20.5 12,20.5z" fill="#34A853" />
                          <path d="M6.44,12.7c-0.2,-0.6 -0.31,-1.24 -0.31,-1.9s0.11,-1.3 0.31,-1.9V6.22H2.07c-0.72,1.44 -1.13,3.06 -1.13,4.78s0.41,3.34 1.13,4.78l3.29,-2.58C6.13,13.94 6.24,13.3 6.44,12.7z" fill="#FBBC05" />
                          <path d="M12,5.7c1.25,0 2.37,0.43 3.25,1.27l2.43,-2.43C16.22,3.14 14.29,2.5 12,2.5c-4.5,0 -8.48,2.27 -9.93,5.79l3.29,2.58C6.14,6.45 8.33,5.7 12,5.7z" fill="#EA4335" />
                        </g>
                      </svg>
                      <span>Sign in with Google</span>
                    </Button>
                    <p className="text-xs text-center text-text-400 mt-2">
                      By clicking continue, you agree to our{" "}
                      <a href="#" className="underline underline-offset-4 hover:text-text-200">Terms of Service</a>{" "}
                      and{" "}
                      <a href="#" className="underline underline-offset-4 hover:text-text-200">Privacy Policy</a>.
                    </p>
                  </CardFooter>
                </Card>
              </form>
            </TabsContent>

            <TabsContent value="google" className="mt-0 outline-none">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0 pb-6 text-center lg:text-left">
                  <CardTitle className="text-2xl font-serif text-text-100">Sign in with Google</CardTitle>
                  <CardDescription className="text-text-400">
                    Use your Google account to log in or create an account quickly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6 px-0">
                  <Button 
                    type="button"
                    onClick={handleGoogleLogin} 
                    disabled={loading} 
                    className="w-full h-12 bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-[15px] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 0, 0)">
                        <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.28c1.92,-1.78 3.03,-4.41 3.03,-7.4C21.65,11.83 21.54,11.45 21.35,11.1z" fill="#4285F4" />
                        <path d="M12,20.5c2.3,0 4.23,-0.76 5.64,-2.07l-3.28,-2.6c-0.9,0.6 -2.06,0.97 -3.36,0.97 -2.59,0 -4.78,-1.75 -5.56,-4.1H2.07v2.68C3.52,18.23 7.5,20.5 12,20.5z" fill="#34A853" />
                        <path d="M6.44,12.7c-0.2,-0.6 -0.31,-1.24 -0.31,-1.9s0.11,-1.3 0.31,-1.9V6.22H2.07c-0.72,1.44 -1.13,3.06 -1.13,4.78s0.41,3.34 1.13,4.78l3.29,-2.58C6.13,13.94 6.24,13.3 6.44,12.7z" fill="#FBBC05" />
                        <path d="M12,5.7c1.25,0 2.37,0.43 3.25,1.27l2.43,-2.43C16.22,3.14 14.29,2.5 12,2.5c-4.5,0 -8.48,2.27 -9.93,5.79l3.29,2.58C6.14,6.45 8.33,5.7 12,5.7z" fill="#EA4335" />
                      </g>
                    </svg>
                    <span>Continue with Google</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}
