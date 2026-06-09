export const EDUCATION_COMPLETION_STATUS = {
  completed: 'Completed',
  partially_completed: 'Partially Completed',
  discontinued: 'Discontinued',
  in_progress: 'In Progress'
}

export const educationCompletionStatusOptions = [
  { value: 'completed', label: 'Completed' },
  { value: 'partially_completed', label: 'Partially Completed' },
  { value: 'discontinued', label: 'Discontinued' }
]

const degree = (value, label = value) => ({ value, label })

export const EDUCATION_CATEGORIES = [
  {
    value: 'secondary_school',
    group: 'School Education',
    label: 'School (Up to 10th)',
    institutionLabel: 'School',
    institutionPlaceholder: 'Ex: ZPHS Veerannapet, Delhi Public School, KV',
    durationHint: 'Primary and secondary school up to 10th standard',
    degreeLabel: 'Class / Standard',
    degreeRequired: true,
    showFieldOfStudy: false,
    gradePlaceholder: 'Ex: 85%, 9.2 GPA, First Class',
    degrees: [
      degree('1st Standard'),
      degree('2nd Standard'),
      degree('3rd Standard'),
      degree('4th Standard'),
      degree('5th Standard'),
      degree('6th Standard'),
      degree('7th Standard'),
      degree('8th Standard'),
      degree('9th Standard'),
      degree('10th / SSC / Matriculation'),
      degree('CBSE 10th'),
      degree('ICSE 10th'),
      degree('State Board 10th'),
      degree('NIOS 10th')
    ]
  },
  {
    value: 'intermediate',
    group: 'School Education',
    label: 'Intermediate / 11th–12th (2 Years)',
    institutionLabel: 'Junior College / School',
    institutionPlaceholder: 'Ex: Narayana Junior College, Sri Chaitanya, FIITJEE College',
    durationHint: '2-year higher secondary program after 10th',
    degreeLabel: 'Program',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Stream / Group',
    fieldOfStudyPlaceholder: 'Ex: MPC, BiPC, CEC, Commerce, Vocational',
    gradePlaceholder: 'Ex: 92%, 950/1000, First Class',
    degrees: [
      degree('Intermediate (MPC)'),
      degree('Intermediate (BiPC)'),
      degree('Intermediate (CEC)'),
      degree('Intermediate (MEC)'),
      degree('Intermediate (Commerce)'),
      degree('Intermediate (Arts / Humanities)'),
      degree('Intermediate (Vocational)'),
      degree('12th / HSC'),
      degree('CBSE 12th'),
      degree('ISC 12th'),
      degree('State Board 12th'),
      degree('NIOS 12th'),
      degree('IB Diploma'),
      degree('A-Level')
    ]
  },
  {
    value: 'iti_vocational',
    group: 'Skill & Vocational',
    label: 'ITI / Vocational Training',
    institutionLabel: 'ITI / Training Centre',
    institutionPlaceholder: 'Ex: Government ITI, NSDC Training Partner',
    durationHint: 'Short-term trade or vocational skill training',
    degreeLabel: 'Trade / Course',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Trade / Skill',
    fieldOfStudyPlaceholder: 'Ex: Electrician, Fitter, Welder, COPA',
    gradePlaceholder: 'Ex: Pass, Distinction, Grade A',
    degrees: [
      degree('ITI Trade Certificate'),
      degree('NSDC Skill Certificate'),
      degree('PMKVY Certification'),
      degree('Vocational Training Certificate'),
      degree('Apprenticeship Training')
    ]
  },
  {
    value: 'diploma',
    group: 'Skill & Vocational',
    label: 'Diploma (2–3 Years)',
    institutionLabel: 'Polytechnic / Institute',
    institutionPlaceholder: 'Ex: Government Polytechnic, NTTF, NIIT',
    durationHint: 'Diploma after 10th or 12th — typically 2 to 3 years',
    degreeLabel: 'Diploma Type',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Specialization / Branch',
    fieldOfStudyPlaceholder: 'Ex: Mechanical, Civil, ECE, CSE',
    gradePlaceholder: 'Ex: 8.5 CGPA, 75%, Distinction',
    degrees: [
      degree('Diploma in Engineering'),
      degree('Polytechnic Diploma'),
      degree('Diploma in Computer Engineering'),
      degree('Diploma in Mechanical Engineering'),
      degree('Diploma in Civil Engineering'),
      degree('Diploma in Electrical Engineering'),
      degree('Diploma in Electronics & Communication'),
      degree('Diploma in Automobile Engineering'),
      degree('Diploma in Pharmacy (D.Pharm)'),
      degree('Diploma in Education (D.Ed)'),
      degree('Diploma in Nursing (GNM)'),
      degree('Diploma in Hotel Management'),
      degree('Diploma in Agriculture'),
      degree('Diploma in Fashion Designing'),
      degree('Diploma in Interior Designing'),
      degree('Advanced Diploma'),
      degree('Post Diploma')
    ]
  },
  {
    value: 'btech_engineering',
    group: 'Undergraduate',
    label: 'B.Tech / B.E. (Engineering)',
    institutionLabel: 'College / University',
    institutionPlaceholder: 'Ex: JNTU, IIT, NIT, VIT, Anna University',
    durationHint: '4-year engineering undergraduate program',
    degreeLabel: 'Engineering Degree',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Branch / Specialization',
    fieldOfStudyPlaceholder: 'Ex: CSE, ECE, Mechanical, Civil, AI & ML',
    gradePlaceholder: 'Ex: 8.2 CGPA, 72%, First Class with Distinction',
    degrees: [
      degree('B.Tech'),
      degree('B.E.'),
      degree('B.Tech (Hons)'),
      degree('B.E. (Hons)'),
      degree('B.Tech (Lateral Entry)'),
      degree('B.Tech + M.Tech (Integrated)'),
      degree('B.Tech (AI & Data Science)'),
      degree('B.Tech (Computer Science)'),
      degree('B.Tech (Information Technology)'),
      degree('B.Tech (Electronics & Communication)'),
      degree('B.Tech (Electrical Engineering)'),
      degree('B.Tech (Mechanical Engineering)'),
      degree('B.Tech (Civil Engineering)'),
      degree('B.Tech (Aerospace Engineering)'),
      degree('B.Tech (Biotechnology)'),
      degree('B.Tech (Chemical Engineering)'),
      degree('B.Tech (Automobile Engineering)'),
      degree('B.Tech (Robotics & Automation)')
    ]
  },
  {
    value: 'bachelors_degree',
    group: 'Undergraduate',
    label: "Bachelor's Degree (General)",
    institutionLabel: 'College / University',
    institutionPlaceholder: 'Ex: Delhi University, Osmania University, Bangalore University',
    durationHint: '3–4 year general bachelor degree programs',
    degreeLabel: 'Degree',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Field of Study / Major',
    fieldOfStudyPlaceholder: 'Ex: Physics, Commerce, Economics, Psychology',
    gradePlaceholder: 'Ex: 8.0 CGPA, 70%, First Class',
    degrees: [
      degree('B.Sc'),
      degree('B.Sc (Hons)'),
      degree('B.Com'),
      degree('B.Com (Hons)'),
      degree('B.A'),
      degree('B.A (Hons)'),
      degree('BBA'),
      degree('BCA'),
      degree('BMS'),
      degree('BFA'),
      degree('BHM'),
      degree('BVA'),
      degree('BSW'),
      degree('B.Lib.I.Sc'),
      degree('B.Stat'),
      degree('B.Des'),
      degree('BPA'),
      degree('B.Voc'),
      degree('B.Sc Agriculture'),
      degree('B.Sc Nursing'),
      degree('B.Sc Biotechnology'),
      degree('B.Sc Computer Science'),
      degree('B.Sc Mathematics'),
      degree('B.Sc Physics'),
      degree('B.Sc Chemistry'),
      degree('B.Sc Microbiology'),
      degree('B.Sc Forestry'),
      degree('B.Sc Home Science')
    ]
  },
  {
    value: 'professional_ug',
    group: 'Undergraduate',
    label: 'Professional Degree (UG)',
    institutionLabel: 'College / University',
    institutionPlaceholder: 'Ex: AIIMS, NALSAR, SPA, NIPER',
    durationHint: 'Professional undergraduate programs — medical, law, pharmacy, etc.',
    degreeLabel: 'Professional Degree',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Specialization',
    fieldOfStudyPlaceholder: 'Ex: General Medicine, Corporate Law, Architecture',
    gradePlaceholder: 'Ex: Pass, Distinction, University rank',
    degrees: [
      degree('MBBS'),
      degree('BDS'),
      degree('BAMS'),
      degree('BHMS'),
      degree('BUMS'),
      degree('B.Pharm'),
      degree('Pharm.D'),
      degree('BPT'),
      degree('B.Sc MLT'),
      degree('B.Sc Radiology'),
      degree('B.Optom'),
      degree('BVSc & AH'),
      degree('B.Arch'),
      degree('B.Plan'),
      degree('B.Des (Professional)'),
      degree('LLB'),
      degree('BA LLB'),
      degree('BBA LLB'),
      degree('B.Com LLB'),
      degree('B.Ed'),
      degree('B.P.Ed'),
      degree('BFA (Professional)'),
      degree('BHMCT'),
      degree('BFA Aviation')
    ]
  },
  {
    value: 'associate_degree',
    group: 'Undergraduate',
    label: 'Associate / Foundation Degree',
    institutionLabel: 'College / Institute',
    institutionPlaceholder: 'Ex: Community college, foundation program institute',
    durationHint: '1–2 year associate or foundation programs',
    degreeLabel: 'Qualification',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Area of Study',
    fieldOfStudyPlaceholder: 'Ex: Business, Engineering foundation',
    gradePlaceholder: 'Ex: GPA, percentage, pass grade',
    degrees: [
      degree('Associate Degree'),
      degree('Associate of Arts (AA)'),
      degree('Associate of Science (AS)'),
      degree('Associate of Applied Science (AAS)'),
      degree('Foundation Year'),
      degree('Diploma to Degree Pathway')
    ]
  },
  {
    value: 'mtech_engineering',
    group: 'Postgraduate',
    label: 'M.Tech / M.E. (Engineering PG)',
    institutionLabel: 'College / University',
    institutionPlaceholder: 'Ex: IIT, NIT, JNTU, BITS',
    durationHint: '2-year postgraduate engineering program',
    degreeLabel: 'Engineering Degree',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Specialization / Branch',
    fieldOfStudyPlaceholder: 'Ex: VLSI, Structural Engineering, Data Science',
    gradePlaceholder: 'Ex: 8.8 CGPA, Distinction',
    degrees: [
      degree('M.Tech'),
      degree('M.E.'),
      degree('M.Tech (Hons)'),
      degree('M.Tech (Computer Science)'),
      degree('M.Tech (Data Science)'),
      degree('M.Tech (Artificial Intelligence)'),
      degree('M.Tech (VLSI Design)'),
      degree('M.Tech (Power Systems)'),
      degree('M.Tech (Structural Engineering)'),
      degree('M.Tech (Thermal Engineering)'),
      degree('M.Tech (Cyber Security)'),
      degree('M.Tech (Embedded Systems)'),
      degree('M.E. (Design Engineering)'),
      degree('M.E. (Manufacturing Engineering)')
    ]
  },
  {
    value: 'masters_degree',
    group: 'Postgraduate',
    label: "Master's Degree (General)",
    institutionLabel: 'College / University',
    institutionPlaceholder: 'Ex: University of Hyderabad, TISS, IIM (non-MBA)',
    durationHint: '2-year master degree after graduation',
    degreeLabel: 'Degree',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Field of Study / Specialization',
    fieldOfStudyPlaceholder: 'Ex: Finance, Psychology, Physics',
    gradePlaceholder: 'Ex: 8.5 CGPA, 75%, Distinction',
    degrees: [
      degree('M.Sc'),
      degree('M.Com'),
      degree('M.A'),
      degree('MBA'),
      degree('PGDM'),
      degree('MCA'),
      degree('MFA'),
      degree('MSW'),
      degree('M.Lib.I.Sc'),
      degree('M.Stat'),
      degree('M.Des'),
      degree('M.H.M'),
      degree('M.Voc'),
      degree('M.Sc Data Science'),
      degree('M.Sc Biotechnology'),
      degree('M.Sc Computer Science'),
      degree('M.Sc Mathematics'),
      degree('M.Sc Physics'),
      degree('M.Sc Chemistry'),
      degree('M.Sc Microbiology'),
      degree('Executive MBA'),
      degree('Online MBA')
    ]
  },
  {
    value: 'professional_pg',
    group: 'Postgraduate',
    label: 'Professional Degree (PG)',
    institutionLabel: 'College / University / Institute',
    institutionPlaceholder: 'Ex: AIIMS, NLU, SPA, NIPER',
    durationHint: 'Postgraduate professional programs — MD, MS, LLM, etc.',
    degreeLabel: 'Professional Degree',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Specialization',
    fieldOfStudyPlaceholder: 'Ex: Cardiology, Tax Law, Urban Planning',
    gradePlaceholder: 'Ex: Pass, Distinction, University rank',
    degrees: [
      degree('MD'),
      degree('MS'),
      degree('MDS'),
      degree('DM'),
      degree('MCh'),
      degree('DNB'),
      degree('M.Pharm'),
      degree('MPT'),
      degree('M.Sc Nursing'),
      degree('MHA'),
      degree('MPH'),
      degree('LLM'),
      degree('M.Arch'),
      degree('M.Plan'),
      degree('M.Ed'),
      degree('M.P.Ed'),
      degree('CA (Chartered Accountant)'),
      degree('CS (Company Secretary)'),
      degree('CMA (Cost & Management Accountant)'),
      degree('CFA'),
      degree('ACCA')
    ]
  },
  {
    value: 'doctorate',
    group: 'Research & Doctorate',
    label: 'Doctorate / Ph.D.',
    institutionLabel: 'University / Research Institute',
    institutionPlaceholder: 'Ex: University of Hyderabad, IISc, TIFR',
    durationHint: 'Doctoral or postdoctoral research program',
    degreeLabel: 'Degree',
    degreeRequired: true,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Research Area',
    fieldOfStudyPlaceholder: 'Ex: Artificial Intelligence, Biotechnology, Economics',
    gradePlaceholder: 'Ex: Thesis grade, coursework CGPA',
    degrees: [
      degree('Ph.D.'),
      degree('D.Phil'),
      degree('D.Sc'),
      degree('D.Litt'),
      degree('EngD'),
      degree('Postdoctoral Fellowship'),
      degree('Post Doctoral Research')
    ]
  },
  {
    value: 'certificate',
    group: 'Certifications',
    label: 'Certificate / Professional Course',
    institutionLabel: 'Institute / Platform',
    institutionPlaceholder: 'Ex: NPTEL, Coursera, Google, Microsoft, AWS',
    durationHint: 'Short-term certification or professional upskilling course',
    degreeLabel: 'Course / Certificate',
    degreeRequired: false,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Subject Area',
    fieldOfStudyPlaceholder: 'Ex: Cloud Computing, Digital Marketing, Python',
    gradePlaceholder: 'Ex: Grade A, 95%, Pass with Merit',
    degrees: [
      degree('Professional Certificate'),
      degree('Online Certification'),
      degree('Vocational Certificate'),
      degree('Industry Certification'),
      degree('Google Career Certificate'),
      degree('Microsoft Certification'),
      degree('AWS Certification'),
      degree('Cisco Certification'),
      degree('NPTEL Certification'),
      degree('Coursera Certificate'),
      degree('Udemy Certificate'),
      degree('Bootcamp Certificate')
    ]
  },
  {
    value: 'other',
    group: 'Other',
    label: 'Other Qualification',
    institutionLabel: 'Institution',
    institutionPlaceholder: 'Ex: Training institute, open university',
    durationHint: 'Any qualification not listed above',
    degreeLabel: 'Qualification',
    degreeRequired: false,
    showFieldOfStudy: true,
    fieldOfStudyLabel: 'Field of Study',
    fieldOfStudyPlaceholder: 'Ex: Subject or specialization',
    gradePlaceholder: 'Ex: Score or grade',
    degrees: []
  }
]

