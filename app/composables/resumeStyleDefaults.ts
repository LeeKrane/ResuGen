export const useResumeStyleDefaults = (): ResumeStyle => {
	return {
		font: {
			family: 'Inter',
			size: 16,
		},
		colors: {
			background: undefined,
			backgroundPicked: "#ffffff",
			skillLevels: {
				basic: '#ef4444',
				decent: '#f97316',
				good: '#eab308',
				proficient: '#84cc16',
				expert: '#22c55e'
			},
			techLogos: '#64748b',
		},
		effects: {
			useShades: true,
			useGradients: false
		},
		layout: {
			type: 'two-column',
			style: 'fancy',
			showBackground: true
		}
	}
}