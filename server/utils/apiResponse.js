// utils/apiResponse.js
export const successResponse = (data, message = "OK") => ({
    success: true,
    message,
    data,
});

export const errorResponse = (message) => ({
    success: false,
    message,
});
