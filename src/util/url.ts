export function encode(url: string): string {
    console.log("from " + url);
    console.log("to   " + url.split('/').map(_ => encodeURIComponent(_)).join('/'));
    return url.split('/').map(_ => encodeURIComponent(_)).join('/')
}

export function decode(url: string): string {
    console.log("from " + url);
    console.log("to   " + url.split('/').map(_ => decodeURIComponent(_)).join('/'));
    return url.split('/').map(_ => decodeURIComponent(_)).join('/')
}
