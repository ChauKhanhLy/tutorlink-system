import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const up = async () => {
  await sequelize.getQueryInterface().createTable('transactions', {
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
    wallet_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'wallets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    type: {
      type: DataTypes.ENUM('deposit', 'spend', 'refund', 'settlement'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    reference_type: {
      type: DataTypes.ENUM('booking', 'refund', 'settlement'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
    settlement_week: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    settlement_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processed_at: {
      type: DataTypes.DATE,
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
  await sequelize.getQueryInterface().addIndex('transactions', ['user_id']);
  await sequelize.getQueryInterface().addIndex('transactions', ['wallet_id']);
  await sequelize.getQueryInterface().addIndex('transactions', ['type']);
  await sequelize.getQueryInterface().addIndex('transactions', ['settlement_week']);
  await sequelize.getQueryInterface().addIndex('transactions', ['created_at']);
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable('transactions');
};
