export function replaceVariables(content, formData) {
    return content.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
        const key = p1.trim();
        const value = formData[key];
        if (value && value.trim() !== '') {
            return value; // Reemplazo simple sin formato especial
        } else {
            return `[${key.toUpperCase()}]`;
        }
    });
}