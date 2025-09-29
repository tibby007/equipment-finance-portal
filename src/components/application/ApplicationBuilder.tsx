'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { DocumentUpload } from './DocumentUpload'

const applicationSchema = z.object({
  // Equipment Details
  equipmentType: z.string().min(2, 'Equipment type is required'),
  equipmentDescription: z.string().min(10, 'Please provide detailed equipment description'),
  equipmentCondition: z.enum(['new', 'used']),
  equipmentCost: z.number().min(1, 'Equipment cost is required'),
  salespersonName: z.string().min(2, 'Salesperson name is required'),

  // Customer Business Information
  businessLegalName: z.string().min(2, 'Business legal name is required'),
  businessDBA: z.string().optional(),
  businessType: z.enum(['llc', 'corporation', 'partnership', 'sole_proprietorship', 'other']),
  taxId: z.string().min(9, 'Tax ID/EIN is required').max(10, 'Invalid Tax ID format'),
  yearsInBusiness: z.number().min(0).max(100),
  industryType: z.string().min(2, 'Industry type is required'),

  // Business Contact & Location
  contactName: z.string().min(2, 'Contact name is required'),
  contactTitle: z.string().min(2, 'Contact title is required'),
  businessAddress: z.string().min(5, 'Business address is required'),
  businessCity: z.string().min(2, 'City is required'),
  businessState: z.string().min(2, 'State is required'),
  businessZip: z.string().min(5, 'ZIP code is required'),
  businessPhone: z.string().min(10, 'Phone number is required'),
  businessEmail: z.string().email('Valid email is required'),
  businessWebsite: z.string().url('Valid website URL').optional().or(z.literal('')),

  // Financial Information
  annualRevenue: z.number().min(1, 'Annual revenue is required'),
  creditScore: z.number().min(300).max(850).optional(),
  bankName: z.string().min(2, 'Bank name is required'),
  bankAccountType: z.enum(['checking', 'savings', 'business_checking']),

  // Deal Structure
  downPayment: z.number().min(0, 'Down payment cannot be negative'),
  desiredTerm: z.number().min(12).max(84, 'Term must be between 12-84 months'),
  monthlyBudget: z.number().min(1, 'Monthly budget is required'),
  endOfTermOption: z.enum(['purchase', 'return', 'upgrade', 'fair_market_value']),

  // Credit Authorization
  creditAuthConsent: z.boolean().refine(val => val === true, 'Credit authorization consent is required'),
  socialSecurityNumber: z.string()
    .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX')
    .refine(val => val.replace(/\D/g, '').length === 9, 'Full 9-digit SSN is required'),
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(val => {
      const date = new Date(val)
      const age = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      return age >= 18 && age <= 100
    }, 'Must be between 18 and 100 years old'),
  creditAuthSignature: z.string().min(2, 'Electronic signature is required'),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface ApplicationBuilderProps {
  prequalData?: {
    customerName: string
    equipmentType: string
    dealAmount: number
    ficoScore: number
    annualRevenue: number
    yearsInBusiness: number
  } | null
}

export function ApplicationBuilder({ prequalData }: ApplicationBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    uploadedAt: Date;
    category: string;
  }[]>([])
  const [documentsValid, setDocumentsValid] = useState(false)
  const { authUser } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      // Equipment Details - Step 1
      equipmentType: prequalData?.equipmentType || '',
      equipmentCost: prequalData?.dealAmount || 0,
      equipmentCondition: 'new',

      // Business Information - Step 2
      businessLegalName: prequalData?.customerName || '',
      yearsInBusiness: prequalData?.yearsInBusiness || 0,
      businessType: 'llc',

      // Financial Information - Step 4
      annualRevenue: prequalData?.annualRevenue || 0,
      creditScore: prequalData?.ficoScore || undefined,
      bankAccountType: 'business_checking',

      // Deal Structure - Step 5
      endOfTermOption: 'purchase',

      // Clear placeholders to prevent data bleeding
      salespersonName: '',
      industryType: '',
      contactName: '',
      businessCity: '',
      businessState: '',
      downPayment: 0,
    },
  })

  const totalSteps = 7
  const stepTitles = [
    'Equipment Details',
    'Business Information',
    'Contact & Location',
    'Financial Information',
    'Deal Structure',
    'Documents & Attachments',
    'Credit Authorization'
  ]

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await trigger(fieldsToValidate)

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number): (keyof ApplicationFormData)[] => {
    switch (step) {
      case 1:
        return ['equipmentType', 'equipmentDescription', 'equipmentCondition', 'equipmentCost', 'salespersonName']
      case 2:
        return ['businessLegalName', 'businessType', 'taxId', 'yearsInBusiness', 'industryType']
      case 3:
        return ['contactName', 'contactTitle', 'businessAddress', 'businessCity', 'businessState', 'businessZip', 'businessPhone', 'businessEmail']
      case 4:
        return ['annualRevenue', 'bankName', 'bankAccountType']
      case 5:
        return ['downPayment', 'desiredTerm', 'monthlyBudget', 'endOfTermOption']
      case 6:
        return [] // No form validation for document upload step
      case 7:
        return ['creditAuthConsent', 'socialSecurityNumber', 'dateOfBirth', 'creditAuthSignature']
      default:
        return []
    }
  }

  const saveAsDraft = async () => {
    setIsDraft(true)
    setLoading(true)

    try {
      const formData = watch()

      // Save to deals table with draft status
      const { error } = await supabase
        .from('deals')
        .insert({
          vendor_id: authUser?.id,
          broker_id: authUser?.userType === 'vendor' ? (authUser.profile as { broker_id?: string }).broker_id : undefined,
          customer_name: formData.businessLegalName || 'Draft Application',
          equipment_type: formData.equipmentType || 'TBD',
          deal_amount: formData.equipmentCost || 0,
          current_stage: 'draft',
          application_data: formData,
        })

      if (error) throw error

      alert('Application saved as draft!')
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Error saving draft. Please try again.')
    } finally {
      setLoading(false)
      setIsDraft(false)
    }
  }

  const onSubmit = async (data: ApplicationFormData) => {
    setLoading(true)

    try {
      // Submit complete application to deals table
      const { data: dealData, error } = await supabase
        .from('deals')
        .insert({
          vendor_id: authUser?.id,
          broker_id: authUser?.userType === 'vendor' ? (authUser.profile as { broker_id?: string }).broker_id : undefined,
          customer_name: data.businessLegalName,
          equipment_type: data.equipmentType,
          deal_amount: data.equipmentCost,
          current_stage: 'application',
          application_data: data,
        })
        .select()
        .single()

      if (error) throw error

      // Insert any uploaded documents
      if (uploadedFiles.length > 0) {
        const documentInserts = uploadedFiles.map(file => ({
          deal_id: dealData.id,
          file_name: file.name,
          file_path: file.url || '',
          file_type: file.type,
          uploaded_by: authUser?.id,
        }))

        await supabase.from('documents').insert(documentInserts)
      }

      // Show success message and redirect
      alert('Thank you! Your application has been submitted to your broker.')
      router.push('/deals')
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Error submitting application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="equipmentType">Equipment Type</Label>
                <Input
                  id="equipmentType"
                  placeholder="e.g., Excavator, Medical Equipment"
                  {...register('equipmentType')}
                />
                {errors.equipmentType && (
                  <p className="text-sm text-red-600">{errors.equipmentType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipmentCondition">Condition</Label>
                <Select onValueChange={(value) => setValue('equipmentCondition', value as 'new' | 'used')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
                {errors.equipmentCondition && (
                  <p className="text-sm text-red-600">{errors.equipmentCondition.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentDescription">Equipment Description</Label>
              <Input
                id="equipmentDescription"
                placeholder="Detailed description of the equipment..."
                {...register('equipmentDescription')}
              />
              {errors.equipmentDescription && (
                <p className="text-sm text-red-600">{errors.equipmentDescription.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="equipmentCost">Equipment Cost ($)</Label>
                <Input
                  id="equipmentCost"
                  type="number"
                  placeholder="75000"
                  {...register('equipmentCost', { valueAsNumber: true })}
                />
                {errors.equipmentCost && (
                  <p className="text-sm text-red-600">{errors.equipmentCost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salespersonName">Salesperson Name</Label>
                <Input
                  id="salespersonName"
                  placeholder="John Smith"
                  {...register('salespersonName')}
                />
                {errors.salespersonName && (
                  <p className="text-sm text-red-600">{errors.salespersonName.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessLegalName">Business Legal Name</Label>
                <Input
                  id="businessLegalName"
                  placeholder="ABC Construction LLC"
                  {...register('businessLegalName')}
                />
                {errors.businessLegalName && (
                  <p className="text-sm text-red-600">{errors.businessLegalName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDBA">DBA (if different)</Label>
                <Input
                  id="businessDBA"
                  placeholder="Optional"
                  {...register('businessDBA')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select onValueChange={(value) => setValue('businessType', value as 'llc' | 'corporation' | 'partnership' | 'sole_proprietorship' | 'other')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.businessType && (
                  <p className="text-sm text-red-600">{errors.businessType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input
                  id="taxId"
                  placeholder="12-3456789"
                  {...register('taxId')}
                />
                {errors.taxId && (
                  <p className="text-sm text-red-600">{errors.taxId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="yearsInBusiness">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  type="number"
                  placeholder="5"
                  {...register('yearsInBusiness', { valueAsNumber: true })}
                />
                {errors.yearsInBusiness && (
                  <p className="text-sm text-red-600">{errors.yearsInBusiness.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industryType">Industry Type</Label>
                <Input
                  id="industryType"
                  placeholder="Construction, Healthcare, Manufacturing"
                  {...register('industryType')}
                />
                {errors.industryType && (
                  <p className="text-sm text-red-600">{errors.industryType.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactName">Primary Contact Name</Label>
                <Input
                  id="contactName"
                  placeholder="John Smith"
                  {...register('contactName')}
                />
                {errors.contactName && (
                  <p className="text-sm text-red-600">{errors.contactName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactTitle">Contact Title</Label>
                <Input
                  id="contactTitle"
                  placeholder="CEO, CFO, Owner"
                  {...register('contactTitle')}
                />
                {errors.contactTitle && (
                  <p className="text-sm text-red-600">{errors.contactTitle.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAddress">Business Address</Label>
              <Input
                id="businessAddress"
                placeholder="123 Main Street"
                {...register('businessAddress')}
              />
              {errors.businessAddress && (
                <p className="text-sm text-red-600">{errors.businessAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessCity">City</Label>
                <Input
                  id="businessCity"
                  placeholder="New York"
                  {...register('businessCity')}
                />
                {errors.businessCity && (
                  <p className="text-sm text-red-600">{errors.businessCity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessState">State</Label>
                <Input
                  id="businessState"
                  placeholder="NY"
                  {...register('businessState')}
                />
                {errors.businessState && (
                  <p className="text-sm text-red-600">{errors.businessState.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessZip">ZIP Code</Label>
                <Input
                  id="businessZip"
                  placeholder="10001"
                  {...register('businessZip')}
                />
                {errors.businessZip && (
                  <p className="text-sm text-red-600">{errors.businessZip.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  placeholder="Enter business phone"
                  {...register('businessPhone')}
                />
                {errors.businessPhone && (
                  <p className="text-sm text-red-600">{errors.businessPhone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  placeholder="contact@business.com"
                  {...register('businessEmail')}
                />
                {errors.businessEmail && (
                  <p className="text-sm text-red-600">{errors.businessEmail.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessWebsite">Business Website (optional)</Label>
              <Input
                id="businessWebsite"
                placeholder="https://www.business.com"
                {...register('businessWebsite')}
              />
              {errors.businessWebsite && (
                <p className="text-sm text-red-600">{errors.businessWebsite.message}</p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="annualRevenue">Annual Revenue ($)</Label>
                <Input
                  id="annualRevenue"
                  type="number"
                  placeholder="500000"
                  {...register('annualRevenue', { valueAsNumber: true })}
                />
                {errors.annualRevenue && (
                  <p className="text-sm text-red-600">{errors.annualRevenue.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditScore">Credit Score (if known)</Label>
                <Input
                  id="creditScore"
                  type="number"
                  placeholder="650"
                  {...register('creditScore', { valueAsNumber: true })}
                />
                {errors.creditScore && (
                  <p className="text-sm text-red-600">{errors.creditScore.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bankName">Primary Bank</Label>
                <Input
                  id="bankName"
                  placeholder="Chase Bank"
                  {...register('bankName')}
                />
                {errors.bankName && (
                  <p className="text-sm text-red-600">{errors.bankName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountType">Account Type</Label>
                <Select onValueChange={(value) => setValue('bankAccountType', value as 'checking' | 'savings' | 'business_checking')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business_checking">Business Checking</SelectItem>
                    <SelectItem value="checking">Personal Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bankAccountType && (
                  <p className="text-sm text-red-600">{errors.bankAccountType.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="downPayment">Down Payment ($)</Label>
                <Input
                  id="downPayment"
                  type="number"
                  placeholder="15000"
                  {...register('downPayment', { valueAsNumber: true })}
                />
                {errors.downPayment && (
                  <p className="text-sm text-red-600">{errors.downPayment.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="desiredTerm">Desired Term (months)</Label>
                <Select onValueChange={(value) => setValue('desiredTerm', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                    <SelectItem value="48">48 months</SelectItem>
                    <SelectItem value="60">60 months</SelectItem>
                    <SelectItem value="72">72 months</SelectItem>
                    <SelectItem value="84">84 months</SelectItem>
                  </SelectContent>
                </Select>
                {errors.desiredTerm && (
                  <p className="text-sm text-red-600">{errors.desiredTerm.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="monthlyBudget">Monthly Payment Budget ($)</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  placeholder="1500"
                  {...register('monthlyBudget', { valueAsNumber: true })}
                />
                {errors.monthlyBudget && (
                  <p className="text-sm text-red-600">{errors.monthlyBudget.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endOfTermOption">End of Term Option</Label>
                <Select onValueChange={(value) => setValue('endOfTermOption', value as 'purchase' | 'fair_market_value' | 'return' | 'upgrade')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Purchase ($1 buyout)</SelectItem>
                    <SelectItem value="fair_market_value">Fair Market Value</SelectItem>
                    <SelectItem value="return">Return Equipment</SelectItem>
                    <SelectItem value="upgrade">Upgrade to Newer Model</SelectItem>
                  </SelectContent>
                </Select>
                {errors.endOfTermOption && (
                  <p className="text-sm text-red-600">{errors.endOfTermOption.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Upload Supporting Documents</h3>
              <p className="text-gray-600">
                Upload invoices, quotes, financial statements, and other supporting documents for your application
              </p>
            </div>
            <DocumentUpload
              onFilesChange={(files) => {
                setUploadedFiles(files)
                console.log('Files uploaded:', files)
              }}
              onValidationChange={(isValid) => {
                setDocumentsValid(isValid)
              }}
            />
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Credit Authorization</h3>
              <p className="text-gray-600">
                We need your authorization to pull your credit report for this application
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notice</h4>
              <p className="text-sm text-yellow-700">
                By providing the information below and checking the consent box, you authorize us to obtain your credit report
                from one or more consumer reporting agencies for the purpose of evaluating your equipment finance application.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="socialSecurityNumber">Social Security Number *</Label>
                <Input
                  id="socialSecurityNumber"
                  type="text"
                  maxLength={11}
                  placeholder="XXX-XX-XXXX"
                  {...register('socialSecurityNumber')}
                  onChange={(e) => {
                    // Auto-format SSN with dashes
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length >= 6) {
                      value = `${value.slice(0,3)}-${value.slice(3,5)}-${value.slice(5,9)}`
                    } else if (value.length >= 4) {
                      value = `${value.slice(0,3)}-${value.slice(3)}`
                    }
                    e.target.value = value
                    // Trigger form validation
                    register('socialSecurityNumber').onChange(e)
                  }}
                />
                {errors.socialSecurityNumber && (
                  <p className="text-sm text-red-600">{errors.socialSecurityNumber.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Required for credit authorization and verification
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditAuthSignature">Electronic Signature *</Label>
              <Input
                id="creditAuthSignature"
                placeholder="Type your full legal name to sign electronically"
                {...register('creditAuthSignature')}
              />
              {errors.creditAuthSignature && (
                <p className="text-sm text-red-600">{errors.creditAuthSignature.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="creditAuthConsent"
                  {...register('creditAuthConsent')}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="creditAuthConsent" className="text-sm font-medium">
                    I authorize the credit pull *
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    I hereby authorize the broker and/or lending partners to obtain my consumer credit report
                    and use this information in connection with this equipment finance application. I understand
                    that this may result in an inquiry being added to my credit report.
                  </p>
                </div>
              </div>
              {errors.creditAuthConsent && (
                <p className="text-sm text-red-600">{errors.creditAuthConsent.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Privacy Notice:</strong> Your personal information will be handled in accordance with
                applicable privacy laws and will only be used for the purpose of processing your equipment
                finance application.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">📝</span>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Equipment Finance Application</CardTitle>
            <CardDescription className="text-gray-600">
              Complete application for equipment financing
            </CardDescription>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${step === currentStep
                  ? 'bg-gradient-to-r from-green-600 to-orange-600 text-white'
                  : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }
              `}>
                {step < currentStep ? '✓' : step}
              </div>
              {step < totalSteps && (
                <div className={`w-8 h-1 mx-1 ${step < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Step {currentStep}: {stepTitles[currentStep - 1]}
          </h2>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {renderStep()}

          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6"
            >
              ← Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={saveAsDraft}
              disabled={loading}
              className="text-gray-600 hover:text-gray-900"
            >
              {isDraft ? 'Saving...' : 'Save as Draft'}
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white px-6"
              >
                Next →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !documentsValid}
                className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white px-6 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : !documentsValid ? 'Upload Equipment Invoice to Submit' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}