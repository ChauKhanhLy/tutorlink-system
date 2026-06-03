export const getAvatarUrl = (avatar) => {
    if (!avatar) {
        return "https://i.pravatar.cc/150";
    }

    if (avatar.startsWith("http")) {
        return avatar;
    }

    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:3000";
    return `${backendUrl}${avatar}`;
};