export const DEGREE_OTHER_VALUE = '__other__'

const ENGINEERING_BRANCHES = [
  'Computer Science Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Automobile Engineering',
  'Biotechnology',
  'AI & Machine Learning',
  'Data Science',
  'Cyber Security',
  'Robotics & Automation',
  'Internet of Things (IoT)',
  'VLSI Design',
  'Structural Engineering',
  'Power Systems',
  'Thermal Engineering',
  'Embedded Systems'
]

const CATEGORY_FORM_META = {
  secondary_school: {
    formMode: 'class',
    detailLabel: 'Class / Standard',
    detailRequired: true,
    detailPlaceholder: 'Select your class'
  },
  intermediate: {
    formMode: 'specialization',
    shortDegree: 'Intermediate',
    detailLabel: 'Stream / Group',
    detailRequired: true,
    detailPlaceholder: 'Ex: MPC, BiPC, Commerce',
    specializations: [
      'MPC (Maths, Physics, Chemistry)',
      'BiPC (Biology, Physics, Chemistry)',
      'CEC (Commerce, Economics, Civics)',
      'MEC (Maths, Economics, Commerce)',
      'Commerce',
      'Arts / Humanities',
      'Vocational'
    ]
  },
  iti_vocational: {
    formMode: 'specialization',
    shortDegree: 'ITI / Vocational',
    detailLabel: 'Trade / Skill',
    detailRequired: true,
    detailPlaceholder: 'Ex: Electrician, Fitter, Welder',
    specializations: [
      'Electrician',
      'Fitter',
      'Welder',
      'Mechanic (Motor Vehicle)',
      'COPA (Computer Operator)',
      'Electronics Mechanic',
      'Plumber',
      'Carpenter',
      'Turner',
      'Machinist'
    ]
  },
  diploma: {
    formMode: 'specialization',
    shortDegree: 'Diploma',
    detailLabel: 'Branch / Specialization',
    detailRequired: true,
    detailPlaceholder: 'Ex: Mechanical, Civil, CSE',
    specializations: [
      'Computer Science Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
      'Electronics & Communication',
      'Automobile Engineering',
      'Chemical Engineering',
      'Pharmacy (D.Pharm)',
      'Nursing (GNM)',
      'Hotel Management',
      'Agriculture',
      'Fashion Designing'
    ]
  },
  btech_engineering: {
    formMode: 'specialization',
    shortDegree: 'B.Tech',
    detailLabel: 'Branch / Specialization',
    detailRequired: false,
    detailPlaceholder: 'Ex: CSE, ECE, Mechanical',
    specializations: ENGINEERING_BRANCHES
  },
  bachelors_degree: {
    formMode: 'program',
    detailLabel: 'Degree / Program',
    detailRequired: true,
    detailPlaceholder: 'Ex: B.Sc, B.Com, B.A',
    showOptionalMajor: true,
    majorLabel: 'Major / Subject',
    majorPlaceholder: 'Ex: Physics, Commerce, Economics'
  },
  professional_ug: {
    formMode: 'program',
    detailLabel: 'Professional Degree',
    detailRequired: true,
    detailPlaceholder: 'Ex: MBBS, LLB, B.Arch'
  },
  associate_degree: {
    formMode: 'program',
    detailLabel: 'Qualification',
    detailRequired: true,
    detailPlaceholder: 'Ex: Associate Degree, Foundation Year'
  },
  mtech_engineering: {
    formMode: 'specialization',
    shortDegree: 'M.Tech',
    detailLabel: 'Specialization / Branch',
    detailRequired: false,
    detailPlaceholder: 'Ex: VLSI, Structural Engineering',
    specializations: ENGINEERING_BRANCHES
  },
  masters_degree: {
    formMode: 'program',
    detailLabel: 'Degree / Program',
    detailRequired: true,
    detailPlaceholder: 'Ex: M.Sc, MBA, MCA',
    showOptionalMajor: true,
    majorLabel: 'Specialization / Subject',
    majorPlaceholder: 'Ex: Finance, Data Science, Psychology'
  },
  professional_pg: {
    formMode: 'program',
    detailLabel: 'Professional Degree',
    detailRequired: true,
    detailPlaceholder: 'Ex: MD, LLM, CA',
    showOptionalMajor: true,
    majorLabel: 'Specialization',
    majorPlaceholder: 'Ex: Cardiology, Tax Law'
  },
  doctorate: {
    formMode: 'specialization',
    shortDegree: 'Ph.D.',
    detailLabel: 'Research Area',
    detailRequired: false,
    detailPlaceholder: 'Ex: Artificial Intelligence, Biotechnology',
    specializations: [
      'Computer Science',
      'Artificial Intelligence',
      'Biotechnology',
      'Physics',
      'Chemistry',
      'Economics',
      'Management',
      'Education',
      'Postdoctoral Research'
    ]
  },
  certificate: {
    formMode: 'optional_subject',
    shortDegree: 'Certificate',
    detailLabel: 'Course / Subject Area',
    detailRequired: false,
    detailPlaceholder: 'Ex: Cloud Computing, Python, Digital Marketing',
    specializations: [
      'Cloud Computing',
      'Data Science',
      'Python Programming',
      'Digital Marketing',
      'Cyber Security',
      'AWS Certification',
      'Google Career Certificate',
      'Microsoft Certification'
    ]
  },
  other: {
    formMode: 'qualification',
    detailLabel: 'Qualification Name',
    detailRequired: true,
    detailPlaceholder: 'Enter your qualification'
  }
}

