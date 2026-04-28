import User from './User.js';
import Family from './Family.js';
import Recipe from './Recipe.js';
import MealPlan from './MealPlan.js';
import ShoppingList from './ShoppingList.js';
import ShoppingItem from './ShoppingItem.js';
import AuditLog from './AuditLog.js';
import FamilyInvite from './FamilyInvite.js';

// Associations
User.belongsTo(Family, { foreignKey: 'family_id' });
Family.hasMany(User, { foreignKey: 'family_id' });
Family.belongsTo(User, { foreignKey: 'owner_id' });

Recipe.belongsTo(Family, { foreignKey: 'family_id' });
Family.hasMany(Recipe, { foreignKey: 'family_id' });

MealPlan.belongsTo(Family, { foreignKey: 'family_id' });
MealPlan.belongsTo(Recipe, { foreignKey: 'recipe_id' });
MealPlan.belongsTo(User, { foreignKey: 'created_by' });
Family.hasMany(MealPlan, { foreignKey: 'family_id' });

ShoppingList.belongsTo(Family, { foreignKey: 'family_id' });
ShoppingList.belongsTo(User, { foreignKey: 'created_by' });
Family.hasMany(ShoppingList, { foreignKey: 'family_id' });

ShoppingItem.belongsTo(ShoppingList, { foreignKey: 'list_id' });
ShoppingList.hasMany(ShoppingItem, { foreignKey: 'list_id' });

AuditLog.belongsTo(Family, { foreignKey: 'family_id' });
Family.hasMany(AuditLog, { foreignKey: 'family_id' });

FamilyInvite.belongsTo(Family, { foreignKey: 'family_id' });
FamilyInvite.belongsTo(User, { foreignKey: 'invited_by', as: 'InvitedBy' });
Family.hasMany(FamilyInvite, { foreignKey: 'family_id' });

export { User, Family, Recipe, MealPlan, ShoppingList, ShoppingItem, AuditLog, FamilyInvite };
