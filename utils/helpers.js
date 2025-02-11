import moment from "moment";

export const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const convertTo24Hour = (time) => {
    const [timeStr, period] = time.split(" ");
    let [hours, minutes] = timeStr.split(":").map((val) => parseInt(val));

    if (period === "PM" && hours !== 12) {
        hours += 12;
    } else if (period === "AM" && hours === 12) {
        hours = 0;
    }
    console.log(
        `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`,
        "from time"
    );

    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
};
export const getWeekStartEndDate = () => {
    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() + 7);
    return { currentDate, endDate };
};

export function getDayOfWeek(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getUTCDay()];
}
export const formatToLocalISOString = (appointmentDate) => {
    // Split the input date and time
    const [datePart, timePart] = appointmentDate.split(" ");

    // Extract date and time components
    const [year, month, day] = datePart.split("-");
    const [hours, minutes] = timePart.split(":");

    // Create a new Date object using the local timezone
    const localDate = new Date(
        Number(year),
        Number(month) - 1, // Month is zero-based in JavaScript Date
        Number(day),
        Number(hours),
        Number(minutes)
    );

    // Manually format to "YYYY-MM-DDTHH:mm:ss"
    const formattedDate = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(
        localDate.getDate()
    ).padStart(2, "0")}T${String(localDate.getHours()).padStart(2, "0")}:${String(localDate.getMinutes()).padStart(2, "0")}:00`;

    return formattedDate;
};
