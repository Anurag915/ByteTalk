export function formatMessageTime(data){
    return new Date(data).toLocaleTimeString("en-US", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

export function formatDateSeparator(date) {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (messageDate.getTime() === today.getTime()) {
        return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
        return "Yesterday";
    } else {
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }
}