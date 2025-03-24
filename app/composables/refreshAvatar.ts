export const useRefreshAvatar = (file: File | null) => {
	const previewImage = useState<string | null>("previewImage", () => null)
	const avatar = useState<File | null>("avatar", () => null)
	avatar.value = file

	if (file) {
		const reader = new FileReader()

		reader.onload = () => {
			const img = new Image()
			img.onload = () => {
				const canvas = document.createElement("canvas")
				const ctx = canvas.getContext("2d")

				canvas.width = Math.min(1024, img.width)
				canvas.height = Math.min(1024, img.height)
				ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
				previewImage.value = canvas.toDataURL("image/webp", 0.7)

				canvas.toBlob((blob) => {
					if (blob) {
						avatar.value = new File([blob], "avatar.webp", {
							type: "image/webp"
						})
					}
				}, "image/webp", 0.7)
			}

			img.src = reader.result as string
		}

		reader.readAsDataURL(file)
	} else {
		previewImage.value = null
		avatar.value = null
	}
}