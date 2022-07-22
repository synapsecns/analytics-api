function dateToUnixTimestamp(date: string) {
    try {
        return new Date(date).getTime() / 1000;
    } catch (error) {
        return 0
    }
}

