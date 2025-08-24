<script setup lang="ts">
import HSeparator from "~/components/general/HSeparator.vue";

const previewImage = useState<string | null>("previewImage", () => null)
const style = useResumeStyle()
const data = useRefResumeData()
</script>

<template>
	<div
			:style="{
				backgroundColor: `${style.layout.showBackground ? style.colors.bg : undefined}`,
				fontSize: `${style.font.size}pt`,
				lineHeight: style.font.lineHeight,
				// fontFamily: style.font.family,
			}"
			class="flex not-print:w-3xl not-print:min-h-[calc(var(--container-3xl)*297/210)]">

		<!--------------------------------------------->
		<!-------          Left Column          ------->
		<!--------------------------------------------->

		<div
				:style="{
					width: `${(style.layout.margin/8*32.5 + 250) * (style.layout.sizeRatio / 100) * 3}px`,
					padding: `${style.layout.margin/8 + 1}rem`,
					backgroundColor: `${style.layout.showBackground ? style.colors.bgElevated : undefined}`,
					gap: `${style.layout.sectionSpacing/8}rem`,
					color: style.colors.text.baseElevated,
				}"
				class="flex flex-col min-h-full shrink-0">

			<!-- Avatar -->

			<div
					v-if="style.sections.minor.avatar.enabled"
					class="flex flex-col flex-wrap items-center gap-1">
				<UAvatar
						v-if="previewImage"
						:src="previewImage"
						class="m-2 w-40 h-40 rounded-full"/>
			</div>

			<!-- Personal Information -->

			<div
					v-if="style.sections.minor.personal.enabled"
					class="flex flex-col flex-wrap gap-1">
				<HSeparator label="Personal" icon="i-lucide-user" elevated/>

				<ULink
						:style="{ color: style.colors.text.baseElevated }"
						class="flex items-center gap-2"
						:to="`mailto:${data.email.value}`">
					<UIcon name="i-lucide-mail" :size="style.font.size * 1.5" class="shrink-0"/>
					<span class="shrink">{{ data.email }}</span>
				</ULink>
				<ULink
						:style="{ color: style.colors.text.baseElevated }"
						class="flex items-center gap-2"
						:to="`tel:${data.phone.value}`">
					<UIcon name="i-lucide-phone" :size="style.font.size * 1.5" class="shrink-0"/>
					<span class="shrink">{{ data.phone }}</span>
				</ULink>
				<ULink
						:style="{ color: style.colors.text.baseElevated }"
						class="flex items-center gap-2"
						:to="`https://maps.google.com/?q=${data.address.value}`">
					<UIcon name="i-lucide-map-pin" :size="style.font.size * 1.5" class="shrink-0"/>
					<span class="shrink">{{ data.address }}</span>
				</ULink>
			</div>

			<!-- Languages -->

			<div
					v-if="style.sections.minor.languages.enabled"
					class="flex flex-col flex-wrap gap-1">
				<HSeparator label="Languages" icon="i-lucide-languages" elevated/>

				<ul class="flex flex-col gap-1">
					<li v-for="language in data.languages.value" :key="language.name" class="flex justify-between">
						<span class="flex items-center">
							<UIcon name="i-lucide-dot" :size="style.font.size * 1.75" class="-ml-1.5"/>
							{{ language.name }}
						</span>
						<span
								:style="{
									backgroundColor: style.colors.languageBadges
								}"
								class="px-1.5 py-px rounded-md">
							{{ language.level }}
						</span>
					</li>
				</ul>
			</div>

			<!-- Hobbies -->

			<div
					v-if="style.sections.minor.hobbies.enabled"
					class="flex flex-col flex-wrap gap-1">
				<HSeparator label="Hobbies" icon="i-lucide-volleyball" elevated/>

				<ul class="flex flex-col gap-1">
					<li
							v-for="hobby in data.hobbies.value"
							:key="hobby"
							class="flex justify-between">
						<span class="flex items-center">
							<UIcon name="i-lucide-dot" :size="style.font.size * 1.75" class="-ml-1.5"/>
							{{ hobby }}
						</span>
					</li>
				</ul>
			</div>

			<!-- Skills -->

			<div
					v-if="style.sections.minor.skills.enabled"
					class="flex flex-col flex-wrap gap-1">
				<HSeparator label="Skills" icon="i-lucide-layers" elevated/>

				<div class="flex justify-between flex-nowrap items-center gap-1">
					<span
							:style="{ color: style.colors.skillLevels.basic }">
						Basic
					</span>
					<UIcon
							:style="{ color: style.colors.skillLevels.decent }"
							name="i-lucide-chevrons-right"
							:size="style.font.size * 2"/>
					<UIcon
							:style="{ color: style.colors.skillLevels.good }"
							name="i-lucide-chevrons-right"
							:size="style.font.size * 2"/>
					<UIcon
							:style="{ color: style.colors.skillLevels.proficient }"
							name="i-lucide-chevrons-right"
							:size="style.font.size * 2"/>
					<span
							:style="{ color: style.colors.skillLevels.expert }">
						Expert
					</span>
				</div>

				<div
						v-for="category in data.skillCategories.value"
						:key="category.name"
						class="flex flex-col gap-1">
					<div class="flex items-center gap-1">
						<UIcon name="i-lucide-folder" :size="style.font.size * 1.5"/>
						<span class="font-semibold">{{ category.name }}</span>
					</div>

					<div class="flex flex-wrap gap-1 pl-1">
						<span
								v-for="skill in category.skills"
								:key="skill.name"
								:style="{
									backgroundColor: style.colors.skillLevels[skill.level?.toLowerCase() ?? 'basic']
								}"
								class="px-1.5 py-px rounded-md">
							{{ skill.name }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!---------------------------------------------->
		<!-------          Right Column          ------->
		<!---------------------------------------------->

		<div
				:style="{
					padding: `${style.layout.margin/8 + 1}rem`,
					backgroundColor: `${style.layout.showBackground ? style.colors.bg : undefined}`,
					gap: `${style.layout.sectionSpacing/8}rem`,
					color: style.colors.text.base,
				}"
				class="flex flex-col h-full grow">

			<!-- Name, Subtitle, and Links -->

			<div class="flex flex-col gap-1">
				<h1
						:style="{
							color: style.colors.text.title,
							fontSize: `${style.font.titleSizes.h1}pt`,
						}"
						class="text-2xl font-bold">
					{{ data.name }}
				</h1>

				<h2
						:style="{
							color: style.colors.text.subtitle,
							fontSize: `${style.font.titleSizes.h2}pt`,
						}"
						class="text-xl font-semibold">
					{{ data.subtitle }}
				</h2>

				<ul class="flex flex-wrap items-center gap-1">
					<template
							v-for="link in data.links.value"
							:key="link.url">
						<li class="flex flex-wrap items-center gap-1">
							<ULink
									:style="{ color: style.colors.text.base }"
									class="flex flex-wrap items-center gap-1"
									:to="link.url">
								<UIcon
										v-if="link.icon && link.icon.icon"
										:name="link.icon.icon"
										:size="style.font.size * 1.5"
										class="shrink-0"/>
								<span class="shrink">{{ link.icon!.value === "website" ? link.name : link.icon!.label }}</span>
							</ULink>
						</li>

						<li
								v-if="link !== data.links.value.at(-1)"
								class="flex items-center pl-1">
							<UIcon
									name="i-lucide-dot"
									:size="style.font.size * 1.75"
									class="-ml-1.5"/>
						</li>
					</template>
				</ul>
			</div>

			<!-- Professional Summary -->

			<div
					v-if="style.sections.major.summary.enabled"
					class="flex flex-col gap-1">
				<HSeparator label="Professional Summary" icon="i-lucide-file-text" />
				<p>{{ data.summary }}</p>
			</div>

			<!-- Education -->

			<div
					v-if="style.sections.major.education.enabled"
					class="flex flex-col">
				<HSeparator label="Education" icon="i-lucide-graduation-cap" />

				<div
						v-for="(education, edIndex) in data.education.value"
						:key="education.degree"
						class="relative flex flex-col gap-1 pl-5.5 nth-[2]:mt-1 not-last:pb-2">
					<div
							class="absolute w-3 h-3 top-1 left-1.5 -translate-x-1/2 border rounded-full z-20"
							:style="{
									backgroundColor: style.colors.bg,
									borderColor: style.colors.text.base,
								}"/>

					<div
							class="absolute w-px top-1.5 left-1.5 -translate-x-1/2 z-10"
							:class="edIndex === data.education.value.length - 1 ? 'h-[calc(100%-0.5rem)]' : 'h-full'"
							:style="{
									backgroundColor: style.colors.text.base,
							}"/>

					<div class="flex flex-wrap justify-between items-center gap-1">
						<h3 class="font-bold">
							{{ data.institutions.value.find((i) => i.uuid === education.institution)?.name }}
						</h3>

						<div class="flex items-center gap-1">
							<UIcon name="i-lucide-clock" :size="style.font.size * 1.5"/>
							<span>
									{{ education.start?.month?.toString().padStart(2, '0') }}.{{ education.start?.year }} - {{ education.active && !education.end ? "Present" : `${education.active ? "(" : ""}${education.end?.month?.toString().padStart(2, '0')}.${education.end?.year}${education.active ? ")" : ""}` }}
								</span>
						</div>
					</div>

					<div class="flex flex-wrap justify-between items-center gap-1">
						<div class="flex items-center gap-1 grow">
							<UIcon name="i-lucide-award" :size="style.font.size * 1.5"/>
							<h3 class="font-bold">
								{{ education.degree }}
							</h3>
							<span class="grow"/>
							<span
									v-if="education.active"
									class="py-px px-1.5 rounded-md"
									:style="{
										backgroundColor: style.colors.active,
									}">
								Active
							</span>
						</div>
					</div>

					<p>{{ education.text }}</p>
				</div>
			</div>

			<!-- Experiences -->

			<div
					v-if="style.sections.major.experience.enabled"
					class="flex flex-col">
				<HSeparator label="Work Experience" icon="i-lucide-graduation-cap" />

				<div
						v-for="(experience, exIndex) in data.experience.value"
						:key="experience.position"
						class="relative flex flex-col gap-1 pl-5.5 nth-[2]:mt-1 not-last:pb-2">
					<div
							class="absolute w-3 h-3 top-1 left-1.5 -translate-x-1/2 border rounded-full z-20"
							:style="{
									backgroundColor: style.colors.bg,
									borderColor: style.colors.text.base,
								}"/>

					<div
							class="absolute w-px top-1.5 left-1.5 -translate-x-1/2 z-10"
							:class="exIndex === data.experience.value.length - 1 ? 'h-[calc(100%-0.5rem)]' : 'h-full'"
							:style="{
									backgroundColor: style.colors.text.base,
							}"/>

					<div class="flex flex-wrap justify-between items-center gap-1">
						<h3 class="font-bold">
							{{ experience.position }}
						</h3>

						<div class="flex items-center gap-1">
							<UIcon name="i-lucide-clock" :size="style.font.size * 1.5"/>
							<span>
									{{ experience.start?.month?.toString().padStart(2, '0') }}.{{ experience.start?.year }} - {{ experience.active && !experience.end ? "Present" : `${experience.active ? "(" : ""}${experience.end?.month?.toString().padStart(2, '0')}.${experience.end?.year}${experience.active ? ")" : ""}` }}
								</span>
						</div>
					</div>

					<div class="flex flex-wrap justify-between items-center gap-1">
						<div class="flex items-center gap-1 grow">
							<UIcon name="i-lucide-building-2" :size="style.font.size * 1.5"/>
							<h3 class="font-bold">
								{{ data.institutions.value.find((i) => i.uuid === experience.institution)?.name }}
							</h3>
							<span class="grow"/>
							<span
									v-if="experience.internship"
									class="py-px px-1.5 rounded-md"
									:style="{
										backgroundColor: style.colors.internship,
									}">
								Internship
							</span>
							<span
									v-if="experience.active"
									class="py-px px-1.5 rounded-md"
									:style="{
										backgroundColor: style.colors.active,
									}">
								Active
							</span>
						</div>
					</div>

					<p>{{ experience.text }}</p>

					<div
							v-if="experience.technologies.length > 0"
							class="flex flex-wrap gap-1">
						<UIcon
								v-for="(t, tIndex) in experience.technologies"
								:key="tIndex"
								:style="{
									color: style.colors.techLogos,
								}"
								size="medium"
								:name="t.icon"/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>