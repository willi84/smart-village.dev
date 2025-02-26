const { readFile, readdir, writeFile } = require('fs').promises;
const {  existsSync, mkdirSync } = require('fs');
const { toSlug } = require('./slug');
const path = require('path');
const { parseMdToJson } = require('./parseMarkdown');

const helpersDir = path.resolve(__dirname, '..', 'helpers');
// check if helpersGeneric exists

async function getHelpers() {
  const helpers = Object.values({
    ...(await getHelpersFromFiles()),
  });
  helpers.sort((a, b) =>
    a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
  );
  return helpers;
}

async function getHelpersFromFiles() {
  const files1 = (await readdir(helpersDir)).filter((name) =>
    name.endsWith('.json')
  );
  const filesMD = (await readdir(helpersDir)).filter((name) =>
    name.endsWith('.md')
  );
  const texts2 = await Promise.all(
    filesMD.map((name) => readFile(path.join(helpersDir, name)))
  );
  
  const texts = await Promise.all(
    files1.map((name) => readFile(path.join(helpersDir, name)))
  );
  const helpers1 = texts.map((text) => JSON.parse(text));
  const helpers2 = texts2.map((text) => parseMdToJson(text.toString()));

  return Object.fromEntries([...helpers1, ...helpers2].map((h) => [h.name, h]));
}

async function writeHelper(helper) {
  const filePath = path.join(helpersDir, `${toSlug(helper.name)}.json`);
  const data = JSON.stringify(helper, null, 2) + '\n';
  await writeFile(filePath, data);
  return filePath;
}

/**
 * This JSON dump is used by webweekly.email
 */
async function writeHelpers() {
  const helpers = (await getHelpers()).sort((a, b) => {
    return new Date(a.addedAt) > new Date(b.addedAt) ? -1 : 1;
  });
  const filePath = path.join('.', '_site', 'helpers.json');
  const data = JSON.stringify(helpers, null, 2) + '\n';
  await writeFile(filePath, data);
}

function getTags(helpers) {
  return [
    ...helpers.reduce((acc, cur) => {
      cur.tags.forEach((tag) => acc.add(tag));
      return acc;
    }, new Set()),
  ].sort((a, b) => (a < b ? -1 : 1));
}

module.exports.getTags = getTags;
module.exports.getHelpers = getHelpers;
module.exports.helpersDir = helpersDir;
module.exports.writeHelper = writeHelper;
module.exports.writeHelpers = writeHelpers;
