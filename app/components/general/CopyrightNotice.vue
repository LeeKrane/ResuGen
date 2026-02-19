<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
	<p>&copy; 2025{{ year > 2025 ? `-${year}` : "" }} Krane Development</p>
</template>

<style scoped>

</style>