<script setup lang="ts">
const { isIT } = useJobField()

const state = reactive({
	name: useRefResumeData().name,
	subtitle: useRefResumeData().subtitle,
	email: useRefResumeData().email,
	birthdate: useRefResumeData().birthdate,
	phone: useRefResumeData().phone,
	address: useRefResumeData().address,
	summary: useRefResumeData().summary,
	hobbies: useRefResumeData().hobbies,
	languages: useRefResumeData().languages,
	skillCategories: useRefResumeData().skillCategories,
	links: useRefResumeData().links,
	avatar: useRefResumeData().avatar,
})

const previewImage = useState<string | null>("previewImage", () => null)

const linkiconItems = ref([
	{label: "Website", value: "website", icon: "i-lucide-globe"},
	{label: "GitHub", value: "github", icon: "i-simple-icons-github"},
	{label: "GitLab", value: "gitlab", icon: "i-simple-icons-gitlab"},
	{label: "LinkedIn", value: "linkedin", icon: "i-simple-icons-linkedin"},
	{label: "Xing", value: "xing", icon: "i-simple-icons-xing"},
	{label: "Stack Overflow", value: "stack-overflow", icon: "i-simple-icons-stackoverflow"},
	{label: "Discord", value: "discord", icon: "i-simple-icons-discord"},
	{label: "X", value: "x", icon: "i-simple-icons-x"},
	{label: "Instagram", value: "instagram", icon: "i-simple-icons-instagram"},
	{label: "Reddit", value: "reddit", icon: "i-simple-icons-reddit"},
	{label: "Facebook", value: "facebook", icon: "i-simple-icons-facebook"},
	{label: "YouTube", value: "youtube", icon: "i-simple-icons-youtube"},
	{label: "Twitch", value: "twitch", icon: "i-simple-icons-twitch"},
].sort((a, b) => a.label.localeCompare(b.label)))

