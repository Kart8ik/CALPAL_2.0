import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
} from "@/components/ui/form"
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import apiRequest from '@/ApiRequest';
import { ThemeToggle } from '@/components/theme-toggle';
import background from '@/assets/landing-section/background.svg'; // Import the background image
import darkBackground from '@/assets/landing-section/dark-background.svg';
import { useContext } from 'react'; // Make sure useContext is imported
import AuthContext from '@/context/Context';

// In a file where you make API calls
const apiUrl = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/api/users`;
// fetch(apiUrl)...

// Define Zod schema for validation
const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  age: z.coerce.number().int().positive({
    message: "Age must be a positive number.",
  }).min(13, { message: "You must be at least 13 years old."}),
  phoneNumber: z.string().regex(/^\d{10}$/, { // Basic 10-digit phone number validation
    message: "Invalid phone number format (e.g., 1234567890).",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});


const RegisterPage = () => {
  const navigate = useNavigate(); 
  const { registerUserWithEmailAndPassword } = useContext(AuthContext);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: "",
      phoneNumber: "",
    },
  })

//has no error handling since the createUserWithEmailAndPassword handles all possible errors
//the apiRequest handles the error handling and this function only sends the clean (no error) data to the api
  const register = async (user, values) => { 
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.uid,
        username: values.username,
        name: values.name,
        age: values.age,
        phoneNumber: values.phoneNumber,
      }),
    }
    const res = await apiRequest(apiUrl, options);
    return res; // Return the response 
  }
  

  const onSubmit = async (values) => {
    try {
      // Use the context function for registration
      const userCredential = await registerUserWithEmailAndPassword(values.email, values.password);
      const user = userCredential.user;

      // Register user details in your backend (MongoDB via API)
      const res = await register(user, values);

      // If both are successful, show success and navigate
      toast.success("Registration successful! Please login.");
      navigate('/login');

    } catch (error) {
      const errorCode = error.code; // Firebase errors have a .code property
      const errorMessage = error.message;

      if (errorCode === 'auth/email-already-in-use') {
        toast.error("Email already in use. Please try a different email.");
      } else if (error.message.includes("Failed to save user details")) { // Example check for custom error from register
        toast.error("Failed to save your details. Please try again.");
        // Potentially delete the Firebase user here if the backend save fails critically
        // This is an advanced step: if (userCredential && userCredential.user) { await userCredential.user.delete(); }
      } else {
        // General Firebase or other unexpected errors
        toast.error("An unexpected error occurred during registration.");
      }
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-background border-b">
      <Link to="/" className="text-3xl md:text-xl font-semibold">CalPal</Link>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="outline" asChild>
            <Link to="/login">Login</Link>
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
            className="w-full h-full object-cover dark:hidden"
          />
          <img 
            src={darkBackground} 
            alt="Background" 
            className="w-full h-full object-cover hidden dark:block"
          />
        </div>

        {/* Right half - Registration Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-10">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Create an Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="yourusername" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                          <Input type="password" placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Register
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

export default RegisterPage 