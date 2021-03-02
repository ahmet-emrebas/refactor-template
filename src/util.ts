import { stat } from 'fs-extra';

/**
 * Check the path points at a file, return true if file.
 * @param filepath
 * @returns boolean
 */
export async function isFile(filepath: string) {
  try {
    return (await stat(filepath)).isFile();
  } catch (err) {
    return false;
  }
}

/**
 * Convert text to camel case.
 * @param text a string value with at least two word seperated by dash, space, or underscore.
 */
export function toCamelCase(text: string) {
  const delimeters = ['-', ' ', '_'];
  for (let d of delimeters) {
    const arr = text.split(d);
    if (arr.length > 1) {
      let camelCaseText = '';
      for (let i of arr) {
        camelCaseText += i[0].toUpperCase() + i.slice(1, i.length);
      }
      return camelCaseText;
    }
    return d[0].toUpperCase() + d.slice(1, d.length);
  }
}