const techiconItems = ref([
	{label: "Alpine Linux", value: "alpine-linux", icon: "i-simple-icons-alpinelinux"},
	{label: "Alpine.js", value: "alpinejs", icon: "i-simple-icons-alpinedotjs"},
	{label: "Android", value: "android", icon: "i-simple-icons-android"},
	{label: "Angular", value: "angular", icon: "i-simple-icons-angular"},
	{label: "Ansible", value: "ansible", icon: "i-simple-icons-ansible"},
	{label: "Ant Design", value: "antd", icon: "i-simple-icons-antdesign"},
	{label: "Apache", value: "apache", icon: "i-simple-icons-apache"},
	{label: "Apollo", value: "apollo", icon: "i-simple-icons-apollographql"},
	{label: "Arch Linux", value: "arch-linux", icon: "i-simple-icons-archlinux"},
	{label: "Astro", value: "astro", icon: "i-simple-icons-astro"},
	{label: "AWS", value: "aws", icon: "i-simple-icons-amazonaws"},
	{label: "Azure", value: "azure", icon: "i-simple-icons-microsoftazure"},
	{label: "Babel", value: "babel", icon: "i-simple-icons-babel"},
	{label: "Bash", value: "bash", icon: "i-simple-icons-gnubash"},
	{label: "Bitbucket", value: "bitbucket", icon: "i-simple-icons-bitbucket"},
	{label: "Bootstrap", value: "bootstrap", icon: "i-simple-icons-bootstrap"},
	{label: "Bulma", value: "bulma", icon: "i-simple-icons-bulma"},
	{label: "Bun", value: "bun", icon: "i-simple-icons-bun"},
	{label: "C", value: "c", icon: "i-simple-icons-c"},
	{label: "C#", value: "csharp", icon: "i-simple-icons-csharp"},
	{label: "C++", value: "cpp", icon: "i-simple-icons-cplusplus"},
	{label: "Cassandra", value: "cassandra", icon: "i-simple-icons-apachecassandra"},
	{label: "CentOS", value: "centos", icon: "i-simple-icons-centos"},
	{label: "Chakra UI", value: "chakra-ui", icon: "i-simple-icons-chakraui"},
	{label: "CircleCI", value: "circleci", icon: "i-simple-icons-circleci"},
	{label: "ClickHouse", value: "clickhouse", icon: "i-simple-icons-clickhouse"},
	{label: "Cloudflare", value: "cloudflare", icon: "i-simple-icons-cloudflare"},
	{label: "CockroachDB", value: "cockroachdb", icon: "i-simple-icons-cockroachlabs"},
	{label: "Confluence", value: "confluence", icon: "i-simple-icons-confluence"},
	{label: "CSS", value: "css", icon: "i-simple-icons-css3"},
	{label: "Cypress", value: "cypress", icon: "i-simple-icons-cypress"},
	{label: "D3.js", value: "d3", icon: "i-simple-icons-d3dotjs"},
	{label: "DaisyUI", value: "daisyui", icon: "i-simple-icons-daisyui"},
	{label: "Debian", value: "debian", icon: "i-simple-icons-debian"},
	{label: "Deno", value: "deno", icon: "i-simple-icons-deno"},
	{label: "Discord", value: "discord", icon: "i-simple-icons-discord"},
	{label: "Discord.js", value: "discordjs", icon: "i-devicon-plain-discordjs"},
	{label: "Django", value: "django", icon: "i-simple-icons-django"},
	{label: "Docker", value: "docker", icon: "i-simple-icons-docker"},
	{label: "Drupal", value: "drupal", icon: "i-simple-icons-drupal"},
	{label: "Elastic", value: "elastic", icon: "i-simple-icons-elastic"},
	{label: "Electron", value: "electron", icon: "i-simple-icons-electron"},
	{label: "Element UI", value: "element-ui", icon: "i-simple-icons-element"},
	{label: "Ember.js", value: "emberjs", icon: "i-simple-icons-emberdotjs"},
	{label: "Elixir", value: "elixir", icon: "i-simple-icons-elixir"},
	{label: "Ember.js", value: "ember", icon: "i-simple-icons-emberdotjs"},
	{label: "ESLint", value: "eslint", icon: "i-simple-icons-eslint"},
	{label: "Express", value: "express", icon: "i-simple-icons-express"},
	{label: "FastAPI", value: "fastapi", icon: "i-simple-icons-fastapi"},
	{label: "Fedora", value: "fedora", icon: "i-simple-icons-fedora"},
	{label: "Firebase", value: "firebase", icon: "i-simple-icons-firebase"},
	{label: "Flask", value: "flask", icon: "i-simple-icons-flask"},
	{label: "Flutter", value: "flutter", icon: "i-simple-icons-flutter"},
	{label: "Forgejo", value: "forgejo", icon: "i-simple-icons-forgejo"},
	{label: "Git", value: "git", icon: "i-simple-icons-git"},
	{label: "Gitea", value: "gitea", icon: "i-simple-icons-gitea"},
	{label: "GitHub", value: "github", icon: "i-simple-icons-github"},
	{label: "GitHub Actions", value: "github-actions", icon: "i-simple-icons-githubactions"},
	{label: "GitLab", value: "gitlab", icon: "i-simple-icons-gitlab"},
	{label: "Go", value: "go", icon: "i-simple-icons-go"},
	{label: "Gradle", value: "gradle", icon: "i-simple-icons-gradle"},
	{label: "Grafana", value: "grafana", icon: "i-simple-icons-grafana"},
	{label: "GraphQL", value: "graphql", icon: "i-simple-icons-graphql"},
	{label: "Gulp", value: "gulp", icon: "i-simple-icons-gulp"},
	{label: "Hadoop", value: "hadoop", icon: "i-simple-icons-apachehadoop"},
	{label: "Haskell", value: "haskell", icon: "i-simple-icons-haskell"},
	{label: "Hasura", value: "hasura", icon: "i-simple-icons-hasura"},
	{label: "Heroku", value: "heroku", icon: "i-simple-icons-heroku"},
	{label: "HTML", value: "html", icon: "i-simple-icons-html5"},
	{label: "IntelliJ IDEA", value: "intellij", icon: "i-simple-icons-intellijidea"},
	{label: "iOS", value: "ios", icon: "i-simple-icons-ios"},
	{label: "Java", value: "java", icon: "i-lineicons-java"},
	{label: "JavaScript", value: "javascript", icon: "i-simple-icons-javascript"},
	{label: "Jenkins", value: "jenkins", icon: "i-simple-icons-jenkins"},
	{label: "Jest", value: "jest", icon: "i-simple-icons-jest"},
	{label: "Jira", value: "jira", icon: "i-simple-icons-jira"},
	{label: "jQuery", value: "jquery", icon: "i-simple-icons-jquery"},
	{label: "Julia", value: "julia", icon: "i-simple-icons-julia"},
	{label: "Kafka", value: "kafka", icon: "i-simple-icons-apachekafka"},
	{label: "Kali Linux", value: "kali-linux", icon: "i-simple-icons-kalilinux"},
	{label: "Kotlin", value: "kotlin", icon: "i-simple-icons-kotlin"},
	{label: "Kubernetes", value: "kubernetes", icon: "i-simple-icons-kubernetes"},
	{label: "Laravel", value: "laravel", icon: "i-simple-icons-laravel"},
	{label: "Less", value: "less", icon: "i-simple-icons-less"},
	{label: "Linux", value: "linux", icon: "i-simple-icons-linux"},
	{label: "Lit", value: "lit", icon: "i-simple-icons-lit"},
	{label: "Lua", value: "lua", icon: "i-simple-icons-lua"},
	{label: "MariaDB", value: "mariadb", icon: "i-simple-icons-mariadb"},
	{label: "Material UI", value: "material-ui", icon: "i-simple-icons-mui"},
	{label: "Mercurial", value: "mercurial", icon: "i-simple-icons-mercurial"},
	{label: "Microsoft Teams", value: "microsoft-teams", icon: "i-simple-icons-microsoftteams"},
	{label: "MongoDB", value: "mongodb", icon: "i-simple-icons-mongodb"},
	{label: "MySQL", value: "mysql", icon: "i-simple-icons-mysql"},
	{label: "NestJS", value: "nestjs", icon: "i-simple-icons-nestjs"},
	{label: "Netlify", value: "netlify", icon: "i-simple-icons-netlify"},
	{label: "Next.js", value: "nextjs", icon: "i-simple-icons-nextdotjs"},
	{label: "Nginx", value: "nginx", icon: "i-simple-icons-nginx"},
	{label: "Node.js", value: "nodejs", icon: "i-simple-icons-nodedotjs"},
	{label: "npm", value: "npm", icon: "i-simple-icons-npm"},
	{label: "Nuxt", value: "nuxt", icon: "i-simple-icons-nuxtdotjs"},
	{label: "OpenSUSE", value: "opensuse", icon: "i-simple-icons-opensuse"},
	{label: "Oracle", value: "oracle", icon: "i-simple-icons-oracle"},
	{label: "PHP", value: "php", icon: "i-simple-icons-php"},
	{label: "Playwright", value: "playwright", icon: "i-simple-icons-playwright"},
	{label: "pnpm", value: "pnpm", icon: "i-simple-icons-pnpm"},
	{label: "PostCSS", value: "postcss", icon: "i-simple-icons-postcss"},
	{label: "PostgreSQL", value: "postgresql", icon: "i-simple-icons-postgresql"},
	{label: "Preact", value: "preact", icon: "i-simple-icons-preact"},
	{label: "Prettier", value: "prettier", icon: "i-simple-icons-prettier"},
	{label: "Prisma", value: "prisma", icon: "i-simple-icons-prisma"},
	{label: "Python", value: "python", icon: "i-simple-icons-python"},
	{label: "Qwik", value: "qwik", icon: "i-simple-icons-qwik"},
	{label: "RabbitMQ", value: "rabbitmq", icon: "i-simple-icons-rabbitmq"},
	{label: "React", value: "react", icon: "i-simple-icons-react"},
	{label: "Redis", value: "redis", icon: "i-simple-icons-redis"},
	{label: "RedHat", value: "redhat", icon: "i-simple-icons-redhat"},
	{label: "Remix", value: "remix", icon: "i-simple-icons-remix"},
	{label: "Rollup", value: "rollup", icon: "i-simple-icons-rollupdotjs"},
	{label: "Ruby", value: "ruby", icon: "i-simple-icons-ruby"},
	{label: "Ruby on Rails", value: "ruby-on-rails", icon: "i-simple-icons-rubyonrails"},
	{label: "Rust", value: "rust", icon: "i-simple-icons-rust"},
	{label: "Sass", value: "sass", icon: "i-simple-icons-sass"},
	{label: "Scala", value: "scala", icon: "i-simple-icons-scala"},
	{label: "Selenium", value: "selenium", icon: "i-simple-icons-selenium"},
	{label: "Sequelize", value: "sequelize", icon: "i-devicon-plain-sequelize"},
	{label: "Slack", value: "slack", icon: "i-simple-icons-slack"},
	{label: "Solid.js", value: "solidjs", icon: "i-simple-icons-solid"},
	{label: "Sourcehut", value: "sourcehut", icon: "i-simple-icons-sourcehut"},
	{label: "Spotify", value: "spotify", icon: "i-simple-icons-spotify"},
	{label: "Spring", value: "spring", icon: "i-simple-icons-spring"},
	{label: "SQLite", value: "sqlite", icon: "i-simple-icons-sqlite"},
	{label: "Strapi", value: "strapi", icon: "i-simple-icons-strapi"},
	{label: "Stylus", value: "stylus", icon: "i-simple-icons-stylus"},
	{label: "Supabase", value: "supabase", icon: "i-simple-icons-supabase"},
	{label: "Subversion", value: "subversion", icon: "i-simple-icons-subversion"},
	{label: "Svelte", value: "svelte", icon: "i-simple-icons-svelte"},
	{label: "Swift", value: "swift", icon: "i-simple-icons-swift"},
	{label: "Symfony", value: "symfony", icon: "i-simple-icons-symfony"},
	{label: "Tailwind", value: "tailwind", icon: "i-simple-icons-tailwindcss"},
	{label: "Terraform", value: "terraform", icon: "i-simple-icons-terraform"},
	{label: "TypeScript", value: "typescript", icon: "i-simple-icons-typescript"},
	{label: "Ubuntu", value: "ubuntu", icon: "i-simple-icons-ubuntu"},
	{label: "Unity", value: "unity", icon: "i-simple-icons-unity"},
	{label: "Unreal Engine", value: "unreal-engine", icon: "i-simple-icons-unrealengine"},
	{label: "Vercel", value: "vercel", icon: "i-simple-icons-vercel"},
	{label: "Vim", value: "vim", icon: "i-simple-icons-vim"},
	{label: "Vite", value: "vite", icon: "i-simple-icons-vite"},
	{label: "VS Code", value: "vs-code", icon: "i-simple-icons-visualstudiocode"},
	{label: "Vue", value: "vue", icon: "i-simple-icons-vuedotjs"},
	{label: "Vuetify", value: "vuetify", icon: "i-simple-icons-vuetify"},
	{label: "WebStorm", value: "webstorm", icon: "i-simple-icons-webstorm"},
	{label: "Webpack", value: "webpack", icon: "i-simple-icons-webpack"},
	{label: "Windows", value: "windows", icon: "i-simple-icons-windows"},
	{label: "Windicss", value: "windicss", icon: "i-simple-icons-windicss"},
	{label: "Yarn", value: "yarn", icon: "i-simple-icons-yarn"},
	{label: "Zoom", value: "zoom", icon: "i-akar-icons-zoom-fill"}
].sort((a, b) => a.label.localeCompare(b.label)));

