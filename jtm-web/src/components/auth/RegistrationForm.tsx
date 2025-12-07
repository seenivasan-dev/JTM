'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, UserPlus, Sparkles } from 'lucide-react';

const familyMemberSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  age: z.number().min(0).max(150, 'Invalid age'),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  relationship: z.string().min(2, 'Relationship is required'),
});

const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
  membershipType: z.enum(['INDIVIDUAL', 'FAMILY', 'CUSTOM']),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code is required'),
    country: z.string(),
  }),
  familyMembers: z.array(familyMemberSchema),
  initialPaymentMethod: z.string().optional(),
  initialPaymentConfirmation: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const successAlertRef = useRef<HTMLDivElement>(null);

  // Scroll to success message when it appears
  useEffect(() => {
    if (success && successAlertRef.current) {
      successAlertRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [success]);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      membershipType: 'INDIVIDUAL',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
      },
      familyMembers: [],
      initialPaymentMethod: '',
      initialPaymentConfirmation: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'familyMembers',
  });

  const membershipType = form.watch('membershipType');

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Transform data for API - convert string ages to numbers
      const transformedData = {
        ...data,
        familyMembers: data.familyMembers?.map(fm => ({
          ...fm,
          age: Number(fm.age),
          contactNumber: fm.contactNumber || undefined,
          email: fm.email || undefined,
        })),
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Use the message from the API response
      setSuccess(result.message || 'Registration successful! Your account is pending admin approval. You will receive an email once activated.');
      
      // Redirect to login after 8 seconds (giving user time to read the message)
      setTimeout(() => {
        router.push('/auth/login');
      }, 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFamilyMember = () => {
    append({
      firstName: '',
      lastName: '',
      age: '' as any, // Start with empty string instead of 0
      contactNumber: '',
      email: '',
      relationship: '',
    });
  };

  return (
    <Card className="w-full max-w-2xl elevated-card border-t-4 border-t-primary backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
      <CardHeader className="space-y-3 text-center pb-8">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-600 via-blue-600 to-emerald-600 flex items-center justify-center shadow-xl mb-2">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-orange-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Join Our Community
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Register for membership. Your application will be reviewed by our admin team.
        </CardDescription>
      </CardHeader>
      <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert ref={successAlertRef} className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-semibold text-lg">{success}</p>
                  <p className="text-sm">
                    You will receive an email with login instructions once an administrator activates your account.
                  </p>
                  <p className="text-sm font-medium mt-3">
                    Redirecting to login page in a few seconds...
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Hide form after successful registration */}
          {!success && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="membershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select membership type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                          <SelectItem value="FAMILY">Family</SelectItem>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address Information</h3>
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Jacksonville" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="FL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="32258" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Information</h3>
                <p className="text-sm text-gray-600">
                  Please provide your payment details. This information will be reviewed during the approval process.
                </p>
                
                <FormField
                  control={form.control}
                  name="initialPaymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="CHECK">Check</SelectItem>
                          <SelectItem value="ZELLE">Zelle</SelectItem>
                          <SelectItem value="VENMO">Venmo</SelectItem>
                          <SelectItem value="PAYPAL">PayPal</SelectItem>
                          <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initialPaymentConfirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Confirmation/Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Check number, transaction ID, or confirmation code" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Family Members (only for FAMILY membership) */}
              {membershipType === 'FAMILY' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Family Members</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Family Member
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary">Family Member {index + 1}</Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`familyMembers.${index}.firstName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`familyMembers.${index}.lastName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`familyMembers.${index}.age`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="25" 
                                  {...field}
                                  value={field.value === 0 ? '' : field.value}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow empty string or valid numbers only
                                    if (value === '' || /^\d+$/.test(value)) {
                                      field.onChange(value === '' ? 0 : Number(value));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`familyMembers.${index}.relationship`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <FormControl>
                                <Input placeholder="Spouse, Child, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`familyMembers.${index}.contactNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Number (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`familyMembers.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email (Optional)</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="jane.doe@example.com" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex flex-col space-y-4 pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Registering...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Complete Registration
                    </span>
                  )}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/login" 
                    className="text-primary hover:text-secondary transition-colors font-semibold"
                  >
                    Sign in here
                  </Link>
                </div>
              </div>
            </form>
          </Form>
          )}
        </CardContent>
      </Card>
  );
}