const LEGACY_CATEGORY_MAP = {
  '7th Grade': 'secondary_school',
  '10th Grade': 'secondary_school',
  '12th Grade': 'intermediate',
  '12th Grade / Intermediate': 'intermediate',
  'Diploma / Vocational Training': 'diploma',
  'Associate Degree': 'associate_degree',
  "Bachelor's Degree / Graduation": 'bachelors_degree',
  'Undergraduate Degree': 'bachelors_degree',
  "Master's Degree / Post Graduation": 'masters_degree',
  'Postgraduate Degree': 'masters_degree',
  'Doctorate (Ph.D.)': 'doctorate',
  'Professional Degree (MD, JD, etc.)': 'professional_pg',
  'Certificate Course': 'certificate',
  'Postdoctoral Fellowship': 'doctorate',
  Other: 'other'
}

const DEGREE_CATEGORY_MAP = {
  'B.Tech': 'btech_engineering',
  'B.E.': 'btech_engineering',
  'B.Tech (Hons)': 'btech_engineering',
  'B.E. (Hons)': 'btech_engineering',
  'M.Tech': 'mtech_engineering',
  'M.E.': 'mtech_engineering',
  MBBS: 'professional_ug',
  BDS: 'professional_ug',
  'B.Pharm': 'professional_ug',
  'B.Arch': 'professional_ug',
  LLB: 'professional_ug',
  'BA LLB': 'professional_ug',
  'BBA LLB': 'professional_ug',
  MD: 'professional_pg',
  MS: 'professional_pg',
  MBA: 'masters_degree',
  PGDM: 'masters_degree',
  MCA: 'masters_degree',
  'Ph.D.': 'doctorate'
}

