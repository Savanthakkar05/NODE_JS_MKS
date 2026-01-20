import sequelize from "./db";

const db_authenticate = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('Database Connected');
    } catch (error : any) {
        console.error('Unable to connect DB due to error', error.message);
        process.exit(1);
    }
}

export default db_authenticate;