export const useResumeStyleDefaults = (): ResumeStyle => {
	return {
		font: {
			family: 'inter',
			size: 16,
			titleSizes: {
				h1: 24,
				h2: 20,
				h3: 18
			}
		},
		colors: {
			bg: "#FFFFFF",
			bgElevated: "#DDDDDD",
			text: {
				title: "#1C1C1C",
				subtitle: "#262626",
				sectionTitle: "#1C1C1C",
				base: "#262626"
			},
			skillLevels: {
				basic: '#EF4444',
				decent: '#F97316',
				good: '#EAB308',
				proficient: '#84CC16',
				expert: '#22C55E'
			},
			techLogos: '#26DF69',
			internship: '#60A5FA',
			openSource: '#93C5FD'
		},
		effects: {
			useShades: true,
			useGradients: true,
			useBorders: true,
			borderWidth: 1,
			borderColor: "#C2C8D1"
		},
		layout: {
			type: 'two-column',
			style: 'fancy',
			showBackground: true,
			sectionSpacing: 2,
			margin: 4,
			additionalSections: [
				{
					id: 'avatar',
					enabled: true
				},
				{
					id: 'hobbies',
					enabled: true
				},
				{
					id: 'links',
					enabled: true
				},
				{
					id: 'projects',
					enabled: true
				},
				{
					id: 'certifications',
					enabled: true
				},
			]
		}
	}
}