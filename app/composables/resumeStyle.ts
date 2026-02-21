export const useResumeStyle = () => {
	return useState<ResumeStyle>('resumeStyle', (): ResumeStyle => {
		return useResumeStyleDefaults()
	})
}