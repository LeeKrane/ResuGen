export const useResumeStyleDefaults = (): ResumeStyle => {
	return {
		font: {
			family: 'inter',
			size: 10,
			titleSizes: {
				h1: 20,
				h2: 15,
				h3: 12.5
			},
			lineHeight: 1.4
		},
		colors: {
			bg: "#FFFFFF",
			bgElevated: "#142338",
			text: {
				title: "#1C1C1C",
				subtitle: "#262626",
				sectionTitle: "#1C1C1C",
				sectionTitleElevated: "#FFFFFF",
				base: "#262626",
				baseElevated: "#EBEBEB"
			},
			skillLevels: {
				basic: '#638475',
				decent: '#507A84',
				good: '#30516F',
				proficient: '#353D9B',
				expert: '#7B27DD'
			},
			languageBadges: '#273954',
			active: '#A5F3DF',
			techLogos: '#00CC8B',
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
			style: 'simple',
			showBackground: true,
			sizeRatio: 34,
			sectionSpacing: 2,
			margin: 4,
		},
		sections: {
			minor: {
				avatar: {enabled: true, order: 1},
				personal: {enabled: true, order: 2},
				languages: {enabled: true, order: 3},
				hobbies: {enabled: true, order: 4},
				skills: {enabled: true, order: 5}
			},
			major: {
				summary: {enabled: true, order: 1},
				education: {enabled: true, order: 2},
				experience: {enabled: true, order: 3},
				projects: {enabled: true, order: 4},
				certifications: {enabled: true, order: 5}
			}
		},
	}
}