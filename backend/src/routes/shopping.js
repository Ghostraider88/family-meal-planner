import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { ShoppingList, ShoppingItem } from '../models/index.js';

const router = express.Router();
router.use(authenticate);

const isListUuid = param('id').isUUID();
const isListIdParam = param('list_id').isUUID();
const isItemUuid = param('id').isUUID();

const listBodyValidators = [
  body('name').isString().trim().isLength({ min: 1, max: 200 }),
  body('store').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
  body('store_mode').optional().isBoolean(),
];

const itemBodyValidators = [
  body('name').isString().trim().isLength({ min: 1, max: 200 }),
  body('quantity').optional({ nullable: true }).isFloat({ min: 0, max: 1e9 }),
  body('unit').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('category').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('price').optional({ nullable: true }).isFloat({ min: 0, max: 1e9 }),
  body('checked').optional().isBoolean(),
  body('item_order').optional().isInt({ min: 0, max: 1e6 }).toInt(),
];

// Verify item belongs to the authenticated user's family — prevents IDOR
const getItemWithOwnershipCheck = async (itemId, familyId) => {
  return ShoppingItem.findOne({
    where: { id: itemId },
    include: [{
      model: ShoppingList,
      where: { family_id: familyId },
      required: true,
    }],
  });
};

// Shopping Lists
router.get('/lists', async (req, res, next) => {
  try {
    const lists = await ShoppingList.findAll({
      where: { family_id: req.user.family_id },
      include: [{ model: ShoppingItem, order: [['item_order', 'ASC']] }],
    });
    res.json(lists);
  } catch (err) {
    next(err);
  }
});

router.post('/lists', listBodyValidators, validate, async (req, res, next) => {
  try {
    const { name, store } = req.body;
    const list = await ShoppingList.create({
      id: uuidv4(),
      family_id: req.user.family_id,
      name: name.trim(),
      store: store?.trim() || null,
      created_by: req.user.id,
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
});

router.get('/lists/:id', isListUuid, validate, async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
      include: [{ model: ShoppingItem, order: [['item_order', 'ASC']] }],
    });
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.put(
  '/lists/:id',
  [isListUuid, ...listBodyValidators.map((v) => v.optional())],
  validate,
  async (req, res, next) => {
    try {
      const { name, store, store_mode } = req.body;
      const list = await ShoppingList.findOne({
        where: { id: req.params.id, family_id: req.user.family_id },
      });
      if (!list) return res.status(404).json({ error: 'List not found' });

      await list.update({
        name: name?.trim() || list.name,
        store: store !== undefined ? store?.trim() || null : list.store,
        store_mode: store_mode !== undefined ? Boolean(store_mode) : list.store_mode,
      });
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/lists/:id', isListUuid, validate, async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!list) return res.status(404).json({ error: 'List not found' });
    await list.destroy();
    res.json({ message: 'List deleted' });
  } catch (err) {
    next(err);
  }
});

// Shopping Items
router.get('/lists/:list_id/items', isListIdParam, validate, async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({
      where: { id: req.params.list_id, family_id: req.user.family_id },
    });
    if (!list) return res.status(404).json({ error: 'List not found' });

    const items = await ShoppingItem.findAll({
      where: { list_id: req.params.list_id },
      order: [['item_order', 'ASC']],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/lists/:list_id/items',
  [isListIdParam, ...itemBodyValidators],
  validate,
  async (req, res, next) => {
    try {
      const list = await ShoppingList.findOne({
        where: { id: req.params.list_id, family_id: req.user.family_id },
      });
      if (!list) return res.status(404).json({ error: 'List not found' });

      const { name, quantity, unit, category, price } = req.body;
      const maxOrder = await ShoppingItem.max('item_order', { where: { list_id: req.params.list_id } });

      const item = await ShoppingItem.create({
        id: uuidv4(),
        list_id: req.params.list_id,
        name: name.trim(),
        quantity: quantity !== undefined ? parseFloat(quantity) || null : null,
        unit: unit?.trim() || null,
        category: category?.trim() || null,
        price: price !== undefined ? parseFloat(price) || null : null,
        item_order: (maxOrder || 0) + 1,
      });
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/items/:id',
  [isItemUuid, ...itemBodyValidators.map((v) => v.optional())],
  validate,
  async (req, res, next) => {
    try {
      const item = await getItemWithOwnershipCheck(req.params.id, req.user.family_id);
      if (!item) return res.status(404).json({ error: 'Item not found' });

      const { name, quantity, unit, category, checked, item_order } = req.body;
      await item.update({
        name: name?.trim() ?? item.name,
        quantity: quantity !== undefined ? parseFloat(quantity) || null : item.quantity,
        unit: unit !== undefined ? unit?.trim() || null : item.unit,
        category: category !== undefined ? category?.trim() || null : item.category,
        checked: checked !== undefined ? Boolean(checked) : item.checked,
        item_order: item_order !== undefined ? parseInt(item_order, 10) : item.item_order,
      });
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/items/:id', isItemUuid, validate, async (req, res, next) => {
  try {
    const item = await getItemWithOwnershipCheck(req.params.id, req.user.family_id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await item.destroy();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
