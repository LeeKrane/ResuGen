export const useResumeStyleDefaults = (): ResumeStyle => {
	return {
		font: {
			family: 'Inter',
			size: 16,
			titleSizes: {
				h1: 24,
				h2: 20,
				h3: 18
			}
		},
		colors: {
			bg: undefined,
			bgPicked: "#FFFFFF",
			bgElevated: undefined,
			bgElevatedPicked: "#DDDDDD",
			skillLevels: {
				basic: '#EF4444',
				decent: '#F97316',
				good: '#EAB308',
				proficient: '#84CC16',
				expert: '#22C55E'
			},
			techLogos: '#26DF69',
		},
		effects: {
			useShades: true,
			useGradients: true,
			useBorders: true,
			borderWidth: 1,
			borderColor: "#E2E8F0"
		},
		layout: {
			type: 'two-column',
			style: 'fancy',
			showBackground: true,
			sectionSpacing: 2,
			margin: 8,
			sections: [
				{ id: 'profile', enabled: true },
				{ id: 'experience', enabled: true },
				{ id: 'education', enabled: true },
				{ id: 'skills', enabled: true },
				{ id: 'projects', enabled: true },
				{ id: 'certifications', enabled: true },
				{ id: 'languages', enabled: true },
				{ id: 'interests', enabled: false }
			]
		}
	}
}