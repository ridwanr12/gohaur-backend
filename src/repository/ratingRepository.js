import models from '../models/index.js';
const { Rating, Store } = models;

async function findByStoreId(storeId) {
  return await Rating.findOne({
    where: { store_id: storeId },
    include: [{
      model: Store,
      attributes: ['id', 'name', 'description']
    }]
  });
}

async function createOrUpdate(storeId, newRating) {
  // Find or create rating entry for the store
  const [rating, created] = await Rating.findOrCreate({
    where: { store_id: storeId },
    defaults: {
      store_id: storeId,
      average_rating: newRating,
      amount: 1
    }
  });

  // If rating entry already exists, update it
  if (!created) {
    const newAverage = (rating.average_rating * rating.amount + newRating) / (rating.amount + 1);
    await rating.update({
      average_rating: parseFloat(newAverage.toFixed(2)),
      amount: rating.amount + 1
    });
    return await findByStoreId(storeId);
  }

  return rating;
}

async function recalculateOnDelete(storeId, deletedRating) {
  const rating = await Rating.findOne({ where: { store_id: storeId } });
  if (!rating) return null;

  // If this was the only rating, reset to 0
  if (rating.amount <= 1) {
    await rating.update({
      average_rating: 0,
      amount: 0
    });
    return rating;
  }

  // Recalculate average: (avg * count - deleted_rating) / (count - 1)
  const newAverage = (rating.average_rating * rating.amount - deletedRating) / (rating.amount - 1);
  await rating.update({
    average_rating: parseFloat(newAverage.toFixed(2)),
    amount: rating.amount - 1
  });

  return await findByStoreId(storeId);
}

export {
  findByStoreId,
  createOrUpdate,
  recalculateOnDelete
};