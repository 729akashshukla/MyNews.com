import { errors } from "@vinejs/vine";

export class CustomErrorReporter {
    constructor() {
        this.hasErrors = false;
        this.errors = [];
    }

    report(message, rule, field, meta) {
        this.hasErrors = true;
        this.errors.push({ field: field.wildCardPath, message });
    }

    createError() {
        return new errors.E_VALIDATION_ERROR(this.errors);
    }
}
