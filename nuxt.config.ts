// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: {enabled: true},

	modules: [
		'@nuxt/ui',
		'@nuxt/eslint',
		'@nuxt/image',
		'nuxt-particles',
		'@nuxtjs/supabase',
	],

	runtimeConfig: {
		// Private keys that are only available server-side
		openaiApiKey: process.env.NUXT_OPENAI_API_KEY || '',
		// Public keys that are exposed to the client
		public: {}
	},

	css: ['~/assets/css/main.css'],

	future: {
		compatibilityVersion: 4
	},

	ui: {
    	colorMode: true,
  	},

	colorMode: {
		preference: 'system',
		fallback: 'dark',
		disableTransition: false
	},

	compatibilityDate: '2024-11-27',

	router: {
		options: {
			scrollBehaviorType: 'smooth'
		}
	},

	particles: {
		mode: "full",
		lazy: true
	},

	icon: {
		mode: "svg"
	},

	supabase: {
		redirectOptions: {
			login: "/login",
			callback: "/me",
			exclude: ["/", "/reset-password", "/register"]
		},
		clientOptions: {
			auth: {
				detectSessionInUrl: true,
			}
		}
	},
})