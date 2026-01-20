const db = require('../../app/db/models');
const enums = require('./enums');
const { status } = require('./messages/api.response');
const common = require('./common-function');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

module.exports = {
    async startTransaction() {
        const transaction = await db.sequelize.transaction();
        return { transaction };
    },
    async commitTransaction(transaction) {
        await transaction.commit();

        return true;
    },
    async rollbackTransaction(transaction, session) {
        try {
            await transaction.rollback();

            if (session) {
                await session.abortTransaction();
                session.endSession();
            }
            return true;
        } catch (err) {
            // eslint-disable-next-line no-console
            if (process.env.NODE_ENV !== 'production') console.log('Error In rolling back transaction:', err.message);
            return false;
        }
    },
    async getPermissionByToken(user) {
        try {
            let permissions = [];
            if (user?.Role?.isSystemAdmin) {
                permissions = await db.Module.findAll({
                    attributes: [['id', 'moduleId']],
                    // raw: true,
                });
            } else {
                permissions = await db.Permission.findAll({
                    attributes: ['moduleId'],
                    where: {
                        roleId: user.roleId,
                    },
                    include: [
                        {
                            model: db.Module,
                            as: 'Module',
                            attributes: [],
                            where: {
                                status: enums.Status.Active,
                            },
                        },
                    ],
                    // raw: true,
                });
            }

            permissions = JSON.parse(JSON.stringify(permissions));
            const moduleIds = permissions.map((i) => i.moduleId);
            return moduleIds;
        } catch (err) {
            Promise.reject(err);
        }
    },

    async myBulkUpdate(dataToUpdate, modelName, referenceField, transaction) {
        let ids = dataToUpdate.map((m1) => `'${m1[referenceField]}'`);
        let singleFields = 'SET ';

        let keys = Object.keys(dataToUpdate[0]).filter((f1) => f1 != referenceField);

        keys.forEach((element, index) => {
            singleFields = singleFields + ` ${element} = CASE `;
            dataToUpdate.map((m1) => {
                let myValue;

                if (m1[element]) {
                    myValue = `'${m1[element]}'`;
                } else {
                    myValue = null;
                }

                singleFields = singleFields + `WHEN ${referenceField} = '${m1[referenceField]}' THEN ${myValue} `;
            });

            singleFields = singleFields + `ELSE ${element} END`;

            index != keys.length - 1 ? (singleFields = singleFields + ', ') : '';
        });

        const [results, metadata] = await db.sequelize.query(
            `
            UPDATE ${modelName.tableName}
            ${singleFields}
            WHERE
            id IN(${ids});
            `,
            {
                type: db.sequelize.QueryTypes.UPDATE,
                transaction,
            }
        );

        return { results, metadata };
    },
    async hasAnyChildren(rowInstance, exclude = []) {
        try {
            // Get model name from row instance
            let modelName = rowInstance.constructor.name;

            // Get all associations for model
            let associations = db[modelName].associations;

            // Filtering only HasMany relation
            const hasManyAssociations = Object.values(associations).filter((association) => association.associationType === 'HasMany');

            // Get the associated model names
            const associatedModelData = hasManyAssociations.map((association) => {
                let data = {
                    model: association.target.name,
                    foreignKey: association.foreignKey,
                    count: association.accessors.count,
                };
                return data;
            });

            let childrenData = [];

            // Check if data exist for each HasMany relation
            for (const row of associatedModelData) {
                if (exclude.includes(row.model)) continue;
                let currentModel = db[row.model];
                let whereCondition = {};

                whereCondition[row.foreignKey] = rowInstance.id;
                if (Object.keys(currentModel.rawAttributes).includes('deletedAt')) {
                    whereCondition.deletedAt = null;
                }
                try {
                    let count = await currentModel.count({
                        where: {
                            ...whereCondition,
                        },
                    });
                    if (count != 0) {
                        // If row count > 0 then add in array
                        childrenData.push({
                            model: row.model,
                            childrenCount: count,
                        });

                        // Break loop when first relation with row count > 0 is found.
                        break;
                    }
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.log('some error', err);
                }
            }

            let hasChildren = childrenData?.length > 0 ? true : false;
            return Promise.resolve({
                hasChildren: hasChildren,
                message: hasChildren ? `Data is associated with this ${modelName}` : 'No children available.',
            });
        } catch (err) {
            return Promise.reject(err);
        }
    },

    async checkUniqueFields(input) {
        try {
            // const sampleInput = {
            //     model: db.User,
            //     id: null,
            //     fields: [
            //         {
            //             field: 'email',
            //             value: 'jay@gmail.com',
            //             name: 'Email',
            //         },
            //         {
            //             field: 'mobile',
            //             value: '4',
            //             name: 'Mobile',
            //         },
            //         {
            //             field: 'aadhaarCard',
            //             value: '4',
            //             name: 'Aadhaar Card',
            //         },
            //     ],
            // };

            let whereCondition = {};

            const fieldObj = {};

            input.fields.forEach((m1) => {
                fieldObj[m1.field] = m1.value;
            });
            whereCondition = {
                [Op.or]: fieldObj,
            };

            if (input.whereCondition && input.whereCondition.length > 0) {
                input.whereCondition.forEach((m1) => {
                    whereCondition[m1.field] = m1.value;
                });
            }

            if (input?.exclude) {
                whereCondition.id = {
                    [Op.notIn]: input.exclude,
                };
            }

            const response = await db[input.model].findOne({
                where: {
                    deletedAt: null,
                    ...whereCondition,
                },
                raw: true,
            });

            if (response) {
                let notUnique = [];
                let errorFields = [];
                input.fields.forEach((m1) => {
                    if (m1.value == response[m1.field].toLowerCase()) {
                        notUnique.push(m1.name);
                        errorFields.push({
                            type: 'field',
                            value: m1.value,
                            msg: m1.name + ' already in use.',
                            path: m1.field,
                            location: 'body',
                        });
                    }
                });

                return new Object({
                    status: status.BadRequest,
                    message: `${notUnique.join(', ')} already in use.`,
                    fields: errorFields,
                });
            }
            return new Object({
                status: status.OK,
            });
        } catch (err) {
            common.throwException(err, 'DB Common -> checkUniqueFields');
            return {
                status: status.BadRequest,
                message: err?.message || 'Something went wrong.',
            };
        }
    },

    async checkUniqueFieldsForModule(input) {
        try {
            // const sampleInput = {
            //     model: db.User,
            //     id: null,
            //     fields: [
            //         {
            //             field: 'email',
            //             value: 'jay@gmail.com',
            //             name: 'Email',
            //         },
            //         {
            //             field: 'mobile',
            //             value: '4',
            //             name: 'Mobile',
            //         },
            //         {
            //             field: 'aadhaarCard',
            //             value: '4',
            //             name: 'Aadhaar Card',
            //         },
            //     ],
            // };

            let whereCondition = {};

            const fieldObj = {};

            input.fields.forEach((m1) => {
                fieldObj[m1.field] = m1.value;
            });
            whereCondition = {
                [Op.or]: fieldObj,
            };

            if (input?.exclude) {
                whereCondition.id = {
                    [Op.notIn]: input.exclude,
                };
            }

            const response = await db[input.model].findOne({
                where: {
                    ...whereCondition,
                },
                raw: true,
            });

            if (response) {
                let notUnique = [];
                let errorFields = [];
                input.fields.forEach((m1) => {
                    if (m1.value == response[m1.field].toLowerCase()) {
                        notUnique.push(m1.name);
                        errorFields.push({
                            type: 'field',
                            value: m1.value,
                            msg: m1.name + ' already in use.',
                            path: m1.field,
                            location: 'body',
                        });
                    }
                });

                return new Object({
                    status: status.BadRequest,
                    message: `${notUnique.join(', ')} already in use.`,
                    fields: errorFields,
                });
            }
            return new Object({
                status: status.OK,
            });
        } catch (err) {
            common.throwException(err, 'DB Common -> checkUniqueFields');
            return {
                status: status.BadRequest,
                message: err?.message || 'Something went wrong.',
            };
        }
    },
    async jsonFromModule() {
        let modulesArray = [];
        try {
            const modules = await db.Module.findAll({
                attributes: [
                    'id',
                    [db.sequelize.col('label'), 'title'],
                    [db.sequelize.col('id'), 'dbId'],
                    [db.sequelize.col('route'), 'navLink'],
                    'icon',
                    'parentId',
                    'level',
                ],
                where: {
                    type: { [Op.ne]: enums.ModuleType.Rights },
                    status: enums.Status.Active,
                    route: { [Op.ne]: null },
                },
                raw: true,
            });

            modules.forEach((module) => {
                if (module.parentId == null) {
                    modulesArray.push(module);
                    modulesArray.sort((a, b) => a.level - b.level);
                } else {
                    const parent = modules.find((grandChild) => grandChild.id == module.parentId);
                    if (parent) {
                        if (!parent.children) {
                            parent.children = [];
                        }
                        parent.children.push(module);
                        parent.children.sort((a, b) => a.level - b.level);
                    }
                }
            });

            const jsonFilePath = path.join(__dirname, '../../json-config/menu.json');
            const directoryPath = path.dirname(jsonFilePath);

            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }

            fs.writeFileSync(jsonFilePath, JSON.stringify(modulesArray, null, 2));

            return modulesArray;
        } catch (error) {
            common.throwException(error, 'Create Menu JSON Config File - Common Function');
            return modulesArray;
        }
    },
};
