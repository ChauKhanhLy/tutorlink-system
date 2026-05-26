export const getAvatarUrl = (avatar) => {
    if (!avatar) {
        return "https://i.pravatar.cc/150";
    }

    if (avatar.startsWith("http")) {
        return avatar;
    }

    return `http://localhost:3000${avatar}`;
};