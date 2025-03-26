interface Language {
	name: string
	level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Native"
}

interface Skill {
	name: string
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
}

interface ImgData {
	filename: string,
	contentType: string
	base64: string,
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
	institutions: Institution[],
	education: Education[],
	experience: Experience[],
	projects: Project[],
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
	institutions: Ref<Institution[]>
	education: Ref<Education[]>
	experience: Ref<Experience[]>
	projects: Ref<Project[]>
	avatar: Ref<File | null>
}
