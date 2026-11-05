// Files in /images are converted to resized WebP at build time.
// "My Film.jpg" -> "My Film.webp"
export function webpName(file) {
    return file.replace(/\.(png|jpe?g|webp)$/i, ".webp");
}
