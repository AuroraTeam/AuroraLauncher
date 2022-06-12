export default class UnixHelper {
    static convertUnixToDate(unixTime: number): string {
        if (unixTime == -1) return `∞`

        const date = new Date(unixTime),
            year = date.getFullYear(),
            month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1,
            day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate(),
            hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
            mins = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()

        return `${day}.${month}.${year}, ${hour}:${mins}`
    }
}
