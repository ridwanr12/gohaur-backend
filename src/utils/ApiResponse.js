class ApiResponse {
    constructor(data = null, message = 'Success') {
        this.success = true;
        this.timestamp = new Date().toISOString();
        this.message = Array.isArray(message) ? message : [message];
        this.data = data;
    }

    static success(data = null, message = 'Success') {
        return new ApiResponse(data, message);
    }
}

export default ApiResponse;