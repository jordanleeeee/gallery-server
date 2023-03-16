export function encode(url: string): string {
    return url.split('/').map(_ => encodeURIComponent(_)).join('/')
}

export function decode(url: string): string {
    return url.split('/').map(_ => decodeURIComponent(_)).join('/')
}
