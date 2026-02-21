export interface DocumentRequirement {
  id: string;
  label: string;
  description: string;
  required: boolean;
  forLoanAmount?: number;
  forRiskLevel?: string[];
  forCourtCase?: boolean;
  icon: string;
  color: string;
}

export const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  {
    id: 'national_id',
    label: 'National ID (NIDA)',
    description: 'Clear copy of National Identification card',
    required: true,
    icon: 'id',
    color: 'blue'
  },
  {
    id: 'passport_photo',
    label: 'Passport Photo',
    description: 'Recent passport-sized photograph',
    required: true,
    icon: 'camera',
    color: 'green'
  },
  {
    id: 'bank_statement',
    label: 'Bank Statement',
    description: 'Last 3 months bank statements',
    required: true,
    icon: 'landmark',
    color: 'purple'
  },
  {
    id: 'salary_slip',
    label: 'Salary Slip',
    description: 'Most recent salary slip (if employed)',
    required: false,
    forLoanAmount: 5000000,
    icon: 'briefcase',
    color: 'amber'
  },
  {
    id: 'employment_letter',
    label: 'Employment Letter',
    description: 'Letter of employment from employer',
    required: false,
    forLoanAmount: 3000000,
    icon: 'file-text',
    color: 'indigo'
  },
  {
    id: 'mdhamini_letter',
    label: 'Mdhamini Letter (Guarantor)',
    description: 'Guarantor letter with their contact and ID',
    required: false,
    forLoanAmount: 7000000,
    forRiskLevel: ['high', 'critical'],
    icon: 'users',
    color: 'pink'
  },
  {
    id: 'business_license',
    label: 'Business License',
    description: 'For business owners - business registration',
    required: false,
    icon: 'file-signature',
    color: 'orange'
  },
  {
    id: 'tax_clearance',
    label: 'Tax Clearance (TIN)',
    description: 'TIN certificate or tax clearance',
    required: false,
    icon: 'file-check',
    color: 'teal'
  },
  {
    id: 'court_document',
    label: 'Court Order',
    description: 'If applicable - court judgment or settlement agreement',
    required: false,
    forCourtCase: true,
    icon: 'gavel',
    color: 'red'
  }
];

export function getRequiredDocuments(
  loanAmount?: number,
  riskLevel?: string,
  hasCourtCase?: boolean
): DocumentRequirement[] {
  return DOCUMENT_REQUIREMENTS.filter(doc => {
    if (doc.required) return true;
    if (doc.forCourtCase && hasCourtCase) return true;
    if (doc.forLoanAmount && loanAmount && loanAmount >= doc.forLoanAmount) return true;
    if (doc.forRiskLevel && riskLevel && doc.forRiskLevel.includes(riskLevel)) return true;
    return false;
  });
}
