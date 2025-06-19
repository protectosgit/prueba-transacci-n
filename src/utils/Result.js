class Result {
    constructor(isSuccess, value, error) {
        this.isSuccess = isSuccess;
        this.value = value;
        this.error = error;
    }

    static ok(value) {
        return new Result(true, value, null);
    }

    static fail(error) {
        return new Result(false, null, error);
    }

    static success(value) {
        return new Result(true, value, null);
    }

    static failure(error) {
        return new Result(false, null, error);
    }

    static async from(promise) {
        try {
            const value = await promise;
            return Result.ok(value);
        } catch (error) {
            return Result.fail(error);
        }
    }

    toString() {
        if (this.isSuccess) {
            return `Success: ${JSON.stringify(this.value)}`;
        }
        return `Error: ${this.error}`;
    }
}

module.exports = Result;