export const educationLevelOptions = EDUCATION_CATEGORIES.map(category => category.label)

export const educationCategoryGroups = [...new Set(EDUCATION_CATEGORIES.map(category => category.group))]

export function getEducationCategoriesByGroup() {
  return educationCategoryGroups.map(group => ({
    group,
    categories: EDUCATION_CATEGORIES.filter(category => category.group === group)
  }))
}

export function getEducationCategoryConfig(categoryValue) {
  const category = EDUCATION_CATEGORIES.find(item => item.value === categoryValue) || EDUCATION_CATEGORIES.at(-1)
  const formMeta = CATEGORY_FORM_META[category.value] || {}

  return { ...category, ...formMeta }
}

export function getEducationDetailOptions(categoryValue) {
  const config = getEducationCategoryConfig(categoryValue)

  if (config.formMode === 'class' || config.formMode === 'program') {
    return config.degrees.map(option => option.label)
  }

  if (config.specializations?.length) {
    return config.specializations
  }

  return []
}

export function mapEducationToFormDetail(education = {}) {
  const category = resolveEducationCategory(education)
  const config = getEducationCategoryConfig(category)

  switch (config.formMode) {
    case 'class':
    case 'program':
    case 'qualification':
      return education.degree || ''
    case 'specialization':
    case 'optional_subject':
      if (education.fieldOfStudy) return education.fieldOfStudy
      if (education.degree && education.degree !== config.shortDegree) {
        return (
          education.degree
            .replace(new RegExp(`^${(config.shortDegree || '').replace('.', '\\.')}\\s*[-—(]?`, 'i'), '')
            .replace(/\)$/, '')
            .trim() || education.degree
        )
      }
      return ''
    default:
      return education.fieldOfStudy || education.degree || ''
  }
}

