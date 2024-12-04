export function validateRequiredFields(fields) {
    const missingFields = Object.keys(fields).filter(
        (key) => fields[key] === undefined || fields[key] === null || fields[key] === ""
    );

    if (missingFields.length > 0) {
        return `The following fields are required and missing: ${missingFields.join(", ")}`;
    }
    return null;
}