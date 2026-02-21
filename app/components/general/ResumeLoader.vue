<script setup lang="ts">
import JSZip from "jszip"

const open = ref(false)
const state = useRefResumeData()
const errorMessage = ref<string | null>(null)
const disabled = ref(false)

// DB save after import — only shown when user is logged in
const user = useSupabaseUser()
const importedSuccessfully = ref(false)
const savingToDB = ref(false)
const savedToDB = ref(false)
const dbSaveError = ref<string | null>(null)

/**
 * After a successful ZIP import, if the user is logged in they can optionally
 * persist the imported data as a new resume in the database.
 */
async function saveImportedToDB() {
  savingToDB.value = true
  dbSaveError.value = null
  try {
    const { createResume, saveResume } = useResumeDB()
    const resumeData = useResumeData()
    // Use the imported name as the resume title, fallback to 'Imported Resume'
    const title = state.name.value?.trim() || 'Imported Resume'
    const kind = state.jobField.value === 'IT' ? 'IT' : 'Other'
    const newId = await createResume(title, kind as 'IT' | 'Other')

    // Include avatar from previewImage state (set by useRefreshAvatar after import)
    const previewImage = useState<string | null>('previewImage')
    let avatarData: string | undefined
    let avatarContentType: string | undefined
    if (previewImage.value) {
      const match = previewImage.value.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        avatarContentType = match[1]
        avatarData = match[2]
      }
    }

    await saveResume(newId, { ...resumeData.data, avatarData, avatarContentType })
    savedToDB.value = true
  } catch (e: any) {
    dbSaveError.value = e?.message ?? 'Failed to save to database'
  } finally {
    savingToDB.value = false
  }
}