techiconItems.value.unshift({ label: "Custom", value: "custom", icon: "i-lucide-shapes" });

const displayiconItems = ref([
	{ label: "Text", value: "text", icon: "i-lucide-letter-text" },
	{ label: "Icon", value: "icon", icon: "i-lucide-image" },
	{ label: "Icon and Text", value: "iconandtext", icon: "i-lucide-book-image" }
]);

const onFileChange = async (event: Event) => {
	const file = (event.target as HTMLInputElement).files?.[0]
	useRefreshAvatar(file ?? null)
}

const avatarInput = ref<HTMLInputElement | null>(null)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isEmailValid = computed(() => emailRegex.test(state.email))

// keep displayType in sync when technology is set to "custom"
watch(
    () => state.skillCategories,
    (watcher) => {
        if (!watcher) return
        watcher.forEach((edit) => {
            edit?.skills?.forEach((skill) => {
                if (skill && skill.technology && skill.technology.value === "custom") {
                    const textDisplay = displayiconItems.value.find((i) => i.value === "text")
                    if (textDisplay) {
                        skill.displayType = textDisplay
                    }
                }
            })
        })
    },
    { deep: true }
)

// Dynamic labels based on job field
const skillCategoryPlaceholder = computed(() => 
	isIT.value ? 'Programming Languages' : 'Professional Skills'
)

