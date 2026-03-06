'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Plus,
  UserPlus,
  Sparkles,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Users,
  CheckCircle2,
  Home,
} from 'lucide-react';

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

const inputCls = 'h-11 border-gray-200 bg-white focus-visible:ring-cyan-500 focus-visible:border-cyan-500 rounded-xl placeholder:text-gray-400 placeholder:italic';
const selectCls = 'h-11 border-gray-200 bg-white rounded-xl';

function SectionHeader({
  icon,
  title,
  subtitle,
  color = 'from-cyan-500 to-blue-600',
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-md shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const successAlertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (success && successAlertRef.current) {
      successAlertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
      familyMembers: [],
      initialPaymentMethod: '',
      initialPaymentConfirmation: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'familyMembers' });
  const membershipType = form.watch('membershipType');

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration failed');
      setSuccess(result.message || 'Registration successful! Your account is pending admin approval.');
      setTimeout(() => router.push('/auth/login'), 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFamilyMember = () => {
    append({ firstName: '', lastName: '', age: '' as unknown as number, contactNumber: '', email: '', relationship: '' });
  };

  // Success state
  if (success) {
    return (
      <div ref={successAlertRef} className="text-center py-8 px-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
        <p className="text-gray-600 mb-4 max-w-sm mx-auto">
          Your application is under review. You will receive an email with login instructions once an administrator activates your account.
        </p>
        <Badge className="bg-emerald-100 text-emerald-800 text-sm px-4 py-1.5">
          Redirecting to login page...
        </Badge>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-1">
      {/* Mobile-only header — hidden since page hero now provides branding */}
      <div className="hidden text-center mb-4">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-cyan-600 to-indigo-600 shadow-lg mb-3">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Join Our Community</h2>
        <p className="text-gray-500 text-sm mt-1">Register for JTM membership</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4 rounded-xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* ── Section 1: Personal Information ── */}
          <Card className="border-2 border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 pb-3 pt-4 px-5">
              <SectionHeader
                icon={<User className="h-5 w-5 text-white" />}
                title="Personal Information"
                subtitle="Your name and contact details"
                color="from-cyan-500 to-blue-600"
              />
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                    <FormControl><Input className={inputCls} placeholder="e.g. Ravi" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                    <FormControl><Input className={inputCls} placeholder="e.g. Kumar" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" /> Email Address
                  </FormLabel>
                  <FormControl><Input className={inputCls} type="email" placeholder="e.g. ravi@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" /> Mobile Number
                    </FormLabel>
                    <FormControl><Input className={inputCls} placeholder="+1 (XXX) XXX-XXXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="membershipType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-gray-400" /> Membership Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={selectCls}><SelectValue placeholder="Select type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">
                          <span className="flex items-center gap-2"><User className="h-4 w-4" /> Individual</span>
                        </SelectItem>
                        <SelectItem value="FAMILY">
                          <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Family</span>
                        </SelectItem>
                        <SelectItem value="CUSTOM">
                          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Custom</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* ── Section 2: Address ── */}
          <Card className="border-2 border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 pb-3 pt-4 px-5">
              <SectionHeader
                icon={<Home className="h-5 w-5 text-white" />}
                title="Home Address"
                subtitle="Your address in Jacksonville area"
                color="from-violet-500 to-indigo-600"
              />
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-4 space-y-4">
              <FormField control={form.control} name="address.street" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" /> Street Address
                  </FormLabel>
                  <FormControl><Input className={inputCls} placeholder="e.g. 123 Main St" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="address.city" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">City</FormLabel>
                    <FormControl><Input className={inputCls} placeholder="City" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address.state" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">State</FormLabel>
                    <FormControl><Input className={inputCls} placeholder="State" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address.zipCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">ZIP</FormLabel>
                    <FormControl><Input className={inputCls} placeholder="ZIP Code" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* ── Section 3: Payment ── */}
          <Card className="border-2 border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-3 pt-4 px-5">
              <SectionHeader
                icon={<CreditCard className="h-5 w-5 text-white" />}
                title="Membership Payment"
                subtitle="Optional — submit with or without payment details"
                color="from-emerald-500 to-teal-600"
              />
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-4 space-y-4">
              {/* Zelle Instructions */}
              <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 font-semibold text-sm">How to Pay Membership Fee</AlertTitle>
                <AlertDescription className="text-blue-700 text-sm">
                  Send payment via <strong>Zelle</strong> to{' '}
                  <strong className="font-mono">payment@jaxtamilmandram.org</strong>
                  {' '}then enter your Zelle confirmation number below.
                </AlertDescription>
              </Alert>

              <FormField control={form.control} name="initialPaymentMethod" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={selectCls}><SelectValue placeholder="Select payment method" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ZELLE">Zelle (Recommended)</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="initialPaymentConfirmation" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Zelle Confirmation Number</FormLabel>
                  <FormControl>
                    <Input className={inputCls} placeholder="e.g. ZE-XXXXXXXXX" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* ── Section 4: Family Members (if FAMILY) ── */}
          {membershipType === 'FAMILY' && (
            <Card className="border-2 border-gray-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-3 pt-4 px-5">
                <div className="flex items-center justify-between">
                  <SectionHeader
                    icon={<Users className="h-5 w-5 text-white" />}
                    title="Family Members"
                    subtitle="Add all family members included in this membership"
                    color="from-orange-500 to-amber-600"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={addFamilyMember}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0 shadow-sm shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-2 space-y-4">
                {fields.length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    No family members added yet. Click &quot;Add&quot; to include family members.
                  </div>
                )}
                {fields.map((field, index) => (
                  <Card key={field.id} className="border-2 border-orange-100 shadow-sm rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xs">
                          {index + 1}
                        </div>
                        <span className="text-sm font-semibold text-orange-800">Family Member {index + 1}</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="hover:bg-red-100 hover:text-red-600 h-7 w-7 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="px-4 pb-4 pt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={form.control} name={`familyMembers.${index}.firstName`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-600">First Name</FormLabel>
                            <FormControl><Input className={inputCls} placeholder="First name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`familyMembers.${index}.lastName`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-600">Last Name</FormLabel>
                            <FormControl><Input className={inputCls} placeholder="Last name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={form.control} name={`familyMembers.${index}.age`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-600">Age</FormLabel>
                            <FormControl>
                              <Input
                                className={inputCls}
                                type="text"
                                inputMode="numeric"
                                placeholder="Age"
                                {...field}
                                value={field.value === 0 ? '' : field.value}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^\d+$/.test(value)) {
                                    field.onChange(value === '' ? 0 : Number(value));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`familyMembers.${index}.relationship`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-600">Relationship</FormLabel>
                            <FormControl><Input className={inputCls} placeholder="Spouse / Child" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={form.control} name={`familyMembers.${index}.contactNumber`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-600">Phone (Optional)</FormLabel>
                            <FormControl><Input className={inputCls} placeholder="+1 (XXX)..." {...field} value={field.value || ''} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`familyMembers.${index}.email`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-600">Email (Optional)</FormLabel>
                            <FormControl><Input className={inputCls} type="email" placeholder="email@example.com" {...field} value={field.value || ''} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ── Submit ── */}
          <div className="space-y-3 pt-2 pb-4">
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Application...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Submit Membership Application
                </span>
              )}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Already a member?{' '}
              <Link href="/auth/login" className="text-cyan-700 font-semibold hover:text-cyan-600 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

        </form>
      </Form>
    </div>
  );
}