export function mapEducationToFormMajor(education = {}) {
  const category = resolveEducationCategory(education)
  const config = getEducationCategoryConfig(category)

  if (config.formMode === 'program' && config.showOptionalMajor) {
    return education.fieldOfStudy || ''
  }

  return ''
}

export const EDUCATION_GRADE_TYPES = [
  {
    value: 'cgpa',
    label: 'CGPA',
    defaultTotal: '10',
    obtainedLabel: 'CGPA obtained',
    totalLabel: 'Total CGPA',
    obtainedPlaceholder: 'Ex: 8.5',
    totalPlaceholder: 'Ex: 10'
  },
  {
    value: 'percentage',
    label: 'Percentage',
    defaultTotal: '100',
    obtainedLabel: 'Percentage obtained',
    totalLabel: 'Total percentage',
    obtainedPlaceholder: 'Ex: 85',
    totalPlaceholder: 'Ex: 100'
  },
  {
    value: 'marks',
    label: 'Marks',
    defaultTotal: '',
    obtainedLabel: 'Marks obtained',
    totalLabel: 'Total marks',
    obtainedPlaceholder: 'Ex: 450',
    totalPlaceholder: 'Ex: 500'
  }
]

export function getGradeTypeConfig(gradeType) {
  return EDUCATION_GRADE_TYPES.find(type => type.value === gradeType)
}

