import { Sequelize } from 'sequelize';
import config from '../config/config.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdirSync } from 'fs';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false // Set to console.log to see SQL queries
  }
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const models = {};

// Import all model files
const modelFiles = readdirSync(__dirname)
  .filter(file => 
    file.indexOf('.') !== 0 && 
    file !== 'index.js' && 
    file.slice(-3) === '.js'
  );

// Initialize models
for (const file of modelFiles) {
  const modelModule = await import(`./${file}`);
  const model = modelModule.default(sequelize);
  models[model.name] = model;
}

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize };
export default models;
