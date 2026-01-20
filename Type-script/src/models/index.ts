import { Sequelize } from 'sequelize';
// import sequelize from '../db'; // Import the singleton connection instance
import { User } from '../models/user';
import { Task } from './task';
// import { Project } from './Project';

// -----------------------------------------------------------------------------
// 1. Define Associations (Relationships)
// -----------------------------------------------------------------------------
// It is best practice to define associations here rather than inside the model 
// files. This prevents circular dependency errors when Model A needs Model B.

// User has Many Projects
// User.hasMany(Project, {
//   sourceKey: 'id',
//   foreignKey: 'userId',
//   as: 'projects', // This alias must match the mixin names in your User model
// });

// Project belongs to User
// Project.belongsTo(User, {
//   targetKey: 'id',
//   foreignKey: 'userId',
//   as: 'user', // This alias must match the mixin names in your Project model
// });

// -----------------------------------------------------------------------------
// 2. Wrap Models into a "db" Object (Optional but useful)
// -----------------------------------------------------------------------------
// This mimics the old 'const db = ...' behavior if you prefer accessing 
// models via `db.User` instead of importing them directly.
const db = {
  // sequelize, // The instance
  // Sequelize, // The library
  User,
  Task,
  // Project,
};

// -----------------------------------------------------------------------------
// 3. Exports
// -----------------------------------------------------------------------------
// We export the `db` object as default, but also export individual models 
// (Recommended) so you can do: `import { User } from './models';`
export { User, Task };
export default db;