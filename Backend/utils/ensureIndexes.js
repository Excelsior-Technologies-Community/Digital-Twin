const Twin = require('../models/Twin');
const TwinConversation = require('../models/TwinConversation');

const hasMatchingIndex = (existingIndexes, targetFields) => {
  if (!Array.isArray(existingIndexes)) {
    return false;
  }

  const normalizedTargets = targetFields.map((field) => field.toLowerCase());

  return existingIndexes.some((index) => {
    if (!Array.isArray(index?.fields) || index.fields.length !== normalizedTargets.length) {
      return false;
    }

    return index.fields.every(
      (field, idx) =>
        typeof field?.attribute === 'string' &&
        field.attribute.toLowerCase() === normalizedTargets[idx]
    );
  });
};

const ensureTableIndex = async (queryInterface, existingIndexes, { tableName, name, fields }) => {
  const nameExists =
    Array.isArray(existingIndexes) && existingIndexes.some((index) => index?.name === name);

  if (nameExists || hasMatchingIndex(existingIndexes, fields)) {
    return;
  }

  try {
    await queryInterface.addIndex(tableName, { name, fields });
    console.log(`Created database index ${name} on ${tableName}`);
  } catch (err) {
    const errorCode = err?.parent?.code || err?.original?.code;
    if (errorCode === 'ER_DUP_KEYNAME') {
      return;
    }
    throw err;
  }
};

const ensureDatabaseIndexes = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface();
  const twinsTable = Twin.getTableName();
  const conversationsTable = TwinConversation.getTableName();

  const indexSpecs = [
    {
      tableName: twinsTable,
      name: 'idx_twins_resume_id',
      fields: ['resumeId'],
    },
    {
      tableName: conversationsTable,
      name: 'idx_twin_conversations_twin_created',
      fields: ['twinId', 'createdAt'],
    },
  ];

  const indexesByTable = new Map();

  for (const spec of indexSpecs) {
    if (!indexesByTable.has(spec.tableName)) {
      const existing = await queryInterface.showIndex(spec.tableName);
      indexesByTable.set(spec.tableName, existing);
    }

    await ensureTableIndex(queryInterface, indexesByTable.get(spec.tableName), spec);
  }
};

module.exports = {
  hasMatchingIndex,
  ensureDatabaseIndexes,
};
