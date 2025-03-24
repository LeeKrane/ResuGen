<script setup lang="ts">
const options = {
	"particles": {
		"number": {
			"value": 100,
			"density": {
				"enable": true,
				"value_area": 800
			}
		},
		"color": {
			"value": "#b8b8b8"
		},
		"shape": {
			"type": "circle",
		},
		"opacity": {
			"value": 0.3,
			"random": true,
			"anim": {
				"enable": true,
				"speed": 1,
				"opacity_min": 0,
				"sync": false
			}
		},
		"size": {
			"value": 1.5,
			"random": true,
		},
		"line_linked": {
			"enable": true,
			"distance": 1200,
			"color": "#b8b8b8",
			"opacity": 1,
			"width": 1
		},
		"move": {
			"enable": true,
			"speed": 0.3,
			"direction": "none",
			"random": true,
			"straight": false,
			"out_mode": "out",
			"bounce": false,
		}
	},
}

const onLoad = (container: any) => {
	// Do something with the container
	container.pause()
	container.play()
}
</script>

<template>
	<NuxtParticles
		class="-z-50"
		id="tsparticles"
		:options="options"
		@load="onLoad"
	></NuxtParticles>
</template>
