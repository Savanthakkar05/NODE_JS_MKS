const mongoFilters = async (body) => {
    let conditions = {};

    // For Filter
    if (body?.filter) {
        conditions = await mongoSearchFilters(body?.filter);
    }

    // For Skip And Take
    let skipAndTake = {};
    if (body?.skip !== undefined && body?.take !== undefined) {
        skipAndTake = pagination(body);
    }

    skipAndTake.skip = Number(skipAndTake?.skip) || 0;
    skipAndTake.limit = Number(skipAndTake?.limit) || Number.MAX_SAFE_INTEGER;

    // For Sort
    let sort = {};
    if (body.sort && body.sort?.length > 0) {
        const sortField = body.sort[0]?.selector;
        const sortOrder = body.sort[0]?.desc === true ? -1 : 1;
        sort[sortField] = sortOrder;
    } else {
        sort.createdAt = -1;
    }

    if (body.group && body.group.length > 0) {
        const groupField = body.group[0].selector;
        const groupOrder = body.group[0].desc === true ? -1 : 1;
        sort[groupField] = groupOrder;
    }

    let result = {
        skip: skipAndTake.skip,
        limit: skipAndTake.limit,
        sort: sort,
        conditions: conditions,
    };

    return result;
};

//? Common Pagination For Mongo DB
const pagination = (data) => {
    // Default Skip and Take.
    let skipAndTake = {};
    if (data?.skip === 0 || data?.skip) {
        skipAndTake.skip = Number(data.skip);
    }
    if (data?.take) {
        skipAndTake.limit = Number(data.take);
    }

    return skipAndTake;
};

const mongoSearchFilters = async (filters) => {
    const groupSymbols = ['and', 'or'];
    const operator = filters[1];
    let conditions = [];

    // Helper to escape special regex chars in user input
    const escapeRegex = (text) => {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape all special regex chars
    };

    // Direct condition handling (single condition case)
    if (Array.isArray(filters) && filters.length === 3 && !groupSymbols.includes(filters[1])) {
        const [fieldName, operatorName, fieldValue] = filters;
        let condition = null;

        if (operatorName === '=' && (typeof fieldValue === 'string' || typeof fieldValue === 'number' || typeof fieldValue === 'boolean')) {
            condition = { [fieldName]: fieldValue };
        } else if (['>=', '>', '<=', '<'].includes(operatorName) && !isNaN(new Date(fieldValue).getTime())) {
            // Handle date conditions
            const dateValue = new Date(fieldValue);
            const mongoOperator = {
                '>=': '$gte',
                '>': '$gt',
                '<=': '$lte',
                '<': '$lt',
            }[operatorName];
            return { [fieldName]: { [mongoOperator]: dateValue } };
        } else if (operatorName === 'startswith' && typeof fieldValue === 'string') {
            const escaped = escapeRegex(fieldValue);
            const regex = new RegExp('^' + escaped, 'i'); // matches at the start
            condition = { [fieldName]: { $regex: regex } };
        } else if (operatorName === 'endswith' && typeof fieldValue === 'string') {
            const escaped = escapeRegex(fieldValue);
            const regex = new RegExp(escaped + '$', 'i'); // matches at the end
            condition = { [fieldName]: { $regex: regex } };
        } else if (operatorName === '<>' && typeof fieldValue === 'string') {
            const escaped = escapeRegex(fieldValue);
            const regex = new RegExp('^' + escaped + '$', 'i'); // not equal (case-insensitive)
            condition = { [fieldName]: { $not: regex } };
        } else if (operatorName === '<>' && typeof fieldValue === 'number') {
            condition = { [fieldName]: { $ne: fieldValue } };
        } else if (operatorName === 'contains' && typeof fieldValue === 'string') {
            const escaped = escapeRegex(fieldValue);
            const regex = new RegExp(escaped, 'i');
            condition = { [fieldName]: { $regex: regex } };
        } else if (operatorName === 'notcontains' && typeof fieldValue === 'string') {
            const escaped = escapeRegex(fieldValue);
            const regex = new RegExp(escaped, 'i'); // does not contain
            condition = { [fieldName]: { $not: regex } };
        }

        // Return the single condition as an object
        if (condition) return condition;
    }

    // Handle complex filters with 'and', 'or'
    await Promise.all(
        filters
            .filter((i) => !groupSymbols.includes(i)) // Ignore 'and', 'or'
            .map(async (condition) => {
                if (Array.isArray(condition)) {
                    const result = await mongoSearchFilters(condition);
                    return result;
                }
            })
    ).then((results) => {
        conditions = results.filter(Boolean); // Filter out undefined results
    });

    if (operator === 'and') {
        return { $and: conditions };
    } else if (operator === 'or') {
        return { $or: conditions };
    }

    return conditions.length ? conditions[0] : {};
};

module.exports = {
    mongoFilters,
    pagination,
};
