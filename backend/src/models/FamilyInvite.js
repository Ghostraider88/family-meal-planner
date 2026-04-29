import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FamilyInvite = sequelize.define('FamilyInvite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  family_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  invited_email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },
  invited_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending',
  },
  token: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
  },
}, { tableName: 'family_invites' });

export default FamilyInvite;
