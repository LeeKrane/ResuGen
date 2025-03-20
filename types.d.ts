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
