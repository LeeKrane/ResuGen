export type UiFactor = {
    id: string
    type: 'totp'
    friendlyName: string
    status: 'verified' | 'unverified'
}