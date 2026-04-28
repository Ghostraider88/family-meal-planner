import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  family_id: {
    type: DataTypes.UUID,
    references: { model: 'Families', key: 'id' },
  },
  action: {
    type: DataTypes.STRING,
  },
  data: {
    type: DataTypes.JSONB,
  },
}, { tableName: 'audit_log' });

export default AuditLog;
