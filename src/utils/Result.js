class Result {
    constructor(isSuccess, error, value) {
        this.isSuccess = isSuccess;
        this.error = error;
        this.value = value;
    }

    static ok(value) {
        return new Result(true, null, value);
    }

    static fail(error) {
        return new Result(false, error, null);
    }

    static async from(promise) {
        try {
            const value = await promise;
            return Result.ok(value);
        } catch (error) {
            return Result.fail(error);
        }
    }
}

module.exports = Result;