async function onFileChange(event) {
	const file = event.target.files[0];
	if (!file)
		return

	disabled.value = true
	errorMessage.value = null
	importedSuccessfully.value = false
	savedToDB.value = false
	dbSaveError.value = null

	try {
		const zip = new JSZip()
		const loadedZip = await zip.loadAsync(file)
		let resumeData: ResumeData
		let resumeStyle: ResumeStyle

		// Extract resume-data.json
		const jsonData = await loadedZip.file('resume-data.json')?.async('string')

		if (jsonData) {
			try {
				resumeData = JSON.parse(jsonData)
			} catch (error) {
				errorMessage.value = 'Error parsing resume-data.json'
				disabled.value = false
				return
			}
		} else {
			errorMessage.value = 'resume-data.json not found in the zip file.'
			disabled.value = false
			return
		}

		// Extract resume-avatar.webp
		const avatarBlob = await loadedZip.file('resume-avatar.webp')?.async('blob');

		// Update state with validated data - batch updates to avoid reactivity issues
		console.log('Starting data import...')
		
		// Basic fields
		state.name.value = resumeData.name || ""
		state.subtitle.value = resumeData.subtitle || ""
		state.email.value = resumeData.email || ""
		state.birthdate.value = resumeData.birthdate
		state.phone.value = resumeData.phone || ""
		state.address.value = resumeData.address || ""
		state.summary.value = resumeData.summary || ""
		
		// Array fields - ensure they are valid arrays
		state.hobbies.value = Array.isArray(resumeData.hobbies) ? resumeData.hobbies : [""]
		state.languages.value = Array.isArray(resumeData.languages) ? resumeData.languages : [{name: ""}]
		// Links - validate structure and ensure all links have icons
		if (Array.isArray(resumeData.links)) {
			state.links.value = resumeData.links.map(link => ({
				name: link.name || "",
				url: link.url || "",
				icon: link.icon || { label: "Website", value: "website", icon: "i-lucide-globe" }
			}))
		} else {
			state.links.value = [{name: "", url: "", icon: { label: "Website", value: "website", icon: "i-lucide-globe" }}]
		}
		state.educationInstitutions.value = Array.isArray(resumeData.educationInstitutions) ? resumeData.educationInstitutions : [{uuid: "", name: ""}]
		state.experienceInstitutions.value = Array.isArray(resumeData.experienceInstitutions) ? resumeData.experienceInstitutions : [{uuid: "", name: ""}]
		state.education.value = Array.isArray(resumeData.education) ? resumeData.education : [{degree: "", text: "", collapsibleOpen: true}]
		state.experience.value = Array.isArray(resumeData.experience) ? resumeData.experience : [{position: "", text: "", collapsibleOpen: true, technologies: []}]
		// Projects - validate structure and ensure repo links have icons
		if (Array.isArray(resumeData.projects)) {
			state.projects.value = resumeData.projects.map(project => ({
				name: project.name || "",
				description: project.description || "",
				url: project.url || "",
				repoLink: project.repoLink ? {
					name: project.repoLink.name || "",
					url: project.repoLink.url || "",
					icon: project.repoLink.icon || { label: "GitHub", value: "github", icon: "i-simple-icons-github" }
				} : { name: "", url: "", icon: { label: "GitHub", value: "github", icon: "i-simple-icons-github" } },
				technologies: Array.isArray(project.technologies) ? project.technologies : [],
				openSource: project.openSource,
				collapsibleOpen: project.collapsibleOpen !== false,
				start: project.start,
				end: project.end
			}))
		} else {
			state.projects.value = [{
				name: "", 
				description: "", 
				url: "", 
				repoLink: { name: "", url: "", icon: { label: "GitHub", value: "github", icon: "i-simple-icons-github" } }, 
				technologies: []
			}]
		}
		
		// Skill categories - validate structure
		if (Array.isArray(resumeData.skillCategories)) {
			state.skillCategories.value = resumeData.skillCategories.map(cat => ({
				name: cat.name || "",
				skills: Array.isArray(cat.skills) ? cat.skills.map(skill => ({
					technology: skill.technology || { label: "Custom", value: "custom", icon: "i-lucide-shapes" },
					displayType: skill.displayType || { label: "Text", value: "text", icon: "i-lucide-letter-text" },
					name: skill.name || "",
					level: skill.level
				})) : [{
					technology: { label: "Custom", value: "custom", icon: "i-lucide-shapes" },
					displayType: { label: "Text", value: "text", icon: "i-lucide-letter-text" },
					name: ""
				}]
			}))
		} else {
			state.skillCategories.value = [{
				name: "",
				skills: [{
					technology: { label: "Custom", value: "custom", icon: "i-lucide-shapes" },
					displayType: { label: "Text", value: "text", icon: "i-lucide-letter-text" },
					name: ""
				}]
			}]
		}
		
		// Load new fields with validation
		if (resumeData.jobField && (resumeData.jobField === 'IT' || resumeData.jobField === 'Other')) {
			state.jobField.value = resumeData.jobField
		}
		
		if (Array.isArray(resumeData.qualifications)) {
			state.qualifications.value = resumeData.qualifications.map(qual => ({
				name: qual.name || "",
				date: qual.date,
				description: qual.description
			}))
		}
		
		if (resumeData.coverLetter && typeof resumeData.coverLetter === 'object') {
			state.coverLetter.value = {
				content: resumeData.coverLetter.content || "",
				recipientName: resumeData.coverLetter.recipientName || "",
				companyName: resumeData.coverLetter.companyName || "",
				position: resumeData.coverLetter.position || ""
			}
		}
		
		// Check for separate cover-letter.json file and load it if it exists
		const coverLetterJsonData = await loadedZip.file('cover-letter.json')?.async('string')
		if (coverLetterJsonData) {
			try {
				const coverLetterData = JSON.parse(coverLetterJsonData)
				if (coverLetterData && typeof coverLetterData === 'object') {
					state.coverLetter.value = {
						content: coverLetterData.content || "",
						recipientName: coverLetterData.recipientName || "",
						companyName: coverLetterData.companyName || "",
						position: coverLetterData.position || ""
					}
				}
			} catch (error) {
				console.warn('Error parsing cover-letter.json, using data from resume-data.json instead:', error)
			}
		}
		
		console.log('Data import completed successfully')
		importedSuccessfully.value = true

		if (avatarBlob) {
			useRefreshAvatar(new File([avatarBlob], "avatar.webp", {type: "image/webp"}))
		}

		const styleJsonData = await loadedZip.file('resume-style.json')?.async('string')

		if (styleJsonData) {
			try {
				resumeStyle = JSON.parse(styleJsonData)
				useResumeStyle().value = resumeStyle
			} catch (error) {
				errorMessage.value = 'Error parsing resume-style.json'
				disabled.value = false
				return
			}
		}
	} catch (error) {
		errorMessage.value = 'Error reading the zip file: ' + error.message;
		console.error('Error reading zip file:', error);
		disabled.value = false
	}

	disabled.value = false
	// Keep modal open if import succeeded so user can optionally save to DB
	if (!importedSuccessfully.value) {
		open.value = false
	}
}
</script>

<template>
	<UModal v-model:open="open"
			title="Load data from file">
		<UButton
			class="cursor-pointer"
			label="Import"
			icon="i-material-symbols-upload-file"
			variant="outline"
		/>

		<template #content>
			<UForm
				:state="state"
				@submit.prevent="onFileChange"
				class="flex flex-col items-center justify-center gap-4 p-16">
				<UFormField label="Resume data" name="resumeData" :error="errorMessage">
					<UInput type="file" accept=".zip" @change="onFileChange" :disabled="disabled"/>
				</UFormField>

				<!-- DB save option: only shown after a successful import when logged in -->
				<template v-if="importedSuccessfully && user">
					<USeparator />
					<div class="flex flex-col items-center gap-2 text-center">
						<p class="text-sm text-(--ui-text-muted)">Import successful. Save as a new resume in your account?</p>
						<UButton
							v-if="!savedToDB"
							label="Save to My Resumes"
							icon="i-lucide-cloud-upload"
							color="primary"
							variant="soft"
							:loading="savingToDB"
							:disabled="savingToDB"
							class="cursor-pointer"
							@click="saveImportedToDB"
						/>
						<p v-if="savedToDB" class="text-sm text-green-500 flex items-center gap-1">
							<UIcon name="i-lucide-check" /> Saved to your resumes
						</p>
						<p v-if="dbSaveError" class="text-sm text-red-500">{{ dbSaveError }}</p>
					</div>
				</template>
			</UForm>
		</template>
	</UModal>
</template>

<style scoped>

</style>