export function formatEducationGrade(education = {}) {
  const { gradeType, gradeObtained, gradeTotal } = education

  if (gradeType && gradeObtained) {
    const obtained = String(gradeObtained).trim()
    const total = String(gradeTotal || '').trim()

    if (gradeType === 'cgpa') {
      return total ? `${obtained} / ${total} CGPA` : `${obtained} CGPA`
    }

    if (gradeType === 'percentage') {
      return total ? `${obtained}% / ${total}%` : `${obtained}%`
    }

    if (gradeType === 'marks') {
      return total ? `${obtained} / ${total} Marks` : `${obtained} Marks`
    }
  }

  return education.grade || ''
}

export function serializeEducationDate(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && typeof value.toISOString === 'function') return value.toISOString()
  if (typeof value === 'object' && value.$d) return new Date(value.$d).toISOString()
  return value
}

export function buildEducationFromForm(formData) {
  const config = getEducationCategoryConfig(formData.educationCategory)
  const detail = (formData.detail || '').trim()
  const major = (formData.major || '').trim()

  let degree = ''
  let fieldOfStudy = ''

  switch (config.formMode) {
    case 'class':
    case 'program':
    case 'qualification':
      degree = detail
      fieldOfStudy = major
      break
    case 'specialization':
      degree = config.shortDegree || config.label
      fieldOfStudy = detail
      break
    case 'optional_subject':
      degree = config.shortDegree || 'Certificate'
      fieldOfStudy = detail
      break
    default:
      degree = config.shortDegree || config.label
      fieldOfStudy = detail
      break
  }

  return {
    educationCategory: formData.educationCategory,
    school: formData.school.trim(),
    degree,
    highestQualification: config.label,
    fieldOfStudy,
    startDate: formData.startDate,
    endDate: formData.isCurrentlyStudying ? '' : formData.endDate,
    isCurrentlyStudying: formData.isCurrentlyStudying,
    completionStatus: formData.isCurrentlyStudying ? 'in_progress' : formData.completionStatus,
    gradeType: formData.gradeType || '',
    gradeObtained: (formData.gradeObtained || '').trim(),
    gradeTotal: (formData.gradeTotal || '').trim(),
    grade: formatEducationGrade({
      gradeType: formData.gradeType,
      gradeObtained: formData.gradeObtained,
      gradeTotal: formData.gradeTotal
    }),
    activities: formData.activities.trim(),
    description: formData.description.trim()
  }
}

