import { Sequelize } from "sequelize";
import configobj from './database.config';

const sequelize = new Sequelize(configobj.development);

export default sequelize;