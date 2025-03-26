import {v7} from "uuid"

export const useResumeData: () => { data: ResumeData, avatar: File | null } = () => {
	return {
		data: {
			name: useState("name", () => "").value,
			subtitle: useState("subtitle", () => "").value,
			email: useState("email", () => "").value,
			birthdate: useState("birthdate", () => undefined),
			phone: useState("phone", () => "").value,
			address: useState("address", () => "").value,
			summary: useState("summary", () => "").value,
			hobbies: useState("hobbies", (): string[] => [""]).value,
			languages: useState("languages", (): Language[] => [{name: ""}]).value,
			skillCategories: useState("skillCategories", (): SkillCategory[] => [{
				name: "",
				skills: [{name: ""}]
			}]).value,
			links: useState("links", (): Link[] => [{name: "", url: ""}]).value,
			institutions: useState("institutions", (): Institution[] => [{uuid: v7(), name: ""}]).value,
			education: useState("education", (): Education[] => [{degree: "", text: "", collapsibleOpen: true}]).value,
			experience: useState("experience", (): Experience[] => [{
				position: "",
				text: "",
				collapsibleOpen: true,
				technologies: []
			}]).value,
			projects: useState("projects", (): Project[] => [{
				name: "",
				description: "",
				url: "",
				repoLink: {name: "", url: ""},
				technologies: []
			}]).value,
		},
		avatar: useState("avatar", (): File | null => null).value,
	}
}
