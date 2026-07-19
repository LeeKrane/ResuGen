// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: {enabled: true},

    modules: [
        '@nuxt/ui',
        '@nuxt/eslint',
        '@nuxt/image',
        'nuxt-particles',
        '@nuxtjs/supabase',
        'nuxt-security',
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

    nitro: {
        externals: {
            inline: [],
            external: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas'],
        },
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
	security: {
        headers: {
            contentSecurityPolicy: {
                'default-src': ["'self'"],
                'script-src': ["'self'", "'nonce-{{nonce}}'"],
                'script-src-attr': ["'none'"],
                'style-src': ["'self'", "'unsafe-inline'"],
                'img-src': ["'self'", "data:", "blob:", "https://ui.nuxt.com", "https://picsum.photos", "https://fastly.picsum.photos"],
                'connect-src': [
                                "'self'",
                                'https://heklocdxpjudwmutdpvb.supabase.co',
                                'wss://heklocdxpjudwmutdpvb.supabase.co',
                    	        'https://api.iconify.design',
                                'https://krane.dev',
                                'http://localhost:3000',
                                'ws://localhost:3000',
                                ],
                'font-src': ["'self'", "data:"],
            },
            permissionsPolicy: {
                "accelerometer": [], // not used on this website
                "ambient-light-sensor": [], // not used on this website
                "autoplay": [], // not used on this website
                "battery": [], // not used on this website
                "camera": [], // not used on this website
                "display-capture": [], // not used on this website
                "document-domain": [], // not used on this website
                "encrypted-media": [], // not used on this website
                "execution-while-not-rendered": [], // not necessary
                "execution-while-out-of-viewport": [], // usage not advisable
                "fullscreen": ["'self'"], // used for fullscreen mode
                "gamepad": [], // not used on this website
                "gyroscope": [], // not used on this website
                "hid": [], // not used on this website
                "idle-detection": [], // tbd - auto logout after inactivity?
                "local-fonts": [], // not used on this website
                "magnetometer": [], // not used on this website
                "microphone": [], // not used on this website
                "midi": [], // not used on this website
                "payment": [], // not used on this website
                "picture-in-picture": [], // not used on this website
                "publickey-credentials-get": ["'self'"], // used for Supabase WebAuthn / Passkeys login
                "screen-wake-lock": [], // not used on this website
                "serial": [], // not used on this website
                "speaker-selection": [], // not used on  this website
                "usb": [], // not used on this website
                "web-share": [], // tbd - could be used for sharing resumes
                "xr-spatial-tracking": [] // not used on this website
            },
            "crossOriginEmbedderPolicy": "credentialless", // TODO: [TEMP] change back to "require-corp" once ui.nuxt.com is no image source anymore
            "crossOriginOpenerPolicy": "same-origin",
            "crossOriginResourcePolicy": "cross-origin",
            "originAgentCluster": "?1",
            "referrerPolicy": "no-referrer",
            "strictTransportSecurity": {
                maxAge: 63072000,
                includeSubdomains: true,
                preload: true
            },
            "xContentTypeOptions": "nosniff",
            "xDNSPrefetchControl": "off",
            "xDownloadOptions": "noopen",
            "xFrameOptions": "SAMEORIGIN",
            "xPermittedCrossDomainPolicies": "none",
            "xXSSProtection": "1; mode=block"
        },
        rateLimiter: false,
        requestSizeLimiter: {
            "maxRequestSizeInBytes": 1000000,
            "maxUploadFileRequestInBytes": 10000000,
            "throwError": true
        },
        xssValidator: false,
        corsHandler: false,
        allowedMethodsRestricter: {
            methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
        },
        basicAuth: false,
        csrf: false,
        hidePoweredBy: true,
        removeLoggers: true,
        sri: true,
	},
    routeRules: {
        '/api/recovery-codes/verify': {
            security: {
                rateLimiter: {
                    tokensPerInterval: 5,
                    interval: 60_000, // 1 min
                    headers: true,
                    // if you run behind Cloudflare later:
                    // ipHeader: 'cf-connecting-ip',
                },
            },
        },
    }
})