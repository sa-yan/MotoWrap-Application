// src/utils/errors.js

/**
 * Extracts a human-readable message from an axios error.
 * Priority: backend { error } field → backend { message } field → network error → fallback
 */
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
    // No internet / server unreachable
    if (!error.response) {
        return 'Cannot connect to server. Check your internet connection.';
    }

    const { status, data } = error.response;
    const serverMessage = data?.error || data?.message;

    // Use the backend message if it exists
    if (serverMessage) return serverMessage;

    // Generic messages for common HTTP codes
    switch (status) {
        case 400: return 'Invalid request. Please check your input.';
        case 401: return 'Session expired. Please log in again.';
        case 403: return 'You do not have permission to do that.';
        case 404: return 'Not found.';
        case 409: return 'Conflict — this action cannot be completed right now.';
        case 500: return 'Server error. Please try again later.';
        default:  return fallback;
    }
};