function inferCategoryFromLegacyValue(educationCategory, degree) {
  if (educationCategory === 'undergraduate') {
    return DEGREE_CATEGORY_MAP[degree] || 'bachelors_degree'
  }
  if (educationCategory === 'postgraduate') {
    return DEGREE_CATEGORY_MAP[degree] || 'masters_degree'
  }
  return educationCategory
}

export function resolveEducationCategory(education = {}) {
  if (education.educationCategory) {
    return inferCategoryFromLegacyValue(education.educationCategory, education.degree)
  }

  const legacyCategory = LEGACY_CATEGORY_MAP[education.highestQualification]
  if (legacyCategory) return legacyCategory

  if (education.degree) {
    const mappedCategory = DEGREE_CATEGORY_MAP[education.degree]
    if (mappedCategory) return mappedCategory

    const normalizedDegree = education.degree.toLowerCase()
    if (normalizedDegree.includes('b.tech') || normalizedDegree.includes('b.e')) return 'btech_engineering'
    if (normalizedDegree.includes('m.tech') || normalizedDegree.includes('m.e')) return 'mtech_engineering'
    if (normalizedDegree.startsWith('b.')) return 'bachelors_degree'
    if (normalizedDegree.startsWith('m.') || normalizedDegree === 'mba' || normalizedDegree === 'pgdm') {
      return 'masters_degree'
    }
    if (normalizedDegree.includes('diploma') || normalizedDegree.includes('iti')) return 'diploma'
    if (normalizedDegree.includes('intermediate') || normalizedDegree.includes('12th')) return 'intermediate'
    if (normalizedDegree.includes('10th') || normalizedDegree.includes('ssc')) return 'secondary_school'
  }

  return ''
}

