/**
 * Shared technology matching utility.
 * Maps skill names to known technology dropdown values from TechSelectMenu.
 */

export const KNOWN_TECHNOLOGIES = [
  { label: 'Alpine Linux', value: 'alpine-linux' }, { label: 'Alpine.js', value: 'alpinejs' },
  { label: 'Android', value: 'android' }, { label: 'Angular', value: 'angular' },
  { label: 'Ansible', value: 'ansible' }, { label: 'Apache', value: 'apache' },
  { label: 'Astro', value: 'astro' }, { label: 'AWS', value: 'aws' },
  { label: 'Azure', value: 'azure' }, { label: 'Babel', value: 'babel' },
  { label: 'Bash', value: 'bash' }, { label: 'Bitbucket', value: 'bitbucket' },
  { label: 'Bootstrap', value: 'bootstrap' }, { label: 'Bun', value: 'bun' },
  { label: 'C', value: 'c' }, { label: 'C#', value: 'csharp' },
  { label: 'C++', value: 'cpp' }, { label: 'Cassandra', value: 'cassandra' },
  { label: 'CircleCI', value: 'circleci' }, { label: 'ClickHouse', value: 'clickhouse' },
  { label: 'Cloudflare', value: 'cloudflare' }, { label: 'Confluence', value: 'confluence' },
  { label: 'CSS', value: 'css' }, { label: 'Cypress', value: 'cypress' },
  { label: 'D3.js', value: 'd3' }, { label: 'Debian', value: 'debian' },
  { label: 'Deno', value: 'deno' }, { label: 'Discord', value: 'discord' },
  { label: 'Discord.js', value: 'discordjs' }, { label: 'Django', value: 'django' },
  { label: 'Docker', value: 'docker' }, { label: 'Elastic', value: 'elastic' },
  { label: 'Electron', value: 'electron' }, { label: 'Elixir', value: 'elixir' },
  { label: 'ESLint', value: 'eslint' }, { label: 'Express', value: 'express' },
  { label: 'FastAPI', value: 'fastapi' }, { label: 'Firebase', value: 'firebase' },
  { label: 'Flask', value: 'flask' }, { label: 'Flutter', value: 'flutter' },
  { label: 'Forgejo', value: 'forgejo' }, { label: 'Git', value: 'git' },
  { label: 'Gitea', value: 'gitea' }, { label: 'GitHub', value: 'github' },
  { label: 'GitHub Actions', value: 'github-actions' }, { label: 'GitLab', value: 'gitlab' },
  { label: 'Go', value: 'go' }, { label: 'Gradle', value: 'gradle' },
  { label: 'Grafana', value: 'grafana' }, { label: 'GraphQL', value: 'graphql' },
  { label: 'Hadoop', value: 'hadoop' }, { label: 'Haskell', value: 'haskell' },
  { label: 'Heroku', value: 'heroku' }, { label: 'HTML', value: 'html' },
  { label: 'IntelliJ IDEA', value: 'intellij' }, { label: 'iOS', value: 'ios' },
  { label: 'Java', value: 'java' }, { label: 'JavaScript', value: 'javascript' },
  { label: 'Jenkins', value: 'jenkins' }, { label: 'Jest', value: 'jest' },
  { label: 'Jira', value: 'jira' }, { label: 'jQuery', value: 'jquery' },
  { label: 'Julia', value: 'julia' }, { label: 'Kafka', value: 'kafka' },
  { label: 'Kotlin', value: 'kotlin' }, { label: 'Kubernetes', value: 'kubernetes' },
  { label: 'Laravel', value: 'laravel' }, { label: 'Linux', value: 'linux' },
  { label: 'Lua', value: 'lua' }, { label: 'MariaDB', value: 'mariadb' },
  { label: 'Material UI', value: 'material-ui' }, { label: 'MongoDB', value: 'mongodb' },
  { label: 'MySQL', value: 'mysql' }, { label: 'NestJS', value: 'nestjs' },
  { label: 'Netlify', value: 'netlify' }, { label: 'Next.js', value: 'nextjs' },
  { label: 'Nginx', value: 'nginx' }, { label: 'Node.js', value: 'nodejs' },
  { label: 'npm', value: 'npm' }, { label: 'Nuxt', value: 'nuxt' },
  { label: 'Oracle', value: 'oracle' }, { label: 'PHP', value: 'php' },
  { label: 'Playwright', value: 'playwright' }, { label: 'pnpm', value: 'pnpm' },
  { label: 'PostgreSQL', value: 'postgresql' }, { label: 'PostCSS', value: 'postcss' },
  { label: 'Preact', value: 'preact' }, { label: 'Prettier', value: 'prettier' },
  { label: 'Prisma', value: 'prisma' }, { label: 'Python', value: 'python' },
  { label: 'RabbitMQ', value: 'rabbitmq' }, { label: 'React', value: 'react' },
  { label: 'Redis', value: 'redis' }, { label: 'Remix', value: 'remix' },
  { label: 'Rollup', value: 'rollup' }, { label: 'Ruby', value: 'ruby' },
  { label: 'Ruby on Rails', value: 'ruby-on-rails' }, { label: 'Rust', value: 'rust' },
  { label: 'Sass', value: 'sass' }, { label: 'Scala', value: 'scala' },
  { label: 'Selenium', value: 'selenium' }, { label: 'Slack', value: 'slack' },
  { label: 'Solid.js', value: 'solidjs' }, { label: 'Sourcehut', value: 'sourcehut' },
  { label: 'Spring', value: 'spring' }, { label: 'SQLite', value: 'sqlite' },
  { label: 'Strapi', value: 'strapi' }, { label: 'Supabase', value: 'supabase' },
  { label: 'Subversion', value: 'subversion' }, { label: 'Svelte', value: 'svelte' },
  { label: 'Swift', value: 'swift' }, { label: 'Symfony', value: 'symfony' },
  { label: 'Tailwind', value: 'tailwind' }, { label: 'Terraform', value: 'terraform' },
  { label: 'TypeScript', value: 'typescript' }, { label: 'Ubuntu', value: 'ubuntu' },
  { label: 'Unity', value: 'unity' }, { label: 'Unreal Engine', value: 'unreal-engine' },
  { label: 'Vercel', value: 'vercel' }, { label: 'Vim', value: 'vim' },
  { label: 'Vite', value: 'vite' }, { label: 'VS Code', value: 'vs-code' },
  { label: 'Vue', value: 'vue' }, { label: 'Vuetify', value: 'vuetify' },
  { label: 'Webpack', value: 'webpack' }, { label: 'Windows', value: 'windows' },
  { label: 'Yarn', value: 'yarn' }, { label: 'Zoom', value: 'zoom' },
]

