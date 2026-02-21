type Vector3 = [number, number, number]
export type Vector0to7 = [] | [number] | [number, number] | [number, number, number] | [number, number, number, number] | [number, number, number, number, number] | [number, number, number, number, number, number] | [number, number, number, number, number, number, number]
type Vector9 = [number, number, number, number, number, number, number, number, number]

const multiplyMatrices = (A: Vector9, B: Vector3): Vector3 => {
	return [
		A[0]*B[0] + A[1]*B[1] + A[2]*B[2],
		A[3]*B[0] + A[4]*B[1] + A[5]*B[2],
		A[6]*B[0] + A[7]*B[1] + A[8]*B[2]
	];
}
const oklab2oklch = ([l, a, b]: Vector3): Vector3 => [
	l,
	Math.sqrt(a ** 2 + b ** 2),
	Math.abs(a) < 0.0002 && Math.abs(b) < 0.0002 ? NaN : (((Math.atan2(b, a) * 180) / Math.PI % 360) + 360) % 360
];
const rgb2srgbLinear = (rgb: Vector0to7): Vector3 => rgb.map(c =>
	Math.abs(c) <= 0.04045 ?
		c / 12.92 :
		(c < 0 ? -1 : 1) * (((Math.abs(c) + 0.055) / 1.055) ** 2.4)
) as Vector3;
const xyz2oklab = (xyz: Vector3): Vector3 => {
	const LMS = multiplyMatrices([
		0.8190224379967030, 0.3619062600528904, -0.1288737815209879,
		0.0329836539323885, 0.9292868615863434,  0.0361446663506424,
		0.0481771893596242, 0.2642395317527308,  0.6335478284694309
	], xyz);
	const LMSg = LMS.map(val => Math.cbrt(val)) as Vector3;
	return multiplyMatrices([
		0.2104542683093140,  0.7936177747023054, -0.0040720430116193,
		1.9779985324311684, -2.4285922420485799,  0.4505937096174110,
		0.0259040424655478,  0.7827717124575296, -0.8086757549230774
	], LMSg);
}
const rgbLinear2xyz = (rgb: Vector3): Vector3 => {
	return multiplyMatrices([
		0.41239079926595934, 0.357584339383878,   0.1804807884018343,
		0.21263900587151027, 0.715168678767756,   0.07219231536073371,
		0.01933081871559182, 0.11919477979462598, 0.9505321522496607
	], rgb);
}

export const useRGB2OKLCH = (rgb: Vector0to7) => {
	return oklab2oklch(xyz2oklab(rgbLinear2xyz(rgb2srgbLinear(rgb))))
}