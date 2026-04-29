'use strict';

/**
 * Initial baseline schema. Mirrors the model definitions in src/models.
 * Foreign keys are enforced via Sequelize associations at the application
 * layer; database-level FK constraints are intentionally omitted here to
 * avoid creation-order issues across the circular User <-> Family relation.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const { UUID, UUIDV4, STRING, INTEGER, JSONB, BOOLEAN, DECIMAL, DATEONLY, DATE, ENUM } = Sequelize;

    await queryInterface.createTable('families', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      name: { type: STRING, allowNull: false },
      owner_id: { type: UUID },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });

    await queryInterface.createTable('users', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      email: { type: STRING, allowNull: false, unique: true },
      password_hash: { type: STRING, allowNull: false },
      name: { type: STRING, allowNull: false },
      family_id: { type: UUID },
      role: { type: ENUM('owner', 'member'), defaultValue: 'member' },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });
    await queryInterface.addIndex('users', ['family_id']);

    await queryInterface.createTable('recipes', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      family_id: { type: UUID },
      name: { type: STRING, allowNull: false },
      time_minutes: { type: INTEGER },
      servings: { type: INTEGER },
      difficulty: { type: STRING },
      ingredients: { type: JSONB, defaultValue: [] },
      instructions: { type: JSONB, defaultValue: [] },
      tags: { type: JSONB, defaultValue: [] },
      source: { type: STRING },
      images: { type: JSONB, defaultValue: [] },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });
    await queryInterface.addIndex('recipes', ['family_id']);

    await queryInterface.createTable('meal_plans', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      family_id: { type: UUID },
      date: { type: DATEONLY, allowNull: false },
      meal_type: { type: ENUM('breakfast', 'lunch', 'snack', 'dinner'), allowNull: false },
      recipe_id: { type: UUID },
      custom_name: { type: STRING },
      for_people: { type: STRING },
      created_by: { type: UUID },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });
    await queryInterface.addIndex('meal_plans', ['family_id', 'date']);

    await queryInterface.createTable('shopping_lists', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      family_id: { type: UUID },
      name: { type: STRING, allowNull: false },
      store: { type: STRING },
      store_mode: { type: BOOLEAN, defaultValue: false },
      created_by: { type: UUID },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });
    await queryInterface.addIndex('shopping_lists', ['family_id']);

    await queryInterface.createTable('shopping_items', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      list_id: { type: UUID },
      name: { type: STRING, allowNull: false },
      quantity: { type: DECIMAL },
      unit: { type: STRING },
      category: { type: STRING },
      price: { type: DECIMAL },
      checked: { type: BOOLEAN, defaultValue: false },
      item_order: { type: INTEGER },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });
    await queryInterface.addIndex('shopping_items', ['list_id']);

    await queryInterface.createTable('audit_log', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      family_id: { type: UUID },
      action: { type: STRING },
      data: { type: JSONB },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });
    await queryInterface.addIndex('audit_log', ['family_id']);

    await queryInterface.createTable('family_invites', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      family_id: { type: UUID, allowNull: false },
      invited_email: { type: STRING, allowNull: false },
      invited_by: { type: UUID, allowNull: false },
      status: { type: ENUM('pending', 'accepted', 'declined'), defaultValue: 'pending' },
      token: { type: STRING, allowNull: false, unique: true },
      expires_at: { type: DATE },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });
    await queryInterface.addIndex('family_invites', ['family_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('family_invites');
    await queryInterface.dropTable('audit_log');
    await queryInterface.dropTable('shopping_items');
    await queryInterface.dropTable('shopping_lists');
    await queryInterface.dropTable('meal_plans');
    await queryInterface.dropTable('recipes');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('families');

    // Drop ENUM types created by Postgres for ENUM columns
    const sql = `
      DO $$ BEGIN
        DROP TYPE IF EXISTS "enum_users_role";
        DROP TYPE IF EXISTS "enum_meal_plans_meal_type";
        DROP TYPE IF EXISTS "enum_family_invites_status";
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;`;
    await queryInterface.sequelize.query(sql);
  },
};
