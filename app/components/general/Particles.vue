<script setup lang="ts">
const options = {
	fpsLimit: 60,
	fullScreen: {
		enable: false,
		zIndex: -50
	},
	background: {
		color: {
			value: "transparent"
		}
	},
	particles: {
		number: {
			value: 200,
			density: {
				enable: true,
				value_area: 800
			}
		},
		links: {
			enable: true,
			distance: 100,
			color: "#b8b8b8",
			opacity: 0.2,
			width: 0.5
		},
		color: {
			value: "#b8b8b8"
		},
		shape: {
			type: "circle",
		},
		opacity: {
			value: 0.3,
			random: true,
			anim: {
				enable: true,
				speed: 1,
				opacity_min: 0,
				sync: false
			}
		},
		size: {
			value: 1.5,
			random: true,
		},
		move: {
			enable: true,
			speed: 0.3,
			direction: "none",
			random: true,
			straight: false,
			out_mode: "out",
			bounce: false,
		}
	},
	interactivity: {
		events: {
			resize: true
		}
	}
}
</script>

<template>
	<NuxtParticles
		class="fixed inset-0 -z-50"
		id="tsparticles"
		:options="options"
	/>
</template>
