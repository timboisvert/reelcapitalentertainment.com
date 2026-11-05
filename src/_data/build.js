// Build-time values.
export default function () {
    const now = new Date();
    const two = (n) => String(n).padStart(2, "0");
    return {
        year: now.getFullYear(),
        // Script-revision style date, e.g. 11/05/26.
        date: `${two(now.getMonth() + 1)}/${two(now.getDate())}/${two(now.getFullYear() % 100)}`,
    };
}
