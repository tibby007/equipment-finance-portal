'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const prequalificationSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  equipmentType: z.string().min(2, 'Equipment type is required'),
  dealAmount: z.number().min(1, 'Deal amount must be greater than 0'),
  ficoScore: z.number().min(300).max(850),
  yearsInBusiness: z.number().min(0).max(100),
  hasPublicRecords: z.enum(['yes', 'no']),
  annualRevenue: z.number().min(0),
})

type PrequalificationFormData = z.infer<typeof prequalificationSchema>

interface PrequalificationResult {
  score: 'green' | 'yellow' | 'red'
  title: string
  message: string
  factors: string[]
  canProceed: boolean
}

export function PrequalificationTool() {
  const [result, setResult] = useState<PrequalificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PrequalificationFormData | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PrequalificationFormData>({
    resolver: zodResolver(prequalificationSchema),
  })

  const calculateScore = (data: PrequalificationFormData): PrequalificationResult => {
    const factors: string[] = []
    let greenCriteria = 0
    let redFlags = 0

    // Check FICO Score
    if (data.ficoScore >= 640) {
      greenCriteria++
      factors.push('✓ FICO score meets requirements (640+)')
    } else if (data.ficoScore >= 600) {
      factors.push('⚠ FICO score is close to requirements (640+)')
    } else {
      redFlags++
      factors.push('✗ FICO score below requirements (640+)')
    }

    // Check Years in Business
    if (data.yearsInBusiness >= 2) {
      greenCriteria++
      factors.push('✓ Business established 2+ years')
    } else if (data.yearsInBusiness >= 1) {
      factors.push('⚠ Business close to 2 year requirement')
    } else {
      redFlags++
      factors.push('✗ Business needs 2+ years of operation')
    }

    // Check Public Records
    if (data.hasPublicRecords === 'no') {
      greenCriteria++
      factors.push('✓ No public records found')
    } else {
      redFlags++
      factors.push('✗ Public records present')
    }

    // Check Annual Revenue
    if (data.annualRevenue >= 120000) {
      greenCriteria++
      factors.push('✓ Annual revenue meets requirements ($120K+)')
    } else if (data.annualRevenue >= 100000) {
      factors.push('⚠ Annual revenue close to requirements ($120K+)')
    } else {
      redFlags++
      factors.push('✗ Annual revenue below requirements ($120K+)')
    }

    // Check Deal Amount
    if (data.dealAmount <= 100000) {
      greenCriteria++
      factors.push('✓ Deal amount within limits (≤$100K)')
    } else if (data.dealAmount <= 150000) {
      factors.push('⚠ Deal amount slightly above preferred limit ($100K)')
    } else {
      redFlags++
      factors.push('✗ Deal amount significantly above limit ($100K)')
    }

    // Determine final score
    if (greenCriteria === 5) {
      return {
        score: 'green',
        title: 'Pre-Approved! 🎉',
        message: 'This deal meets all prequalification criteria and is highly likely to be approved.',
        factors,
        canProceed: true
      }
    } else if (redFlags >= 2 || data.ficoScore < 600 || data.dealAmount > 150000) {
      return {
        score: 'red',
        title: 'Manual Review Required',
        message: 'This deal falls outside standard parameters but can still be submitted for manual underwriting review.',
        factors,
        canProceed: true
      }
    } else {
      return {
        score: 'yellow',
        title: 'Conditional Approval Possible',
        message: 'This deal is close to meeting criteria. Additional documentation or conditions may be required.',
        factors,
        canProceed: true
      }
    }
  }

  const onSubmit = async (data: PrequalificationFormData) => {
    setLoading(true)
    setFormData(data)
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))

    const score = calculateScore(data)
    setResult(score)
    setLoading(false)
  }

  const proceedToApplication = () => {
    if (formData) {
      const prequalData = {
        customerName: formData.customerName,
        equipmentType: formData.equipmentType,
        dealAmount: formData.dealAmount,
        ficoScore: formData.ficoScore,
        annualRevenue: formData.annualRevenue,
        yearsInBusiness: formData.yearsInBusiness
      }

      const encodedData = encodeURIComponent(JSON.stringify(prequalData))
      router.push(`/application?prequalData=${encodedData}`)
    }
  }

  const resetForm = () => {
    setResult(null)
  }

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'green': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'yellow': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
      case 'red': return 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  if (result) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">✓</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{result.title}</CardTitle>
          <Badge className={`${getScoreColor(result.score)} text-lg px-6 py-2 font-bold shadow-lg`}>
            {result.score.toUpperCase()} LIGHT
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 leading-relaxed">{result.message}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Evaluation Factors:</h3>
            <div className="space-y-2">
              {result.factors.map((factor, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                  <span className="text-sm text-gray-700">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {result.canProceed && (
              <Button
                size="lg"
                onClick={proceedToApplication}
                className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Proceed to Application
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={resetForm}
              className="border-2 border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 rounded-lg transition-all duration-200"
            >
              New Prequalification
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="space-y-3 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">🎯</span>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Deal Prequalification Tool</CardTitle>
            <CardDescription className="text-gray-600">
              Get instant red/yellow/green scoring based on underwriting criteria
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-gray-700 font-medium">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg h-11"
                {...register('customerName')}
              />
              {errors.customerName && (
                <p className="text-sm text-red-600">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentType" className="text-gray-700 font-medium">Equipment Type</Label>
              <Input
                id="equipmentType"
                placeholder="e.g., Construction Equipment, Medical Equipment"
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg h-11"
                {...register('equipmentType')}
              />
              {errors.equipmentType && (
                <p className="text-sm text-red-600">{errors.equipmentType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dealAmount" className="text-gray-700 font-medium">Deal Amount ($)</Label>
              <Input
                id="dealAmount"
                type="number"
                placeholder="75000"
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg h-11"
                {...register('dealAmount', { valueAsNumber: true })}
              />
              {errors.dealAmount && (
                <p className="text-sm text-red-600">{errors.dealAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ficoScore" className="text-gray-700 font-medium">Customer FICO Score</Label>
              <Input
                id="ficoScore"
                type="number"
                placeholder="650"
                min="300"
                max="850"
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg h-11"
                {...register('ficoScore', { valueAsNumber: true })}
              />
              {errors.ficoScore && (
                <p className="text-sm text-red-600">{errors.ficoScore.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsInBusiness" className="text-gray-700 font-medium">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                placeholder="3"
                min="0"
                max="100"
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg h-11"
                {...register('yearsInBusiness', { valueAsNumber: true })}
              />
              {errors.yearsInBusiness && (
                <p className="text-sm text-red-600">{errors.yearsInBusiness.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasPublicRecords" className="text-gray-700 font-medium">Public Records</Label>
              <Select onValueChange={(value) => setValue('hasPublicRecords', value as 'yes' | 'no')}>
                <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg h-11">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No Public Records</SelectItem>
                  <SelectItem value="yes">Public Records Present</SelectItem>
                </SelectContent>
              </Select>
              {errors.hasPublicRecords && (
                <p className="text-sm text-red-600">{errors.hasPublicRecords.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualRevenue" className="text-gray-700 font-medium">Annual Revenue ($)</Label>
            <Input
              id="annualRevenue"
              type="number"
              placeholder="150000"
              className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg h-11"
              {...register('annualRevenue', { valueAsNumber: true })}
            />
            {errors.annualRevenue && (
              <p className="text-sm text-red-600">{errors.annualRevenue.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Get Prequalification Score</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}