export default function formatDate(date) {
    const notFormattedDate = new Date(date);

    const day = String(notFormattedDate.getDate()).padStart(2, '0');
    const month = String(notFormattedDate.getMonth() + 1).padStart(2, '0');
    const year = notFormattedDate.getFullYear();

    const hours = String(notFormattedDate.getHours()).padStart(2, '0');
    const minutes = String(notFormattedDate.getMinutes() + 1).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}