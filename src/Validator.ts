export enum ValidationReport {
    OK = 1,
    VALUE_IS_NULL,
    TYPE_MISSMATCH,
    VALUE_TOO_BIG,
    VALUE_TOO_SHORT,
    VALUE_INCORRECT,
}

export class Validator {
    static validateObject(fields: string[], object: any) {
        if (!object || typeof object !== "object") return false;
        for (let i of fields) {
            if (!(i in object) || object[i] === undefined) return false;
        }
        return true;
    }
    static convertToType(value: any, type: string) {
        if (value === null || value === undefined) return null;
        if (type === "string") {
            if (typeof value === "object") {
                let result = null;
                try {
                    result = JSON.stringify(value);
                } catch (e) {}
                if (result !== null) return result;
            }
            return value + "";
        }
        if (type === "boolean") {
            if (typeof value === "boolean") return value;
            if (typeof value === "number") return value > 0;
            if (typeof value === "object") return false;
            if (typeof value === "string") return value.toLowerCase() === "true";
        }
        if (type === "date") {
            if (typeof value === "string" || typeof value === "number") return new Date(value);
            return null;
        }
        if (typeof value === "number") return value;
        if (typeof value === "object") return 0;
        const num = parseInt(value + "");
        return num;
    }
    static validateValue(value: any, opt: any) {
        if (value === undefined || value === null) return ValidationReport.VALUE_IS_NULL;
        if (!opt) return ValidationReport.OK;
        if (!opt.type) opt.type = "string";
        if (opt.type === "boolean") {
            if (typeof value === "boolean") return ValidationReport.OK;
            if (typeof value === "number" && (value === 1 || value === 0)) return ValidationReport.OK;
            return ValidationReport.TYPE_MISSMATCH;
        }
        if (opt.type === "number") {
            if (typeof value !== "number") return ValidationReport.TYPE_MISSMATCH;
            if (opt.max && value > opt.max) return ValidationReport.VALUE_TOO_BIG;
            if (opt.min && value < opt.min) return ValidationReport.VALUE_TOO_BIG;
            return ValidationReport.OK;
        }
        if (typeof value !== "string") return ValidationReport.TYPE_MISSMATCH;
        if (opt.max && value.length > opt.max) return ValidationReport.VALUE_TOO_BIG;
        if (opt.min && value.length < opt.min) return ValidationReport.VALUE_TOO_SHORT;
        if (opt.type === "email" && !opt.regex) {
            opt.regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,6}$/g;
        }
        if (opt.regex) {
            const globalRegex = new RegExp(opt.regex.source, opt.regex.flags.includes("g") ? opt.regex.flags : opt.regex.flags + "g");
            const tmp = value.replaceAll(globalRegex, "");
            if (tmp.length !== 0) return ValidationReport.VALUE_INCORRECT;
        }
        return ValidationReport.OK;
    }
}