const skillPlaceholder = computed(() => 
	isIT.value ? 'TypeScript' : 'Communication'
)
</script>

<template>
	<UForm
		:state="state"
		class="flex flex-col gap-4 m-4">
		<div class="flex gap-4">
			<div class="flex flex-col grow gap-4">
				<UFormField label="Name">
					<UInput
						v-model="state.name"
						class="w-full"
						variant="soft"
						placeholder="MSc. John Doe"
						icon="i-lucide-user"/>
				</UFormField>

				<UFormField label="Subtitle">
					<UInput
						v-model="state.subtitle"
						class="w-full"
						variant="soft"
						placeholder="Software Engineer"
						icon="i-lucide-message-square-text"/>
				</UFormField>

				<UFormField label="Email" :error="state.email !== '' && !isEmailValid">
					<UInput
						v-model="state.email"
						class="w-full"
						variant="soft"
						placeholder="john.doe@example.com"
						icon="i-lucide-at-sign"/>
						<template #hint>
							<span v-if="state.email !== '' && !isEmailValid" class="text-(--ui-error)">Please enter a valid email address.</span>
						</template>
				</UFormField>
			</div>

			<UFormField label="Avatar">
				<div class="flex flex-col items-start gap-4">
					<NuxtImg
						v-if="previewImage"
						:src="previewImage"
						class="w-32 h-32 rounded-lg"/>
					<GeneralPlaceholder
						v-else
						class="w-32 h-32"
					/>
					<UFieldGroup class="w-full">
						<UButton
							icon="i-lucide-upload"
							variant="soft"
							placeholder="Upload Avatar"
							class="cursor-pointer grow"
							label="Upload"
							@click="avatarInput!.click()"/>
						<FormClearInputButton
							v-if="previewImage"
							:fn="() => {
								previewImage = null
								state.avatar = null
							}"
							error
							soft
						/>
					</UFieldGroup>
					<input
						ref="avatarInput"
						type="file"
						accept="image/*"
						class="hidden"
						@change="onFileChange">
				</div>
			</UFormField>
		</div>

		<div class="flex flex-wrap gap-4">
			<UFormField label="Birthdate" class="grow">
				<FormDatePicker v-model="state.birthdate"/>
			</UFormField>

			<UFormField label="Phone" class="grow">
				<UInput
					v-model="state.phone"
					class="w-full"
					variant="soft"
					placeholder="+43 123 456 789"
					icon="i-lucide-phone"/>
			</UFormField>

			<UFormField label="Address" class="grow">
				<UInput
					v-model="state.address"
					class="w-full"
					variant="soft"
					placeholder="123 Main Street, City, Country"
					icon="i-lucide-map-pin"/>
			</UFormField>
		</div>

		<UFormField label="Professional Summary">
			<UTextarea
				v-model="state.summary"
				class="w-full"
				variant="soft"
				placeholder="Experienced software engineer..."
				icon="i-lucide-user"
				autoresize/>
		</UFormField>

		<UFormField label="Hobbies">
			<div
				v-for="(_, index) in state.hobbies"
				:key="index"
				class="flex gap-1 my-1">
				<UInput
					v-model="state.hobbies[index]"
					class="w-full"
					variant="soft"
					icon="i-lucide-volleyball"
					placeholder="Volleyball"/>
				<FormModifyButtons
					v-model="state.hobbies"
					:index="index"/>
			</div>

			<FormAddButton
				v-model="state.hobbies"
				label="Add Hobby"
				:default-value-getter="() =>{  return ('') }"/>
		</UFormField>

		<UFormField label="Languages">
			<div
				v-for="(_l, index) in state.languages"
				:key="index"
				class="flex gap-1 my-1">
				<UInput
					v-if="state.languages[index]"
					v-model="state.languages[index].name"
					icon="i-lucide-languages"
					variant="soft"
					placeholder="English"
					class="flex-1"/>
				<USelect
					v-if="state.languages[index]"
					v-model="state.languages[index].level"
					placeholder="Level"
					variant="soft"
					:items="['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native']"/>
				<FormModifyButtons
					v-model="state.languages"
					:index="index"/>
			</div>

			<FormAddButton
				v-model="state.languages"
				label="Add Language"
				:default-value-getter="() =>{  return ({ name: '' }) }"/>
		</UFormField>

		<UFormField label="Skills">
			<div
				v-for="(_c, index) in state.skillCategories"
				:key="index"
				class="flex flex-col gap-1 not-first:mt-3">
				<div class="flex gap-1">
					<UInput
						v-if="state.skillCategories[index]"
						v-model="state.skillCategories[index].name"
						icon="i-lucide-folder"
						variant="soft"
						:placeholder="skillCategoryPlaceholder"
						class="flex-1"/>
					<FormModifyButtons
						v-model="state.skillCategories"
						:index="index">
						<template #leading>
							<FormAddButton
								v-model="state.skillCategories[index]!.skills"
								class="col-span-2"
								icon="i-lucide-plus"
								raw
								:default-value-getter="() =>{  return ({ technology: techiconItems.find(i => i.value === 'custom'), displayType: displayiconItems.find(a => a.value === 'text') }) }"/>
						</template>
					</FormModifyButtons>
				</div>

				<div class="grid grid-cols-[auto_1fr] gap-x-1 mx-5">
					<USeparator
						v-if="state.skillCategories[index] && state.skillCategories[index].skills.length > 0"
						orientation="vertical"
						class="h-[calc(100%-1.25rem)] mr-4"/>

					<div
						v-if="state.skillCategories[index] && state.skillCategories[index].skills.length > 0"
						class="flex flex-col gap-1 mb-1">
						<div
							v-for="(_s, skillIndex) in state.skillCategories[index].skills"
							:key="skillIndex"
							class="flex items-center gap-1">
							<USeparator class="w-4 -ml-5"/>
							<USelectMenu
								v-if="state.skillCategories[index].skills[skillIndex]"
								class="min-w-20"
								v-model="state.skillCategories[index].skills[skillIndex].technology"
								variant="soft"
								:ui="{ content: 'min-w-fit' }"
								:class="state.skillCategories[index].skills[skillIndex].technology && state.skillCategories[index].skills[skillIndex].technology.value === 'custom' ? '' : 'grow'"
								:icon="state.skillCategories[index].skills[skillIndex].technology ? state.skillCategories[index].skills[skillIndex].technology.icon : undefined"
								:items="techiconItems"/>
							<UInput
								v-if="state.skillCategories[index].skills[skillIndex] && state.skillCategories[index].skills[skillIndex].technology && state.skillCategories[index].skills[skillIndex].technology.value === 'custom'"
								v-model="state.skillCategories[index].skills[skillIndex].name"
								variant="soft"
								:placeholder="skillPlaceholder"
								class="flex-1"/>
							<USelectMenu
								v-if="state.skillCategories[index].skills[skillIndex] && state.skillCategories[index].skills[skillIndex].technology && state.skillCategories[index].skills[skillIndex].technology.value !== 'custom'"
								class="min-w-24"
								v-model="state.skillCategories[index].skills[skillIndex].displayType"
								variant="soft"
								:searchInput=false
								:ui="{ content: 'min-w-fit' }"
								:icon="state.skillCategories[index].skills[skillIndex].displayType ? state.skillCategories[index].skills[skillIndex].displayType.icon : undefined"
								:items="displayiconItems"/>
							<USelect
								v-if="state.skillCategories[index].skills[skillIndex]"
								v-model="state.skillCategories[index].skills[skillIndex].level"
								placeholder="Level"
								class="min-w-24"
								variant="soft"
								:items="['Basic', 'Decent', 'Good', 'Proficient', 'Expert']"/>
							<FormModifyButtons
								v-model="state.skillCategories[index].skills"
								:index="skillIndex"/>
						</div>
					</div>
				</div>
			</div>

			<FormAddButton
				v-model="state.skillCategories"
				label="Add Skill Category"
				:default-value-getter="() =>{  return ({ name: '', skills: [] }) }"/>
		</UFormField>

		<UFormField label="Links">
			<div
				v-for="(_l, index) in state.links"
				:key="index"
				class="flex gap-1 my-1">
				<USelectMenu
					v-if="state.links[index]"
					class="min-w-40"
					v-model="state.links[index].icon"
					placeholder="Choose Website"
					variant="soft"
					:icon="state.links[index].icon ? state.links[index].icon.icon : undefined"
					:items="linkiconItems"/>
				<UInput
					v-if="state.links[index] && state.links[index].icon && state.links[index].icon.label === 'Website'"
					v-model="state.links[index].name"
					variant="soft"
					placeholder="Krane's Resume Generator"
					class="grow"/>
				<UInput
					v-if="state.links[index]"
					v-model="state.links[index].url!"
					icon="i-lucide-link"
					variant="soft"
					placeholder="https://resume.krane.dev/"
					class="grow"/>
				<FormModifyButtons
					v-model="state.links"
					:index="index"/>
			</div>

			<FormAddButton
				v-model="state.links"
				label="Add Link"
				:default-value-getter="() =>{  return ({ name: '', url: '' }) }"/>
		</UFormField>
	</UForm>
</template>

<style scoped>

</style>