export function resolveEducationDegreeOptions(categoryValue) {
  const config = getEducationCategoryConfig(categoryValue)
  if (!config.degrees.length) return []
  return [...config.degrees, { value: DEGREE_OTHER_VALUE, label: 'Other (specify)' }]
}

export function getEducationDegreeOptionLabels(categoryValue) {
  return getEducationDetailOptions(categoryValue)
}

export function isSchoolLevelEducation(highestQualification, educationCategory) {
  const category = educationCategory || LEGACY_CATEGORY_MAP[highestQualification]
  return category === 'secondary_school'
}

export function getInstitutionLabel(highestQualification, educationCategory) {
  const category = educationCategory || LEGACY_CATEGORY_MAP[highestQualification]
  if (category) return getEducationCategoryConfig(category).institutionLabel
  return isSchoolLevelEducation(highestQualification) ? 'School' : 'College / University'
}

export function getEducationDisplayTitle(education = {}) {
  const category = resolveEducationCategory(education)
  const config = getEducationCategoryConfig(category)

  if (config.formMode === 'specialization') {
    const title = config.shortDegree || config.label
    return education.fieldOfStudy ? `${title} — ${education.fieldOfStudy}` : title
  }

  if (config.formMode === 'program' && education.degree) {
    return education.fieldOfStudy ? `${education.degree} — ${education.fieldOfStudy}` : education.degree
  }

  if (education.degree) return education.degree

  return config.label || education.highestQualification || 'Education'
}

export function getEducationSubtitle(education = {}) {
  return education.fieldOfStudy || ''
}

export function getEducationSortKey(education) {
  const categoryOrder = {
    doctorate: 10,
    professional_pg: 9,
    mtech_engineering: 8,
    masters_degree: 7,
    btech_engineering: 6,
    professional_ug: 5,
    bachelors_degree: 5,
    associate_degree: 4,
    diploma: 4,
    iti_vocational: 3,
    intermediate: 3,
    secondary_school: 2,
    certificate: 1,
    other: 0,
    undergraduate: 5,
    postgraduate: 7
  }

  if (education?.isCurrentlyStudying) return Number.POSITIVE_INFINITY

  const endDateKey = education?.endDate ? new Date(education.endDate).getTime() : 0
  const startDateKey = education?.startDate ? new Date(education.startDate).getTime() : 0
  const categoryKey = categoryOrder[resolveEducationCategory(education)] || 0

  return endDateKey * 1000 + startDateKey + categoryKey
}

export function sortEducationsByEndDate(educations = []) {
  return [...educations].sort((a, b) => getEducationSortKey(b) - getEducationSortKey(a))
}

export function formatEducationDate(date) {
  if (!date) return null
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export function formatEducationDuration(education) {
  const start = formatEducationDate(education?.startDate)
  const end = education?.isCurrentlyStudying ? 'Present' : formatEducationDate(education?.endDate)

  if (start && end) return `${start} - ${end}`
  if (start) return `${start} - Present`
  if (end) return end
  return 'Duration not specified'
}

export function getCompletionStatusLabel(status) {
  return EDUCATION_COMPLETION_STATUS[status] || status
}

export function getCompletionStatusColor(status) {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'info'
    case 'partially_completed':
      return 'warning'
    case 'discontinued':
      return 'error'
    default:
      return 'default'
  }
}
