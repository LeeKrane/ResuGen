interface Language {
	name: string
	level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Native"
}

interface Skill {
	technology?: Icon
	name: string
	displayType?: Icon
	level?: "Basic" | "Decent" | "Good" | "Proficient" | "Expert"
}

interface SkillCategory {
	name: string
	skills: Skill[]
}

interface Icon {
	label: string
	value: string
	icon?: string
}

interface Link {
	name: string
	url: string
	icon?: Icon
}

interface Technology extends Icon {
	icon: string
	url: string
}

interface Institution {
	uuid?: string,
	name: string,
	url?: string,
}

interface EmploymentDate {
	year?: number,
	month?: number,
	day?: number
}

interface Employment {
	institution?: Institution,
	start?: EmploymentDate,
	end?: EmploymentDate,
	text: string,
	active?: boolean
	collapsibleOpen?: boolean
}

interface Education extends Employment {
	degree: string
}

interface Experience extends Employment {
	position: string
	technologies: Technology[]
	internship?: boolean
}

interface Project {
	name: string,
	description: string,
	url?: string,
	repoLink?: Link,
	technologies: Technology[]
	openSource?: boolean
	collapsibleOpen?: boolean
	start?: EmploymentDate
	end?: EmploymentDate
}

interface Qualification {
	name: string
	issuer?: string
	date?: EmploymentDate
	description?: string
}


interface CoverLetter {
	content: string
	recipientName?: string
	companyName?: string
	position?: string
}

interface ImgData {
	filename: string,
	contentType: string
	base64: string,
}

interface SectionState {
	enabled: boolean
	order: number
}

interface ResumeData {
	name: string,
	subtitle: string,
	email: string,
	birthdate: EmploymentDate | undefined,
	phone: string,
	address: string,
	summary: string,
	hobbies: string[],
	languages: Language[],
	skillCategories: SkillCategory[],
	links: Link[],
	educationInstitutions: Institution[],
	experienceInstitutions: Institution[],
	education: Education[],
	experience: Experience[],
	projects: Project[],
	jobField: "IT" | "Other",
	qualifications?: Qualification[],
	coverLetter?: CoverLetter,
	avatarData?: string,
	avatarContentType?: string,
}

interface RefResumeData {
	name: Ref<string>
	subtitle: Ref<string>
	email: Ref<string>
	birthdate: Ref<EmploymentDate | undefined>
	phone: Ref<string>
	address: Ref<string>,
	summary: Ref<string>
	hobbies: Ref<string[]>
	languages: Ref<Language[]>
	skillCategories: Ref<SkillCategory[]>
	links: Ref<Link[]>
	educationInstitutions: Ref<Institution[]>
	experienceInstitutions: Ref<Institution[]>
	education: Ref<Education[]>
	experience: Ref<Experience[]>
	projects: Ref<Project[]>
	avatar: Ref<File | null>
	jobField: Ref<"IT" | "Other">
	qualifications: Ref<Qualification[]>
	coverLetter: Ref<CoverLetter>
}

interface ResumeStyle {
	font: {
		family: string
		size: number
		titleSizes: {
			h1: number
			h2: number
			h3: number
		}
		lineHeight: number
	}
	colors: {
		bg?: string
		bgElevated?: string
		text: {
			title: string
			subtitle: string
			sectionTitle: string
			sectionTitleElevated: string
			base: string
			baseElevated: string
		}
		skillLevels: {
			basic: string
			decent: string
			good: string
			proficient: string
			expert: string
		}
		languageBadges: string
		active: string
		techLogos: string
		internship: string
		openSource: string
	}
	effects: {
		useShades: boolean
		useAvatarShade?: boolean
		useGradients: boolean
		projectGradientColor?: string
		useBorders: boolean
		borderWidth: number
		borderColor?: string
		fillSkillIcon: boolean
	}
	layout: {
		type: "single-column" | "two-column" | "compact"
		style: "fancy" | "simple"
		showBackground: boolean
		sizeRatio: number
		sectionSpacing: number
		margin: number
	}
	sections: {
		minor: {
			avatar: SectionState
			personal: SectionState
			languages: SectionState
			hobbies: SectionState
			skills: SectionState
		}
		major: {
			summary: SectionState
			education: SectionState
			experience: SectionState
			projects: SectionState
			certifications: SectionState
		}
	}
}

interface PortfolioProfile {
	name: string
	subtitle: string
	email: string
	phone: string
	address: string
	summary: string
	birthdate?: EmploymentDate
	hobbies: string[]
	avatarData?: string
	avatarFilename?: string
	avatarContentType?: string
}

interface PortfolioData {
	profile: PortfolioProfile
	links: Link[]
	languages: Language[]
	skillCategories: SkillCategory[]
	education: Education[]
	experience: Experience[]
	projects: Project[]
	certifications: Qualification[]
	educationInstitutions: Institution[]
	experienceInstitutions: Institution[]
	jobField?: 'IT' | 'Other'
}

interface ResumeSummary {
	id: string
	title: string
	kind: 'it' | 'other'
	updatedAt: string
	createdAt: string
	duplicatedFrom?: string
}

interface ExtractRequirementsResponse {
	keywords: string[]
	responsibilities: string[]
	mustHaves: string[]
	niceToHaves: string[]
}

interface GenerateResumeDraftResponse {
	name: string | null
	subtitle: string | null
	summary: string | null
	experience: Array<{ position: string; text: string; technologies: string[] }>
	education: Array<{ degree: string; text: string }>
	skillCategories: Array<{ name: string; skills: Array<{ name: string }> }>
	projects: Array<{ name: string; description: string }>
	languages: Array<{ name: string; level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native' }>
	coverLetter: {
		content: string
		recipientName: string | null
		companyName: string | null
		position: string | null
	}
	provenance: string[]
	missing_info: string[]
}