// Build lookup map: lowercase label/value → value
const techLookup = new Map<string, string>()
for (const t of KNOWN_TECHNOLOGIES) {
  techLookup.set(t.label.toLowerCase(), t.value)
  techLookup.set(t.value.toLowerCase(), t.value)
}
// Common aliases
techLookup.set('c++', 'cpp')
techLookup.set('c#', 'csharp')
techLookup.set('node', 'nodejs')
techLookup.set('node.js', 'nodejs')
techLookup.set('react.js', 'react')
techLookup.set('reactjs', 'react')
techLookup.set('vue.js', 'vue')
techLookup.set('vuejs', 'vue')
techLookup.set('next', 'nextjs')
techLookup.set('next.js', 'nextjs')
techLookup.set('nuxt.js', 'nuxt')
techLookup.set('nuxtjs', 'nuxt')
techLookup.set('tailwindcss', 'tailwind')
techLookup.set('tailwind css', 'tailwind')
techLookup.set('postgres', 'postgresql')
techLookup.set('ts', 'typescript')
techLookup.set('js', 'javascript')
techLookup.set('k8s', 'kubernetes')
techLookup.set('gh actions', 'github-actions')
techLookup.set('rails', 'ruby-on-rails')
techLookup.set('ror', 'ruby-on-rails')
techLookup.set('alpine', 'alpinejs')
techLookup.set('d3', 'd3')
techLookup.set('aws', 'aws')

/**
 * Match a skill name to a known technology value.
 * Returns the technology value string, or 'custom' if no match.
 */
export function matchTechnology(skillName: string): string {
  const lower = skillName.trim().toLowerCase()
  return techLookup.get(lower) ?? 'custom'
}

/**
 * Build a full Skill object from a skill name, with proper technology and displayType.
 * Matches against known technologies for icon display; falls back to custom/text.
 */
export function buildSkillFromName(skillName: string): Skill {
  const techValue = matchTechnology(skillName)
  const isCustom = techValue === 'custom'

  const technology: Icon = isCustom
    ? { label: 'Custom', value: 'custom', icon: 'i-lucide-shapes' }
    : { label: skillName, value: techValue, icon: `i-simple-icons-${techValue}` }

  const displayType: Icon = { label: 'Text', value: 'text', icon: 'i-lucide-letter-text' }

  return {
    name: skillName,
    technology,
    displayType,
  }
}
