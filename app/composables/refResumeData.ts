import {v7} from "uuid"

export const useRefResumeData: () => RefResumeData = () => {
	return {
		name: useState("name", () => ""),
		subtitle: useState("subtitle", () => ""),
		email: useState("email", () => ""),
		phone: useState("phone", () => ""),
		address: useState("address", () => ""),
		summary: useState("summary", () => ""),
		hobbies: useState("hobbies", (): string[] => [""]),
		languages: useState("languages", (): Language[] => [{name: ""}]),
		skillCategories: useState("skillCategories", (): SkillCategory[] => [{name: "", skills: [{name: ""}]}]),
		links: useState("links", (): Link[] => [{name: "", url: ""}]),
		institutions: useState("institutions", (): Institution[] => [{uuid: v7(), name: ""}]),
		education: useState("education", (): Education[] => [{degree: "", text: "", collapsibleOpen: true}]),
		experience: useState("experience", (): Experience[] => [{
			position: "",
			text: "",
			collapsibleOpen: true,
			technologies: []
		}]),
		projects: useState("projects", (): Project[] => [{
			name: "",
			description: "",
			url: "",
			repoLink: {name: "", url: ""},
			technologies: []
		}]),
		avatar: useState("avatar", (): File | null => null),
	}
}
