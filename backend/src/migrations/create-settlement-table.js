import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const up = async () => {
  await sequelize.getQueryInterface().createTable('settlements', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    week_start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    week_end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    settled_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    pending_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'pending',
      allowNull: false
    },
    processed_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Add indexes
  await sequelize.getQueryInterface().addIndex('settlements', ['user_id']);
  await sequelize.getQueryInterface().addIndex('settlements', ['week_start']);
  await sequelize.getQueryInterface().addIndex('settlements', ['status']);
  await sequelize.getQueryInterface().addIndex('settlements', ['created_at']);
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable('settlements');
};
