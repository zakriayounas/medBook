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


export const convertToSQLDatetime = (dateString, timeString) => {
    // Combine date and time into a single string
    const dateTimeString = `${dateString} ${timeString}`;

    // Parse the date and time exactly as given by the user, without converting to UTC
    const formattedDateTime = moment(dateTimeString, "YYYY-MM-DD hh:mm A").format("YYYY-MM-DD HH:mm:ss");

    // Return the formatted date time in the SQL-compatible format
    return formattedDateTime;
};
