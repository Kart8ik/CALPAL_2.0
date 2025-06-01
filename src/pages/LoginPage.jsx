import React from 'react'
import { Link } from 'react-router-dom' // Import Link
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form" // Import Form components
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/auth/fireauth'; 
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import background from '@/assets/landing-section/background.svg'; // Import the background image

// Define Zod schema for validation
const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(6, { // Example: password must be at least 6 characters
    message: "Password must be at least 6 characters.",
  }),
})

const LoginPage = () => {
  // Initialize react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const navigate = useNavigate();
  
  // Handle form submission
  const onSubmit = async (values) => { // Make onSubmit async
    try {
      // Attempt to sign in the user with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      toast.success("Login successful! Redirecting...");
      navigate('/yourtasks'); // Navigate to tasks page on successful login

    } catch (error) {
      // Handle specific Firebase authentication errors
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.");
      } else {
        // Generic error message for other types of errors
        toast.error("An unexpected error occurred during login. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-background border-b">
        <Link to="/" className="text-3xl md:text-xl font-semibold">CalPal</Link>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="outline" asChild>
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </nav>

      {/* Main content - two halves */}
      <div className="flex flex-col-reverse md:flex-row flex-1">
        {/* Left half - Now with background image */}
        <div className="w-full md:w-2/3 bg-muted flex items-center justify-center overflow-hidden">
          <img 
            src={background} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right half - Login Form */}
        <div className="w-full md:w-1/2 flex items-center md:justify-center p-10 ml-0 md:ml-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}> {/* Spread form methods */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
