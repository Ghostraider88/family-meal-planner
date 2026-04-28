import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/authMiddleware.js';
import { ShoppingList, ShoppingItem } from '../models/index.js';

const router = express.Router();
router.use(authenticate);

// Shopping Lists
router.get('/lists', async (req, res, next) => {
  try {
    const lists = await ShoppingList.findAll({
      where: { family_id: req.user.family_id },
      include: [{ model: ShoppingItem }],
    });
    res.json(lists);
  } catch (err) {
    next(err);
  }
});

router.post('/lists', async (req, res, next) => {
  try {
    const { name, store } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const list = await ShoppingList.create({
      id: uuidv4(),
      family_id: req.user.family_id,
      name,
      store: store || null,
      created_by: req.user.id,
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
});

router.get('/lists/:id', async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
      include: [{ model: ShoppingItem }],
    });
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.put('/lists/:id', async (req, res, next) => {
  try {
    const { name, store, store_mode } = req.body;
    const list = await ShoppingList.findOne({
      where: { id: req.params.id, family_id: req.user.family_id },
    });
    if (!list) return res.status(404).json({ error: 'List not found' });

    await list.update({
      name: name || list.name,
      store: store !== undefined ? store : list.store,
      store_mode: store_mode !== undefined ? store_mode : list.store_mode,
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.delete('/lists/:id', async (req, res, next) => {
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
router.get('/lists/:list_id/items', async (req, res, next) => {
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

router.post('/lists/:list_id/items', async (req, res, next) => {
  try {
    const { name, quantity, unit, category, price } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const item = await ShoppingItem.create({
      id: uuidv4(),
      list_id: req.params.list_id,
      name,
      quantity: quantity || null,
      unit: unit || null,
      category: category || null,
      price: price || null,
      item_order: 0,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put('/items/:id', async (req, res, next) => {
  try {
    const { quantity, unit, checked, item_order } = req.body;
    const item = await ShoppingItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await item.update({
      quantity: quantity !== undefined ? quantity : item.quantity,
      unit: unit !== undefined ? unit : item.unit,
      checked: checked !== undefined ? checked : item.checked,
      item_order: item_order !== undefined ? item_order : item.item_order,
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/items/:id', async (req, res, next) => {
  try {
    const item = await ShoppingItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await item.destroy();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
